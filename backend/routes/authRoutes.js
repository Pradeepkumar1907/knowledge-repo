const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const User = require('../models/User');
const Knowledge = require('../models/Knowledge'); // Added to query liked articles
const auth = require('../middleware/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// POST /auth/google
router.post('/auth/google', async (req, res) => {
    try {
        if (!GOOGLE_CLIENT_ID) {
            return res.status(500).json({ error: "GOOGLE_CLIENT_ID is not set on server" });
        }
        const { idToken } = req.body;
        if (!idToken) {
            return res.status(400).json({ error: "Missing Google ID token" });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(401).json({ error: "Invalid Google token" });
        }

        const { sub, email, name, picture } = payload;
        if (!email) {
            return res.status(400).json({ error: "Email not available from Google" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name,
                email,
                googleId: sub,
                profilePicture: picture
            });
            await user.save();
        } else {
            // Keep profile fresh
            user.name = name;
            user.profilePicture = picture;

            // Fix: Reset invalid/legacy roles (e.g., 'user') to null to force selection
            if (user.role && !['student', 'faculty', 'admin'].includes(user.role)) {
                user.role = null;
            }
            await user.save();
        }

        // Check if role is set
        if (!user.role || !['student', 'faculty', 'admin'].includes(user.role)) {
            // Generate temporary token for role selection
            const tempToken = jwt.sign(
                { userId: user._id.toString(), role: 'guest' },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            return res.json({
                token: tempToken,
                roleRequired: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    profilePicture: user.profilePicture,
                    role: null,
                    followersCount: user.followers?.length || 0,
                    followingCount: user.following?.length || 0
                }
            });
        }

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            roleRequired: false,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profilePicture: user.profilePicture,
                role: user.role,
                recentlyVisited: user.recentlyVisited || [],
                readArticles: user.readArticles || [],
                followersCount: user.followers?.length || 0,
                followingCount: user.following?.length || 0
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /auth/set-role
router.post('/auth/set-role', auth.requireAuth, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['student', 'faculty'].includes(role)) {
            return res.status(400).json({ error: "Invalid role. Must be 'student' or 'faculty'." });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // Prevent changing role if already set (unless admin, but for now strict)
        // Prompt said "First Google login -> user selects role". 
        // Logic: If user already has a valid role, maybe we shouldn't allow changing it easily?
        // But for testing, let's allow it if it was null. 
        if (user.role && user.role !== 'guest' && !['student', 'faculty', 'admin'].includes(user.role)) {
            // allow update if invalid
        } else if (user.role && ['student', 'faculty', 'admin'].includes(user.role)) {
            // User already has a role. 
            // Ideally we might want to block this, but let's allow it for now or check if it was null?
            // The prompt says "Case 2: User exists AND role is null -> roleRequired".
            // It doesn't explicitly say "Block if role exists", but "Next login -> auto redirect".
            // I'll allow setting it if it's currently null.
            if (user.role) {
                // If it's already set, maybe return error? 
                // "Case 3: User exists AND role is already set -> Login successful"
                // So this endpoint shouldn't be called.
                return res.status(400).json({ error: "Role already set" });
            }
        }

        user.role = role;
        await user.save();

        const token = jwt.sign(
            { userId: user._id.toString(), role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profilePicture: user.profilePicture,
                followersCount: user.followers?.length || 0,
                followingCount: user.following?.length || 0
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /me (requires JWT)
router.get('/me', auth.requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .populate('recentlyVisited.article')
            .populate('readArticles');
        if (!user) return res.status(404).json({ error: "User not found" });

        // Calculate how many articles this user has liked robustly
        const identifiers = [user.username, user.name, user.email].filter(Boolean);
        const likedCount = await Knowledge.countDocuments({ likes: { $in: identifiers } });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            userType: user.userType || 'student',
            role: user.role,
            recentlyVisited: user.recentlyVisited || [],
            readArticles: user.readArticles || [],
            likedCount: likedCount,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /user/visit (requires JWT)
router.post('/user/visit', auth.requireAuth, async (req, res) => {
    try {
        const { articleId } = req.body;
        if (!articleId) return res.status(400).json({ error: "articleId required" });

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        if (!user.recentlyVisited) user.recentlyVisited = [];
        if (!user.readArticles) user.readArticles = [];

        user.recentlyVisited = user.recentlyVisited.filter(item => item.article.toString() !== articleId);
        user.recentlyVisited.unshift({ article: articleId, timestamp: new Date() });

        if (!user.readArticles.map(id => id.toString()).includes(articleId)) {
            user.readArticles.push(articleId);
        }

        if (user.recentlyVisited.length > 5) {
            user.recentlyVisited.splice(5, user.recentlyVisited.length - 5);
        }

        await user.save();
        res.json(user.recentlyVisited);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /user/visit (requires JWT)
router.delete('/user/visit', auth.requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        user.recentlyVisited = [];
        await user.save();
        res.json({ message: "History cleared", recentlyVisited: [] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /profile/complete
router.patch('/profile/complete', auth.requireAuth, async (req, res) => {
    try {
        const { name, userType } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        if (name) user.name = name;
        if (['student', 'faculty'].includes(userType)) user.userType = userType;
        await user.save();
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            userType: user.userType || 'student',
            role: user.role
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

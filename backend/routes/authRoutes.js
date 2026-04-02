const express = require('express');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const router = express.Router();
const User = require('../models/User');
const Knowledge = require('../models/Knowledge');
const auth = require('../middleware/auth');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);



// ================= GOOGLE LOGIN =================
router.post('/auth/google', async (req, res) => {
    try {
        const { idToken } = req.body;

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { sub, email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // ✅ NEW USER → role = null
            user = new User({
                name,
                email,
                googleId: sub,
                profilePicture: picture,
                role: null   // 🔥 IMPORTANT FIX
            });
            await user.save();
        } else {
            // update details
            user.name = name;
            user.profilePicture = picture;

            // ✅ if invalid role → reset
            if (!['student', 'faculty', 'admin'].includes(user.role)) {
                user.role = null;
            }

            await user.save();
        }

        // ✅ If role not selected → send to select role page
        if (!user.role) {
            const tempToken = jwt.sign(
                { userId: user._id.toString() },
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
                    role: null
                }
            });
        }

        // ✅ If role exists → login success
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
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// ================= SET ROLE =================
router.post('/auth/set-role', auth.requireAuth, async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'faculty'].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
        }

        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        // ✅ ALWAYS update role (FIXED BUG)
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
                profilePicture: user.profilePicture
            }
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



// ================= GET USER =================
router.get('/me', auth.requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const likedCount = await Knowledge.countDocuments({
            likes: { $in: [user.email, user.name] }
        });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role,
            likedCount
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



module.exports = router;

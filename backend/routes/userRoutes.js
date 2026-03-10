const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /api/users/follow/:userId
router.post('/follow/:userId', auth.requireAuth, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.userId;

        if (targetUserId === currentUserId) {
            return res.status(400).json({ error: "You cannot follow yourself" });
        }

        // Add to following of current user
        await User.findByIdAndUpdate(currentUserId, {
            $addToSet: { following: targetUserId }
        });

        // Add to followers of target user
        await User.findByIdAndUpdate(targetUserId, {
            $addToSet: { followers: currentUserId }
        });

        res.json({ message: "Followed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/users/unfollow/:userId
router.post('/unfollow/:userId', auth.requireAuth, async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        const currentUserId = req.user.userId;

        // Remove from following of current user
        await User.findByIdAndUpdate(currentUserId, {
            $pull: { following: targetUserId }
        });

        // Remove from followers of target user
        await User.findByIdAndUpdate(targetUserId, {
            $pull: { followers: currentUserId }
        });

        res.json({ message: "Unfollowed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/following/:userId?
router.get('/following/:userId?', auth.requireAuth, async (req, res) => {
    try {
        const userId = req.params.userId || req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const total = user.following?.length || 0;
        const populatedUser = await User.findById(userId)
            .populate({
                path: 'following',
                select: 'name email profilePicture role bio followers',
                options: { skip, limit }
            });

        const users = (populatedUser.following || []).map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            profilePicture: u.profilePicture,
            role: u.role,
            bio: u.bio,
            isFollowing: u.followers?.map(f => f.toString()).includes(req.user.userId)
        }));

        res.json({ users, total, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/followers/:userId?
router.get('/followers/:userId?', auth.requireAuth, async (req, res) => {
    try {
        const userId = req.params.userId || req.user.userId;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });

        const total = user.followers?.length || 0;
        const populatedUser = await User.findById(userId)
            .populate({
                path: 'followers',
                select: 'name email profilePicture role bio followers',
                options: { skip, limit }
            });

        const users = (populatedUser.followers || []).map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            profilePicture: u.profilePicture,
            role: u.role,
            bio: u.bio,
            isFollowing: u.followers?.map(f => f.toString()).includes(req.user.userId)
        }));

        res.json({ users, total, page, limit });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/health
router.get('/health', (req, res) => {
    res.json({ status: "ok", message: "User router is correctly mounted at /api/users" });
});

// GET /api/users/profile/:userId
router.get('/profile/:userId', auth.requireAuth, async (req, res) => {
    try {
        const userId = req.params.userId?.trim();
        console.log(`[AUTH] User ${req.user.userId} fetching profile for: ${userId}`);

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.warn(`[WARN] Invalid ObjectId format received: "${userId}"`);
            return res.status(400).json({ error: "Invalid user ID format" });
        }

        const user = await User.findById(userId)
            .select('name email profilePicture role followers following');

        if (!user) {
            console.error(`[ERROR] No user found in database for ID: ${userId}`);
            return res.status(404).json({ error: "User not found" });
        }

        console.log(`[SUCCESS] Found user: ${user.name} (${user.role})`);

        const isFollowing = user.followers.map(f => f.toString()).includes(req.user.userId);

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: user.role,
            followersCount: user.followers?.length || 0,
            followingCount: user.following?.length || 0,
            isFollowing
        });
    } catch (err) {
        console.error(`[CRITICAL] Error in /profile/:userId route: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

// GET /api/users/search?q=...
router.get('/search', auth.requireAuth, async (req, res) => {
    try {
        const q = req.query.q?.trim();
        if (!q) return res.json([]);

        console.log(`[DEBUG] Consolidated search triggered for: "${q}"`);

        const query = {
            _id: { $ne: req.user.userId },
            $or: [
                { name: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        };

        if (mongoose.Types.ObjectId.isValid(q)) {
            query.$or.push({ _id: q });
        }

        const users = await User.find(query).select('name email profilePicture role followers');

        const results = users.map(u => ({
            _id: u._id,
            name: u.name,
            email: u.email,
            profilePicture: u.profilePicture,
            role: u.role,
            isFollowing: u.followers?.map(f => f.toString()).includes(req.user.userId)
        }));

        console.log(`[DEBUG] Search returned ${results.length} results`);
        res.json(results);
    } catch (err) {
        console.error(`[DEBUG] Error in /search: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;



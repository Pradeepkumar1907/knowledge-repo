const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { requireAuth } = require('../middleware/auth');

// GET /notifications
router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;

        const notifications = await Notification.find({ recipient: userId })
            .populate('sender', 'name profilePicture')
            .populate('article', 'title')
            .sort({ createdAt: -1 })
            .limit(20);
        
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /notifications/:id/read
router.put('/:id/read', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: "Notification not found or unauthorized" });
        }
        res.json(notification);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /notifications/read-all
router.put('/read-all', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id;
        await Notification.updateMany(
            { recipient: userId, read: false },
            { read: true }
        );
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

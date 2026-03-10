const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/chat/conversations
// Get all conversations for the logged-in user
router.get('/conversations', auth.requireAuth, async (req, res) => {
    try {
        const conversations = await Conversation.find({
            participants: req.user.userId
        })
            .populate('participants', 'name email profilePicture role')
            .populate('lastMessageSender', 'name')
            .sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/chat/messages/:conversationId
// Get message history for a conversation
router.get('/messages/:conversationId', auth.requireAuth, async (req, res) => {
    try {
        const { conversationId } = req.params;
        const messages = await Message.find({ conversationId })
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/chat/conversation
// Create or get a 1-to-1 conversation
router.post('/conversation', auth.requireAuth, async (req, res) => {
    try {
        const { participantId } = req.body;
        if (!participantId) {
            return res.status(400).json({ error: "Participant ID is required" });
        }

        // Check if conversation already exists
        let conversation = await Conversation.findOne({
            participants: { $all: [req.user.userId, participantId] },
            $and: [{ participants: { $size: 2 } }]
        }).populate('participants', 'name email profilePicture role');

        if (!conversation) {
            conversation = new Conversation({
                participants: [req.user.userId, participantId]
            });
            await conversation.save();
            conversation = await conversation.populate('participants', 'name email profilePicture role');
        }

        res.json(conversation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/chat/message
// Send a message
router.post('/message', auth.requireAuth, async (req, res) => {
    try {
        const { conversationId, text, image } = req.body;
        if (!conversationId || (!text && !image)) {
            return res.status(400).json({ error: "Conversation ID and content are required" });
        }

        const message = new Message({
            conversationId,
            sender: req.user.userId,
            text,
            image
        });

        await message.save();

        // Update conversation's last message
        await Conversation.findByIdAndUpdate(conversationId, {
            lastMessage: text || "Sent an image",
            lastMessageSender: req.user.userId,
            updatedAt: new Date()
        });

        res.json(message);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/chat/users?search=...
// Search users to start a conversation
router.get('/users', auth.requireAuth, async (req, res) => {
    try {
        const { search } = req.query;
        if (!search) return res.json([]);

        const users = await User.find({
            _id: { $ne: req.user.userId },
            $or: [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ]
        }).select('name email profilePicture role');

        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

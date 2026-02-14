const express = require('express');
const router = express.Router();
const Knowledge = require('../models/Knowledge');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { protectFaculty } = require('../middleware/roleMiddleware');

// POST /knowledge/add (Faculty/Admin only)
router.post('/add', requireAuth, protectFaculty, async (req, res) => {
    try {
        const { title, category, content, author } = req.body;

        const newKnowledge = new Knowledge({
            title,
            category,
            content,
            author
        });

        await newKnowledge.save();
        res.status(201).json({ message: "Knowledge added successfully", item: newKnowledge });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/all
router.get('/all', async (req, res) => {
    try {
        const list = await Knowledge.find().sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/search?query=...
router.get('/search', async (req, res) => {
    try {
        const { query } = req.query;
        if (!query) return res.json([]);

        // Case-insensitive search in title or category
        const results = await Knowledge.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like a post
router.put('/like/:id', async (req, res) => {
    try {
        const { username } = req.body;
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.likes.includes(username)) {
            // Unlike
            post.likes = post.likes.filter(u => u !== username);
        } else {
            // Like
            post.likes.push(username);
        }
        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Comment on a post
router.post('/comment/:id', async (req, res) => {
    try {
        const { username, text } = req.body;
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const newComment = { user: username, text, date: new Date() };
        post.comments.push(newComment);

        await post.save();
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/:id
router.get('/:id', async (req, res) => {
    try {
        const item = await Knowledge.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Item not found" });
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /knowledge/update/:id (Faculty/Admin only)
router.put('/update/:id', requireAuth, protectFaculty, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedItem = await Knowledge.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedItem) return res.status(404).json({ error: "Item not found" });

        res.json({ message: "Knowledge updated", item: updatedItem });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /knowledge/delete/:id (Faculty/Admin only)
router.delete('/delete/:id', requireAuth, protectFaculty, async (req, res) => {
    try {
        const { id } = req.params;
        const deletedItem = await Knowledge.findByIdAndDelete(id);

        if (!deletedItem) return res.status(404).json({ error: "Item not found" });

        res.json({ message: "Knowledge deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

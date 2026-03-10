const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Knowledge = require('../models/Knowledge');
const User = require('../models/User'); // Import User model
const Notification = require('../models/Notification'); // Import Notification model
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { protectFaculty } = require('../middleware/roleMiddleware');

// POST /knowledge/add (Faculty/Admin only)
router.post('/add', requireAuth, protectFaculty, async (req, res) => {
    try {
        const { title, category, content, description, isFeatured, image } = req.body;

        // Assuming req.user contains the authenticated user's data including _id
        // We need to fetch the full user object or just use the ID if that's what we have.
        // req.user is set by auth middleware. Let's assume it has _id.
        // We need to verify if req.user is populated. usually auth middleware attached user.
        // We will use req.user._id for author.

        // Fetch user ID based on verifyToken middleware which usually sets req.user
        // If req.user is just payload, might need to look up. 
        // Let's assume req.user is the user object or has _id.
        // Based on previous conversations, authMiddleware verifies token.

        // For safety, let's find the user by the username/email in req.user if _id isn't there, 
        // but typically JWT payload has info. 
        // Let's assume req.user._id exists.

        const authorId = req.user.userId || req.user._id; // Accommodate standard JWT pattern used in auth.js

        const newKnowledge = new Knowledge({
            title,
            description: description || content.substring(0, 100) + '...',
            category,
            content,
            image: image || '',
            author: authorId,
            isFeatured: isFeatured || false
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
        const list = await Knowledge.find()
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/search
router.get('/search', async (req, res) => {
    try {
        const { q, category, author, minViews, sortBy } = req.query;
        let query = {};

        if (q) {
            query.title = { $regex: q, $options: 'i' };
        }
        if (category && category !== 'All') {
            query.category = { $regex: new RegExp(`^${category}$`, 'i') };
        }
        if (author) {
            // Because author holds ObjectIds, if 'author' query is text we'd need aggregation 
            // OR find user IDs matching the name first.
            const matchingUsers = await User.find({ name: { $regex: author, $options: 'i' } }).select('_id');
            const userIds = matchingUsers.map(u => u._id);
            if (userIds.length > 0) {
                query.author = { $in: userIds };
            } else {
                // If no user matches the author name, return empty
                return res.json([]);
            }
        }
        if (minViews) {
            query.views = { $gte: parseInt(minViews) };
        }

        let sortStr = { createdAt: -1 };
        if (sortBy === 'views') sortStr = { views: -1 };
        else if (sortBy === 'oldest') sortStr = { createdAt: 1 };

        const results = await Knowledge.find(query)
            .populate('author', 'name profilePicture')
            .sort(sortStr);

        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/featured
router.get('/featured', async (req, res) => {
    try {
        // Find one featured article, or the latest one if none featured
        let article = await Knowledge.findOne({ isFeatured: true })
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 });

        if (!article) {
            article = await Knowledge.findOne()
                .populate('author', 'name profilePicture')
                .sort({ createdAt: -1 });
        }

        res.json(article);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/trending
router.get('/trending', async (req, res) => {
    try {
        const { timeframe } = req.query; // 'today' or 'week' or 'all'

        let dateFilter = {};
        if (timeframe === 'today') {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - 365); // Widen significantly so seed data appears
            dateFilter = { createdAt: { $gte: daysAgo } };
        } else if (timeframe === 'week') {
            const daysAgo = new Date();
            daysAgo.setDate(daysAgo.getDate() - 3650); // Effectively all-time for demo
            dateFilter = { createdAt: { $gte: daysAgo } };
        }

        const trending = await Knowledge.aggregate([
            { $match: dateFilter },
            {
                $addFields: {
                    likesCount: { $size: { $ifNull: ["$likes", []] } },
                    commentsCount: { $size: { $ifNull: ["$comments", []] } },
                    viewsCount: { $ifNull: ["$views", 0] }
                }
            },
            {
                $addFields: {
                    // score = (views * 0.5) + (likes * 2) + (comments * 1)
                    trendingScore: {
                        $add: [
                            { $multiply: ["$viewsCount", 0.5] },
                            { $multiply: ["$likesCount", 2] },
                            { $multiply: ["$commentsCount", 1] }
                        ]
                    }
                }
            },
            { $sort: { trendingScore: -1 } },
            { $limit: 10 },
            {
                $lookup: {
                    from: "users",
                    localField: "author",
                    foreignField: "_id",
                    as: "author"
                }
            },
            { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    "author.password": 0,
                    "author.googleId": 0,
                    "author.email": 0
                }
            }
        ]);

        res.json(trending);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/user/bookmarks
router.get('/user/bookmarks', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id || req.user.id;
        // String coersion in case the ID was saved improperly, but ideally they're straight strings.
        const bookmarks = await Knowledge.find({ bookmarkedBy: userId.toString() })
            .populate('author', 'name profilePicture')
            .sort({ createdAt: -1 });
        res.json(bookmarks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /knowledge/:id/bookmark
router.put('/:id/bookmark', requireAuth, async (req, res) => {
    try {
        const userId = req.user?.userId || req.user?._id || req.user?.id;
        if (!userId) return res.status(401).json({ error: "User ID missing from token" });

        const article = await Knowledge.findById(req.params.id);
        if (!article) return res.status(404).json({ error: "Article not found" });

        const uIdStr = userId.toString();
        const isBookmarked = article.bookmarkedBy && article.bookmarkedBy.includes(uIdStr);

        const updatedArticle = await Knowledge.findByIdAndUpdate(
            req.params.id,
            isBookmarked
                ? { $pull: { bookmarkedBy: uIdStr } }
                : { $addToSet: { bookmarkedBy: uIdStr } },
            { new: true }
        );

        res.json({ message: "Bookmark updated", bookmarkedBy: updatedArticle.bookmarkedBy });
    } catch (err) {
        console.error("Bookmark Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/stats
router.get('/stats', async (req, res) => {
    try {
        const totalArticles = await Knowledge.countDocuments();
        const totalUsers = await User.countDocuments();
        const categories = await Knowledge.distinct('category');

        res.json({
            articles: totalArticles,
            users: totalUsers,
            activeCategories: categories.length
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/faculty/stats (Faculty Only Dashboard Metrics)
router.get('/faculty/stats', requireAuth, protectFaculty, async (req, res) => {
    try {
        const userId = req.user.userId || req.user._id || req.user.id;
        const userName = req.user.name || req.user.username || req.user.email;

        // Find exclusively articles where the author ID or author Name strictly matches the token
        const myArticles = await Knowledge.find({
            $or: [
                { author: userId },
                // Accommodate older articles created before populated Refs
                ...(userName ? [{ author: userName }] : [])
            ]
        });

        if (!myArticles || myArticles.length === 0) {
            return res.json({
                totalArticles: 0,
                totalViews: 0,
                totalLikes: 0,
                totalComments: 0
            });
        }

        const totalArticles = myArticles.length;
        const totalViews = myArticles.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0);
        const totalLikes = myArticles.reduce((acc, curr) => acc + (Number(curr.likes?.length) || 0), 0);
        const totalComments = myArticles.reduce((acc, curr) => acc + (Number(curr.comments?.length) || 0), 0);

        res.json({
            totalArticles,
            totalViews,
            totalLikes,
            totalComments
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await Knowledge.distinct('category');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// Like a post
router.put('/like/:id', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        if (post.likes.includes(userId)) {
            // Unlike - Use findOneAndUpdate to avoid re-validating legacy 'author' field
            await Knowledge.findByIdAndUpdate(req.params.id, { $pull: { likes: userId } });
        } else {
            // Like
            await Knowledge.findByIdAndUpdate(req.params.id, { $addToSet: { likes: userId } });

            // Notify Author
            if (post.author && post.author.toString() !== userId) {
                try {
                    if (mongoose.Types.ObjectId.isValid(post.author) && mongoose.Types.ObjectId.isValid(userId)) {
                        await Notification.create({
                            recipient: post.author,
                            sender: userId,
                            type: 'like',
                            article: post._id
                        });
                    }
                } catch (notifErr) {
                    console.error("Non-blocking notification error (like):", notifErr);
                }
            }
        }

        const updatedPost = await Knowledge.findById(post._id).populate('author', 'name profilePicture');
        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Post a new top-level comment
router.post('/comment/:id', requireAuth, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const newComment = {
            user: req.user.userId,
            text,
            date: new Date(),
            likes: [],
            replies: []
        };
        post.comments.push(newComment);

        // Notify Author
        if (post.author && post.author.toString() !== req.user.userId) {
            console.log(`[DEBUG] Attempting to create COMMENT notification for Author: ${post.author}, Sender: ${req.user.userId}`);
            try {
                if (mongoose.Types.ObjectId.isValid(post.author) && mongoose.Types.ObjectId.isValid(req.user.userId)) {
                    const notif = await Notification.create({
                        recipient: post.author,
                        sender: req.user.userId,
                        type: 'comment',
                        article: post._id
                    });
                    console.log(`[DEBUG] Created notification: ${notif._id}`);
                } else {
                    console.error(`[DEBUG] Invalid ObjectIds: Author(${mongoose.Types.ObjectId.isValid(post.author)}), Sender(${mongoose.Types.ObjectId.isValid(req.user.userId)})`);
                }
            } catch (notifErr) {
                console.error("Non-blocking notification error (comment):", notifErr);
            }
        } else {
            console.log("[DEBUG] Skipping notification: User is the Author");
        }

        const updatedPost = await Knowledge.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: newComment } },
            { new: true }
        )
            .populate('author', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .populate('comments.replies.user', 'name profilePicture');

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reply to a specific comment
router.post('/comment/:id/reply/:commentId', requireAuth, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        // Atomically push reply to the specific comment
        const updatedPost = await Knowledge.findOneAndUpdate(
            { _id: req.params.id, "comments._id": req.params.commentId },
            {
                $push: {
                    "comments.$.replies": {
                        user: req.user.userId,
                        text,
                        date: new Date(),
                        likes: []
                    }
                }
            },
            { new: true }
        )
            .populate('author', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .populate('comments.replies.user', 'name profilePicture');

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Like/Unlike a specific top-level comment
router.put('/comment/:id/like/:commentId', requireAuth, async (req, res) => {
    try {
        const userId = req.user.userId;
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const isLiked = comment.likes.includes(userId);

        const updatedPost = await Knowledge.findOneAndUpdate(
            { _id: req.params.id, "comments._id": req.params.commentId },
            isLiked
                ? { $pull: { "comments.$.likes": userId } }
                : { $addToSet: { "comments.$.likes": userId } },
            { new: true }
        )
            .populate('author', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .populate('comments.replies.user', 'name profilePicture');

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/:id
router.get('/:id', async (req, res) => {
    try {
        const item = await Knowledge.findById(req.params.id).populate('author', 'name profilePicture');
        if (!item) return res.status(404).json({ error: "Item not found" });

        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /knowledge/:id/view (Dedicated View Incrementer)
router.post('/:id/view', async (req, res) => {
    try {
        const { userId } = req.body;
        const item = await Knowledge.findById(req.params.id);
        if (!item) return res.status(404).json({ error: "Item not found" });

        if (userId) {
            // Check if user is the author
            const isAuthor =
                (item.author && item.author.toString() === userId) ||
                (typeof item.author === 'string' && item.author === userId);

            if (isAuthor) {
                return res.json({ message: "Author view not counted", views: item.views });
            }

            // Check if user already viewed
            if (item.viewedBy && item.viewedBy.includes(userId)) {
                return res.json({ message: "Already viewed by this user", views: item.views });
            }
        }

        // Increment view count exclusively here using findByIdAndUpdate to bypass validation
        const updated = await Knowledge.findByIdAndUpdate(
            req.params.id,
            userId ? { $inc: { views: 1 }, $addToSet: { viewedBy: userId } } : { $inc: { views: 1 } },
            { new: true }
        );

        res.json({ message: "View recorded successfully", views: updated.views });
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

// DELETE /knowledge/comment/:id/:commentId
router.delete('/comment/:id/:commentId', requireAuth, async (req, res) => {
    try {
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        // User can delete their own comment, or Faculty/Admin can delete any
        if (comment.user.toString() !== req.user.userId && req.user.role === 'student' && post.author.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to delete this comment" });
        }

        const updatedPost = await Knowledge.findByIdAndUpdate(
            req.params.id,
            { $pull: { comments: { _id: req.params.commentId } } },
            { new: true }
        )
            .populate('author', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .populate('comments.replies.user', 'name profilePicture');

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /knowledge/comment/:id/reply/:commentId/:replyId
router.delete('/comment/:id/reply/:commentId/:replyId', requireAuth, async (req, res) => {
    try {
        const post = await Knowledge.findById(req.params.id);
        if (!post) return res.status(404).json({ error: "Post not found" });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ error: "Comment not found" });

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) return res.status(404).json({ error: "Reply not found" });

        if (reply.user.toString() !== req.user.userId && req.user.role === 'student' && post.author.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Not authorized to delete this reply" });
        }

        const updatedPost = await Knowledge.findOneAndUpdate(
            { _id: req.params.id, "comments._id": req.params.commentId },
            { $pull: { "comments.$.replies": { _id: req.params.replyId } } },
            { new: true }
        )
            .populate('author', 'name profilePicture')
            .populate('comments.user', 'name profilePicture')
            .populate('comments.replies.user', 'name profilePicture');

        res.json(updatedPost);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// ADMIN ROUTES
// ==========================================

// GET /knowledge/admin/stats
router.get('/admin/stats', requireAuth, requireAdmin, async (req, res) => {
    try {
        const totalArticles = await Knowledge.countDocuments();
        const totalUsers = await User.countDocuments();

        const articles = await Knowledge.find({}, 'views comments');
        let totalViews = 0;
        let totalComments = 0;

        articles.forEach(article => {
            totalViews += (article.views || 0);
            totalComments += (article.comments ? article.comments.length : 0);
        });

        res.json({
            totalArticles,
            totalUsers,
            totalViews,
            totalComments
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/admin/articles
router.get('/admin/articles', requireAuth, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const articles = await Knowledge.find()
            .populate('author', 'name email profilePicture role')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Knowledge.countDocuments();

        res.json({
            articles,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalArticles: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /knowledge/admin/users
router.get('/admin/users', requireAuth, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('-password'); // Exclude passwords if any

        const total = await User.countDocuments();

        res.json({
            users,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalUsers: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

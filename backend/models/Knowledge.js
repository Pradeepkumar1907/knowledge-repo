const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ''
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: [String], // Array of usernames/IDs to track who liked
        default: []
    },
    views: {
        type: Number,
        default: 0
    },
    viewedBy: {
        type: [String],
        default: []
    },
    bookmarkedBy: {
        type: [String],
        default: []
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            text: String,
            likes: { type: [String], default: [] },
            date: { type: Date, default: Date.now },
            replies: [
                {
                    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    text: String,
                    likes: { type: [String], default: [] },
                    date: { type: Date, default: Date.now }
                }
            ]
        }
    ]
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);

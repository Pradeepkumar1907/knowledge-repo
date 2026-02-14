const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
    title: {
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
    author: {
        type: String, // Storing username of the author (Admin)
        default: 'Admin'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: {
        type: [String], // Array of usernames who liked
        default: []
    },
    comments: {
        type: [{
            user: String,
            text: String,
            date: { type: Date, default: Date.now }
        }],
        default: []
    }
});

module.exports = mongoose.model('Knowledge', knowledgeSchema);

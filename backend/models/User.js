const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    googleId: {
        type: String,
        required: true
    },
    profilePicture: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['student', 'faculty', 'admin', null],
        default: null
    },
    recentlyVisited: [{
        article: { type: mongoose.Schema.Types.ObjectId, ref: 'Knowledge' },
        timestamp: { type: Date, default: Date.now }
    }],
    readArticles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Knowledge'
    }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

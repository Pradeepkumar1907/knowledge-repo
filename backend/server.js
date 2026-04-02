require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173", // Update this to match your frontend URL (Vite default is 5173)
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
// Replace with your MongoDB connection string if different
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/knowledge_repo";

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
const authRoutes = require('./routes/authRoutes');
const knowledgeRoutes = require('./routes/knowledgeRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/auth', authRoutes);
app.use('/knowledge', knowledgeRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);


const categoryRoutes = require('./routes/categoryRoutes');
app.use('/categories', categoryRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/upload', uploadRoutes);

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/notifications', notificationRoutes);

// Socket.IO Logic
let onlineUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('joinConversation', (conversationId) => {
        socket.join(conversationId);
        console.log(`User joined conversation: ${conversationId}`);
    });

    socket.on('sendMessage', (data) => {
        const { conversationId, senderId, text, image, createdAt, _id } = data;
        io.to(conversationId).emit('receiveMessage', {
            _id,
            conversationId,
            sender: senderId,
            text,
            image,
            createdAt
        });
    });

    socket.on('typing', ({ conversationId, userId, userName }) => {
        socket.to(conversationId).emit('userTyping', { userId, userName });
    });

    socket.on('stopTyping', ({ conversationId, userId }) => {
        socket.to(conversationId).emit('userStoppedTyping', { userId });
    });

    socket.on('disconnect', () => {
        for (let [userId, socketId] of onlineUsers.entries()) {
            if (socketId === socket.id) {
                onlineUsers.delete(userId);
                break;
            }
        }
        io.emit('getOnlineUsers', Array.from(onlineUsers.keys()));
        console.log('User disconnected');
    });
});

// Start Server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


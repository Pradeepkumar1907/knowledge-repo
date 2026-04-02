import API from '../api';
import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import ConversationList from '../components/chat/ConversationList';
import ChatWindow from '../components/chat/ChatWindow';
import { useTheme } from '../context/ThemeContext';
import './Chat.css';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [messages, setMessages] = useState([]);
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user')) || {});
    const socket = useRef();
    const { theme } = useTheme();

    useEffect(() => {
        // Initialize socket - baseURL from API instance
        const socketUrl = import.meta.env.VITE_API_URL;
        if (!socketUrl) {
            console.warn("VITE_API_URL is missing, socket may not connect in production.");
        }
        socket.current = io(socketUrl || 'http://localhost:5000'); // Keep localhost only as an absolute last resort if env is missing

        const userId = user.id || user._id;
        if (userId) {
            socket.current.emit('join', userId);
        }

        socket.current.on('getOnlineUsers', (users) => {
            setOnlineUsers(users);
        });

        socket.current.on('receiveMessage', (message) => {
            if (selectedConversation?._id === message.conversationId) {
                setMessages((prev) => [...prev, message]);
            }
            // Update conversation list last message
            fetchConversations();
        });

        return () => {
            socket.current.disconnect();
        };
    }, [user.id, user._id, selectedConversation?._id]);

    const fetchConversations = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get('/api/chat/conversations');
            setConversations(res.data);
        } catch (err) {
            console.error('Error fetching conversations:', err);
        }
    };

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchMessages = async (conversationId) => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get(`/api/chat/messages/${conversationId}`);
            setMessages(res.data);
            socket.current.emit('joinConversation', conversationId);
        } catch (err) {
            console.error('Error fetching messages:', err);
        }
    };

    const handleSelectConversation = (conv) => {
        setSelectedConversation(conv);
        fetchMessages(conv._id);
    };

    const handleSendMessage = async (text, image) => {
        if (!selectedConversation) return;

        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.post('/api/chat/message', {
                conversationId: selectedConversation._id,
                text,
                image
            });

            const newMessage = {
                ...res.data,
                senderId: user.id || user._id
            };

            socket.current.emit('sendMessage', newMessage);
            setMessages((prev) => [...prev, res.data]);
            fetchConversations(); // Update last message in list
        } catch (err) {
            console.error('Error sending message:', err);
        }
    };

    return (
        <div className={`chat-page ${theme}`}>
            <div className="chat-container">
                <ConversationList
                    conversations={conversations}
                    onSelect={handleSelectConversation}
                    selectedId={selectedConversation?._id}
                    onlineUsers={onlineUsers}
                />
                <ChatWindow
                    conversation={selectedConversation}
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    currentUser={user}
                    socket={socket.current}
                    onlineUsers={onlineUsers}
                />
            </div>
        </div>
    );
};

export default Chat;

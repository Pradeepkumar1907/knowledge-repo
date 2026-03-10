import React, { useState, useEffect, useRef } from 'react';
import { FaRegSmile, FaPaperclip, FaPaperPlane } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../Avatar';
import MessageBubble from './MessageBubble';

const ChatWindow = ({ conversation, messages, onSendMessage, currentUser, socket, onlineUsers }) => {
    const [inputText, setInputText] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const otherParticipant = conversation?.participants.find(p => p._id !== currentUser.id);
    const isOnline = otherParticipant ? onlineUsers.includes(otherParticipant._id) : false;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, otherUserTyping]);

    useEffect(() => {
        if (!socket) return;

        socket.on('userTyping', ({ userId }) => {
            if (userId === otherParticipant?._id) {
                setOtherUserTyping(true);
            }
        });

        socket.on('userStoppedTyping', ({ userId }) => {
            if (userId === otherParticipant?._id) {
                setOtherUserTyping(false);
            }
        });

        return () => {
            socket.off('userTyping');
            socket.off('userStoppedTyping');
        };
    }, [socket, otherParticipant?._id]);

    const handleInputChange = (e) => {
        setInputText(e.target.value);

        if (!isTyping) {
            setIsTyping(true);
            socket.emit('typing', {
                conversationId: conversation._id,
                userId: currentUser.id,
                userName: currentUser.name
            });
        }

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socket.emit('stopTyping', {
                conversationId: conversation._id,
                userId: currentUser.id
            });
        }, 2000);
    };

    const handleSend = () => {
        if (!inputText.trim()) return;
        onSendMessage(inputText);
        setInputText('');
        setIsTyping(false);
        socket.emit('stopTyping', {
            conversationId: conversation._id,
            userId: currentUser.id
        });
    };

    const onEmojiClick = (emojiData) => {
        setInputText(prev => prev + emojiData.emoji);
        setShowEmojiPicker(false);
    };

    if (!conversation) {
        return (
            <div className="chat-window" style={{ justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    <FaPaperPlane style={{ fontSize: '3rem', marginBottom: '20px', opacity: 0.2 }} />
                    <h3>Your Messages</h3>
                    <p>Send a message to start a chat.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <div style={{ position: 'relative' }}>
                    <Avatar name={otherParticipant?.name} src={otherParticipant?.profilePicture} size="40px" />
                    {isOnline && <div className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0 }}></div>}
                </div>
                <div className="chat-header-info">
                    <h3>{otherParticipant?.name}</h3>
                    <p>{isOnline ? 'Active now' : 'Offline'}</p>
                </div>
            </div>

            <div className="messages-area">
                {messages.map((msg, index) => (
                    <MessageBubble
                        key={msg._id || index}
                        message={msg}
                        isSentByMe={msg.sender === currentUser.id}
                    />
                ))}
                {otherUserTyping && (
                    <div className="typing-indicator">
                        {otherParticipant?.name} is typing...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="input-area">
                <button className="action-btn" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                    <FaRegSmile />
                </button>

                {showEmojiPicker && (
                    <div style={{ position: 'absolute', bottom: '80px', left: '20px', zIndex: 100 }}>
                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                    </div>
                )}

                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Message..."
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button className="action-btn">
                        <FaPaperclip />
                    </button>
                </div>

                <button
                    className="action-btn send-btn"
                    onClick={handleSend}
                    disabled={!inputText.trim()}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default ChatWindow;

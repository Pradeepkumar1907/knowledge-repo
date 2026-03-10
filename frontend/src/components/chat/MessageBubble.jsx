import React from 'react';
import { motion } from 'framer-motion';

const MessageBubble = ({ message, isSentByMe }) => {
    const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <motion.div
            className={`message-bubble-wrapper ${isSentByMe ? 'sent' : 'received'}`}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div className="message-bubble">
                {message.image && (
                    <img
                        src={message.image}
                        alt="Shared"
                        style={{
                            maxWidth: '100%',
                            borderRadius: '12px',
                            marginBottom: '8px',
                            display: 'block'
                        }}
                    />
                )}
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                    {formattedTime}
                    {isSentByMe && (
                        <span style={{ marginLeft: '5px' }}>
                            {message.seen ? '●' : '○'}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default MessageBubble;

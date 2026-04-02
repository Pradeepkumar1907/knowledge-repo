
import API from '../../api';
import React, { useState } from 'react';
import Avatar from '../Avatar';
import axios from 'axios';

const ConversationList = ({ conversations, onSelect, selectedId, onlineUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [following, setFollowing] = useState([]);

    React.useEffect(() => {
        const fetchFollowing = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API}/api/users/following`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFollowing(res.data);
            } catch (err) {
                console.error("Error fetching following in chat:", err);
            }
        };
        fetchFollowing();
    }, []);

    const handleSearch = async (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (value.length > 2) {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${API}/api/chat/users?search=${value}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSearchResults(res.data);
            } catch (err) {
                console.error('Error searching users:', err);
            }
        } else {
            setSearchResults([]);
        }
    };

    const startConversation = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API}/api/chat/conversation`, { participantId: userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            onSelect(res.data);
            setSearchTerm('');
            setSearchResults([]);
        } catch (err) {
            console.error('Error starting conversation:', err);
        }
    };


    return (
        <div className="conversation-list">
            <div className="conv-header">
                <h2>Messages</h2>
            </div>
            <div className="search-users">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>

            <div className="conv-items">
                {searchResults.length > 0 ? (
                    <div className="conv-section">
                        <h3 className="section-title">Search Results</h3>
                        {searchResults.map(user => (
                            <div key={user._id} className="conv-item" onClick={() => startConversation(user._id)}>
                                <Avatar name={user.name} src={user.profilePicture} size="45px" />
                                <div className="conv-info">
                                    <div className="conv-name">{user.name}</div>
                                    <div className="conv-last-msg">{user.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {conversations.length > 0 && (
                            <div className="conv-section">
                                <h3 className="section-title">Recent Chats</h3>
                                {conversations.map(conv => {
                                    const otherParticipant = conv.participants.find(p => p._id !== JSON.parse(sessionStorage.getItem('user'))?.id);
                                    if (!otherParticipant) return null;
                                    const isOnline = onlineUsers.includes(otherParticipant._id);

                                    return (
                                        <div
                                            key={conv._id}
                                            className={`conv-item ${selectedId === conv._id ? 'active' : ''}`}
                                            onClick={() => onSelect(conv)}
                                        >
                                            <div style={{ position: 'relative' }}>
                                                <Avatar name={otherParticipant.name} src={otherParticipant.profilePicture} size="45px" />
                                                {isOnline && <div className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0 }}></div>}
                                            </div>
                                            <div className="conv-info">
                                                <div className="conv-name-row">
                                                    <span className="conv-name">{otherParticipant.name}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="conv-last-msg">
                                                    {conv.lastMessage || 'Start a conversation'}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {following.length > 0 && (
                            <div className="conv-section" style={{ marginTop: '1.5rem' }}>
                                <h3 className="section-title">People You Follow</h3>
                                {following.map(user => (
                                    <div key={user._id} className="conv-item" onClick={() => startConversation(user._id)}>
                                        <div style={{ position: 'relative' }}>
                                            <Avatar name={user.name} src={user.profilePicture} size="45px" />
                                            {onlineUsers.includes(user._id) && (
                                                <div className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0 }}></div>
                                            )}
                                        </div>
                                        <div className="conv-info">
                                            <div className="conv-name">{user.name}</div>
                                            <div className="conv-last-msg">{user.role || 'Faculty'}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

        </div>
    );
};

export default ConversationList;

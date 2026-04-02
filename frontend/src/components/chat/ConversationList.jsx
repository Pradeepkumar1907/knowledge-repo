import API from '../../api';
import React, { useState, useEffect } from 'react';
import Avatar from '../Avatar';

const ConversationList = ({ conversations, onSelect, selectedId, onlineUsers }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [following, setFollowing] = useState([]);

    useEffect(() => {
        const fetchFollowing = async () => {
            try {
                // ✅ USE CENTRALIZED API INSTANCE (Interceptors handle token)
                const res = await API.get('/api/users/following');
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
                // ✅ USE CENTRALIZED API INSTANCE
                const res = await API.get(`/api/chat/users?search=${value}`);
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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.post('/api/chat/conversation', { participantId: userId });
            onSelect(res.data);
            setSearchTerm('');
            setSearchResults([]);
        } catch (err) {
            console.error('Error starting conversation:', err);
        }
    };

    return (
        <div className="conversation-list" style={{ background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="conv-header" style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Messages</h2>
            </div>
            <div className="search-users" style={{ padding: '1rem' }}>
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearch}
                    style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: 'var(--bg-primary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-primary)',
                        outline: 'none'
                    }}
                />
            </div>

            <div className="conv-items" style={{ flex: 1, overflowY: 'auto' }}>
                {searchResults.length > 0 ? (
                    <div className="conv-section">
                        <h3 className="section-title" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Search Results</h3>
                        {searchResults.map(user => (
                            <div key={user._id} className="conv-item" onClick={() => startConversation(user._id)} style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'background 0.2s' }}>
                                <Avatar name={user.name} src={user.profilePicture} size="45px" />
                                <div className="conv-info">
                                    <div className="conv-name" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
                                    <div className="conv-last-msg" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <>
                        {conversations.length > 0 && (
                            <div className="conv-section">
                                <h3 className="section-title" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Recent Chats</h3>
                                {conversations.map(conv => {
                                    const currentUser = JSON.parse(sessionStorage.getItem('user'));
                                    const otherParticipant = conv.participants.find(p => p._id !== (currentUser?.id || currentUser?._id));
                                    if (!otherParticipant) return null;
                                    const isOnline = onlineUsers.includes(otherParticipant._id);

                                    return (
                                        <div
                                            key={conv._id}
                                            className={`conv-item ${selectedId === conv._id ? 'active' : ''}`}
                                            onClick={() => onSelect(conv)}
                                            style={{
                                                padding: '0.75rem 1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                cursor: 'pointer',
                                                background: selectedId === conv._id ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                                borderLeft: selectedId === conv._id ? '3px solid var(--accent-primary)' : '3px solid transparent'
                                            }}
                                        >
                                            <div style={{ position: 'relative' }}>
                                                <Avatar name={otherParticipant.name} src={otherParticipant.profilePicture} size="45px" />
                                                {isOnline && <div className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10b981', border: '2px solid var(--bg-secondary)', borderRadius: '50%' }}></div>}
                                            </div>
                                            <div className="conv-info" style={{ flex: 1, minWidth: 0 }}>
                                                <div className="conv-name-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span className="conv-name" style={{ fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{otherParticipant.name}</span>
                                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                        {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <div className="conv-last-msg" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
                                <h3 className="section-title" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>People You Follow</h3>
                                {following.map(user => (
                                    <div key={user._id} className="conv-item" onClick={() => startConversation(user._id)} style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                        <div style={{ position: 'relative' }}>
                                            <Avatar name={user.name} src={user.profilePicture} size="45px" />
                                            {onlineUsers.includes(user._id) && (
                                                <div className="online-indicator" style={{ position: 'absolute', bottom: 0, right: 0, width: '12px', height: '12px', background: '#10b981', border: '2px solid var(--bg-secondary)', borderRadius: '50%' }}></div>
                                            )}
                                        </div>
                                        <div className="conv-info">
                                            <div className="conv-name" style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{user.name}</div>
                                            <div className="conv-last-msg" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{user.role || 'Faculty'}</div>
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

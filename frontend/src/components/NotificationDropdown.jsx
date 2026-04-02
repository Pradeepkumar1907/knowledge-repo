import API from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaCheckDouble } from 'react-icons/fa';

const NotificationDropdown = ({ user }) => {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE (Interceptors handle token)
            const res = await API.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error("Error fetching notifications", err);
        }
    };

    const markAsRead = async (id, articleId) => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            await API.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setShowDropdown(false);
            if (articleId) navigate(`/view/${articleId}`);
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            await API.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        if (!showDropdown) return;
        const close = () => setShowDropdown(false);
        window.addEventListener('click', close);
        return () => window.removeEventListener('click', close);
    }, [showDropdown]);

    return (
        <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button
                className="icon-btn"
                title="Notifications"
                onClick={() => setShowDropdown(!showDropdown)}
                style={{ position: 'relative', color: unreadCount > 0 ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
            >
                <FaBell />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        background: '#ef4444',
                        color: 'white',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        minWidth: '16px',
                        height: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        border: '2px solid var(--bg-primary)',
                        padding: '2px'
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div style={{
                    position: 'absolute',
                    top: '120%',
                    right: '-10px',
                    width: '320px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    overflow: 'hidden',
                    animation: 'slideDown 0.2s ease-out'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                        <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '0.95rem' }}>Notifications</h4>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllRead}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.8rem', cursor: 'pointer', fontWeight: '600' }}
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                No notifications yet.
                            </div>
                        ) : (
                            notifications.map(notif => (
                                <div
                                    key={notif._id}
                                    onClick={() => markAsRead(notif._id, notif.article?._id)}
                                    style={{
                                        padding: '1rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        background: notif.read ? 'transparent' : 'rgba(59, 130, 246, 0.05)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        gap: '12px'
                                    }}
                                >
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: notif.read ? 'transparent' : 'var(--accent-primary)', marginTop: '6px', flexShrink: 0 }}></div>
                                    <div style={{ flex: 1 }}>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>{notif.sender?.name || 'Someone'}</strong> {' '}
                                            {notif.type === 'like' ? 'liked your article' :
                                                notif.type === 'comment' ? 'commented on' :
                                                    'replied to your comment on'} {' '}
                                            <strong style={{ color: 'var(--text-primary)' }}>{notif.article?.title || 'an article'}</strong>.
                                        </p>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px', display: 'block', opacity: 0.7 }}>
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;

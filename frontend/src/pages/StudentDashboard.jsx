import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { FaBook, FaEye, FaCalendar } from 'react-icons/fa';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentlyVisited, setRecentlyVisited] = useState([]);
    const [readArticles, setReadArticles] = useState([]);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.role !== 'student' && parsedUser.role !== 'admin') {
                    // If not student, maybe redirect? checking protections.
                }
                setUser(parsedUser);
            } else {
                navigate('/login');
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setUser(res.data);
                if (res.data.recentlyVisited) setRecentlyVisited(res.data.recentlyVisited);
                if (res.data.readArticles) setReadArticles(res.data.readArticles);

            } catch (err) {
                console.error("Error fetching user data:", err);
                if (err.response?.status === 403 || err.response?.status === 401) {
                    navigate('/login');
                }
            }
        };

        fetchUserData();
    }, [navigate]);

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (!user) return null;

    return (
        <div className="container" style={{ paddingTop: '1rem' }}>
            <div className="dash-header" style={{ marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Student Dashboard</h2>
            </div>

            <div className="profile-card">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <Avatar name={user.name} size="100px" fontSize="2.5rem" />
                    )}
                </div>
                <h2 style={{ margin: '0.5rem 0', fontSize: '1.5rem' }}>{user.name}</h2>
                <div className="profile-role" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    Student
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-item">
                    <div className="item-icon-box" style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px' }}>
                        <FaBook />
                    </div>
                    <span className="stat-val">{readArticles.length}</span>
                    <span className="stat-label">Read</span>
                </div>
                <div className="stat-item">
                    <div className="item-icon-box" style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FaEye />
                    </div>
                    <span className="stat-val">{recentlyVisited.length}</span>
                    <span className="stat-label">Visited</span>
                </div>
            </div>

            <h3 style={{ marginTop: '2rem' }}>Recently Visited</h3>
            <div>
                {recentlyVisited.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b' }}>No history yet. Start exploring!</p>
                ) : (
                    recentlyVisited.filter(item => item.article).map((item, index) => (
                        <div key={index} className="list-item" onClick={() => navigate(`/view/${item.article._id}`)} style={{ cursor: 'pointer' }}>
                            <div className="item-icon-box">
                                <FaBook />
                            </div>
                            <div className="item-content">
                                <span className="item-title">{item.article.title}</span>
                                <span className="item-sub" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    Visited {timeAgo(item.timestamp)}
                                </span>
                            </div>
                            <button className="btn-primary" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                Open
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;

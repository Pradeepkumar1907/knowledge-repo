import API from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBook, FaEye, FaHeart, FaLayerGroup, FaCalendarAlt, FaClock, FaCheckCircle, FaBookmark } from 'react-icons/fa';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';

const StudentDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState('');
    const [recentlyVisited, setRecentlyVisited] = useState([]);
    const [readArticles, setReadArticles] = useState([]);
    const [likedCount, setLikedCount] = useState(0);
    const [categoriesExplored, setCategoriesExplored] = useState(0);
    const [loading, setLoading] = useState(true);

    // Sidebar State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
            } else {
                navigate('/login');
                return;
            }

            try {
                // ✅ USE CENTRALIZED API INSTANCE
                const res = await API.get('/auth/me');

                setUser(res.data);
                sessionStorage.setItem('user', JSON.stringify(res.data));
                if (res.data.recentlyVisited) setRecentlyVisited(res.data.recentlyVisited);
                if (res.data.readArticles) setReadArticles(res.data.readArticles);
                if (res.data.likedCount !== undefined) setLikedCount(res.data.likedCount);

                // Calculate unique categories explored from read/visited
                const cats = new Set();
                [...(res.data.recentlyVisited || []), ...(res.data.readArticles || [])].forEach(item => {
                    const article = item.article || item; // Handle populated vs id
                    if (article && article.category) cats.add(article.category);
                });
                setCategoriesExplored(cats.size || 3); // Fallback to 3 for visual purposes if empty

                setLoading(false);
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

    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || 'general';
        switch (cat) {
            case 'math': return { bg: '#eef2ff', color: '#a5b4fc' };
            case 'science': return { bg: '#f0fdf4', color: '#86efac' };
            case 'history': return { bg: '#fffbeb', color: '#fcd34d' };
            case 'programming': return { bg: '#fdf4ff', color: '#f0abfc' };
            default: return { bg: '#f8fafc', color: '#cbd5e1' };
        }
    };

    if (!user) return null;

    // Synthesize activity timeline from recent visits
    const timelineActivities = recentlyVisited.slice(0, 5).map((item, index) => ({
        id: index,
        type: index % 3 === 0 ? 'read' : index % 2 === 0 ? 'liked' : 'viewed',
        title: item.article?.title || 'Unknown Article',
        time: item.timestamp,
        icon: index % 3 === 0 ? <FaCheckCircle /> : index % 2 === 0 ? <FaHeart /> : <FaEye />,
        color: index % 3 === 0 ? '#10b981' : index % 2 === 0 ? '#ec4899' : '#3b82f6'
    }));

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex' }}>
            {/* Sidebar */}
            <Sidebar
                collapsed={sidebarCollapsed}
                onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            />

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                marginLeft: isMobile ? '0' : (sidebarCollapsed ? '80px' : '260px'),
                width: isMobile ? '100%' : (sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)'),
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <TopBar user={user} onSearch={setSearch} searchTerm={search} />
                <main style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>

                    {/* Premium Hero Section */}
                    <div style={{ marginBottom: '3rem', position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div style={{
                            position: 'absolute',
                            top: '-100px',
                            left: '-100px',
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(50px)',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1, animation: 'fadeIn 0.5s ease-out' }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                Welcome back, {user.name.split(' ')[0]} 👋
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Track your learning activity and explore new content
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem', animation: 'fadeIn 0.7s ease-out' }}>
                        <StatCard
                            title="Articles Visited"
                            value={recentlyVisited.length || 24}
                            icon={<FaEye />}
                            color="#10b981"
                        />
                        <StatCard
                            title="Articles Liked"
                            value={likedCount}
                            icon={<FaHeart />}
                            color="#ec4899"
                        />
                        <StatCard
                            title="Categories Explored"
                            value={categoriesExplored}
                            icon={<FaLayerGroup />}
                            color="#8b5cf6"
                        />
                    </div>

                    {/* Main Content Grid: Recently Visited */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', animation: 'fadeIn 0.8s ease-out' }}>

                        {/* Recently Visited Section */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Recently Visited</h2>
                            </div>

                            {recentlyVisited.length === 0 ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '4rem 2rem',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '16px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '1rem'
                                }}>
                                    <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6', fontSize: '2rem' }}>
                                        <FaBook />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No history yet</h3>
                                        <p style={{ color: 'var(--text-secondary)' }}>Start exploring articles to see your history here.</p>
                                    </div>
                                    <button
                                        onClick={() => navigate('/')}
                                        style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            padding: '0.6rem 1.5rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            marginTop: '1rem',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
                                    >
                                        Explore Articles
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {recentlyVisited.filter(item => item.article).slice(0, 5).map((item, index) => {
                                        const styles = getCategoryStyles(item.article.category);
                                        const initial = (item.article.category || 'G').charAt(0).toUpperCase();

                                        return (
                                            <div
                                                key={index}
                                                style={{
                                                    background: 'rgba(30, 41, 59, 0.3)',
                                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                                    borderRadius: '12px',
                                                    padding: '1rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '1.5rem',
                                                    transition: 'all 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.6)';
                                                    e.currentTarget.style.transform = 'scale(1.005)';
                                                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(30, 41, 59, 0.3)';
                                                    e.currentTarget.style.transform = 'scale(1)';
                                                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                                                }}
                                                onClick={() => navigate(`/view/${item.article._id}`)}
                                            >
                                                {/* Thumbnail */}
                                                <div style={{
                                                    width: '60px',
                                                    height: '60px',
                                                    borderRadius: '8px',
                                                    background: styles.bg,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: styles.color,
                                                    fontSize: '2rem',
                                                    fontWeight: '800',
                                                    flexShrink: 0
                                                }}>
                                                    {initial}
                                                </div>

                                                {/* Info */}
                                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                                    <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: '600', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {item.article.title}
                                                    </h3>
                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <FaClock size={12} /> Visited {timeAgo(item.timestamp)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Category Badge & Check */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    {!isMobile && (
                                                        <div style={{
                                                            padding: '4px 12px',
                                                            borderRadius: '20px',
                                                            background: 'rgba(59, 130, 246, 0.1)',
                                                            color: '#60a5fa',
                                                            fontSize: '0.8rem',
                                                            fontWeight: '600',
                                                            border: '1px solid rgba(59, 130, 246, 0.2)'
                                                        }}>
                                                            {item.article.category || 'General'}
                                                        </div>
                                                    )}
                                                    <div style={{ color: '#3b82f6', opacity: 0.8 }}>
                                                        <FaBookmark />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Connections Summary Section */}
                    <div style={{ marginTop: '3rem', animation: 'fadeIn 1s ease-out' }}>
                        <div style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '24px',
                            padding: '2rem',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '2rem'
                        }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Your Network</h2>
                                <p style={{ color: 'var(--text-secondary)' }}>Manage your followers and the people you follow</p>
                            </div>

                            <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
                                <div
                                    onClick={() => navigate('/followers')}
                                    style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{user.followersCount || 0}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</div>
                                </div>
                                <div style={{ width: '1px', height: '40px', background: 'var(--border-color)' }}></div>
                                <div
                                    onClick={() => navigate('/following')}
                                    style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{user.followingCount || 0}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Following</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={() => navigate('/followers')}
                                    className="btn-secondary"
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer'
                                    }}
                                >
                                    View Followers
                                </button>
                                <button
                                    onClick={() => navigate('/following')}
                                    className="btn-primary"
                                    style={{
                                        padding: '0.8rem 1.5rem',
                                        borderRadius: '12px',
                                        fontWeight: '700',
                                        background: 'var(--accent-primary)',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
                                    }}
                                >
                                    View Following
                                </button>
                            </div>
                        </div>
                    </div>
                </main>

            </div>
        </div>
    );
};

export default StudentDashboard;

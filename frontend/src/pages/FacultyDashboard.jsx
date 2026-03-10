import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaHeart, FaEdit, FaTrash, FaFilter, FaLayerGroup, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import Analytics from '../components/Analytics';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalArticles: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
    });
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, articles, analytics, drafts
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(true);


    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }
            const res = await axios.get('http://localhost:5000/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUser(res.data);
            sessionStorage.setItem('user', JSON.stringify(res.data));
            setLoading(false);
        } catch (err) {
            console.error("Error fetching faculty user data:", err);
            if (err.response?.status === 403 || err.response?.status === 401) {
                navigate('/login');
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchArticles();
        fetchStats();
    }, [navigate]);



    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/knowledge/faculty/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardStats(res.data);
        } catch (err) {
            console.error("Error fetching stats:", err);
        }
    };

    const fetchArticles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/knowledge/all');
            setArticles(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch content");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this article?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/knowledge/delete/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Article deleted successfully");
                fetchArticles();
            } catch (err) {
                toast.error("Failed to delete. Access denied.");
            }
        }
    };

    // Derived: My Articles (filter by logged-in faculty member)
    const myArticles = user ? articles.filter(a => {
        if (!a.author) return false;
        const authorId = a.author._id || a.author;
        const authorName = a.author.name || a.author;

        return (
            !!(authorId && (authorId === user._id || authorId === user.id || authorId === user.userId)) ||
            !!(authorName && (authorName === user.name || authorName === user.email)) ||
            (typeof a.author === 'string' && (a.author === user.name || a.author === user.email))
        );
    }) : [];

    // Filter and Sort My Articles
    const filteredArticles = myArticles
        .filter(a => a.title.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
            if (sortBy === 'views') return b.views - a.views;
            if (sortBy === 'likes') return (b.likes?.length || 0) - (a.likes?.length || 0);
            return 0;
        });

    // Sidebar State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || 'general';
        switch (cat) {
            case 'math': return { bg: '#eef2ff', color: '#a5b4fc' }; // Very light lavender/blue
            case 'science': return { bg: '#f0fdf4', color: 'rgba(134, 239, 172, 1)' }; // Very light mint green
            case 'history': return { bg: '#fffbeb', color: '#f1d576ff' }; // Very light yellow
            case 'programming': return { bg: '#fdf4ff', color: '#f0abfc' }; // Very light pink/purple
            default: return { bg: '#f8fafc', color: '#cbd5e1' }; // Very light slate
        }
    };

    if (!user) return null;

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

                {/* Top Navigation */}
                <TopBar user={user} onSearch={setSearch} searchTerm={search} />

                <main style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>

                    {/* Welcome Section */}
                    <div style={{ marginBottom: '3rem', position: 'relative' }}>
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

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                Good Evening, {user.name.split(' ')[0]} 👋
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '2rem' }}>
                                Here's what's happening with your content today.
                            </p>
                        </div>
                    </div>

                    {/* Connections Summary Section */}
                    <div style={{ marginBottom: '3rem', position: 'relative', zIndex: 1, animation: 'fadeIn 1s ease-out' }}>
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
                                <h2 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Your Network</h2>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Manage your professional connections</p>
                            </div>

                            <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                                <div
                                    onClick={() => navigate('/followers')}
                                    style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{user.followersCount || 0}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Followers</div>
                                </div>
                                <div style={{ width: '1px', height: '35px', background: 'var(--border-color)' }}></div>
                                <div
                                    onClick={() => navigate('/following')}
                                    style={{ textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                >
                                    <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--accent-primary)' }}>{user.followingCount || 0}</div>
                                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Following</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.8rem' }}>
                                <button
                                    onClick={() => navigate('/followers')}
                                    style={{
                                        padding: '0.7rem 1.2rem',
                                        borderRadius: '10px',
                                        fontWeight: '700',
                                        background: 'transparent',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Followers
                                </button>
                                <button
                                    onClick={() => navigate('/following')}
                                    style={{
                                        padding: '0.7rem 1.2rem',
                                        borderRadius: '10px',
                                        fontWeight: '700',
                                        background: 'var(--accent-primary)',
                                        border: 'none',
                                        color: 'white',
                                        cursor: 'pointer',
                                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    Following
                                </button>
                            </div>
                        </div>
                    </div>


                    {/* Stats Grid */}
                    <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <StatCard
                            title="Total Articles"
                            value={dashboardStats.totalArticles}
                            icon={<FaLayerGroup />}
                            color="#3b82f6"
                        />
                        <StatCard
                            title="Total Views"
                            value={dashboardStats.totalViews.toLocaleString()}
                            icon={<FaEye />}
                            color="#10b981"
                        />
                        <StatCard
                            title="Total Likes"
                            value={dashboardStats.totalLikes.toLocaleString()}
                            icon={<FaHeart />}
                            color="#ec4899"
                        />
                        <StatCard
                            title="Total Comments"
                            value={dashboardStats.totalComments.toLocaleString()}
                            icon={<FaEdit />}
                            color="#f59e0b"
                        />
                    </div>

                    {/* Analytics Section */}
                    <div style={{ marginBottom: '3rem' }}>
                        <Analytics articles={myArticles} />
                    </div>

                    {/* Content Management Section */}
                    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>My Articles</h2>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <select
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    value={sortBy}
                                >
                                    <option value="newest">Newest First</option>
                                    <option value="views">Most Viewed</option>
                                    <option value="likes">Most Liked</option>
                                </select>
                            </div>
                        </div>

                        {/* Article Card/Table Hybrid */}
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {filteredArticles.map((article) => (
                                <div
                                    key={article._id}
                                    style={{
                                        background: 'var(--bg-secondary)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '1rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1.5rem',
                                        transition: 'all 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                                        e.currentTarget.style.transform = 'scale(1.005)';
                                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-secondary)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                        e.currentTarget.style.borderColor = 'var(--border-color)';
                                    }}
                                    onClick={() => navigate(`/view/${article._id}`)}
                                >
                                    {/* Thumbnail */}
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '8px',
                                        background: getCategoryStyles(article.category).bg,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: getCategoryStyles(article.category).color,
                                        fontSize: '2rem',
                                        fontWeight: '800',
                                        flexShrink: 0
                                    }}>
                                        {(article.category || 'G').charAt(0).toUpperCase()}
                                    </div>

                                    {/* Info */}
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                                            {article.title}
                                        </h3>
                                        <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaCalendarAlt size={12} /> {new Date(article.createdAt).toLocaleDateString()}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FaEye size={12} /> {article.views}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Category Badge */}
                                    <div style={{
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#60a5fa',
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                    }}>
                                        {article.category}
                                    </div>

                                    {/* Actions */}
                                    <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => navigate(`/edit/${article._id}`)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'transparent',
                                                border: '1px solid var(--border-color)',
                                                color: 'var(--text-secondary)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            title="Edit"
                                        >
                                            <FaEdit />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(article._id)}
                                            style={{
                                                padding: '8px',
                                                borderRadius: '8px',
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                border: '1px solid rgba(239, 68, 68, 0.2)',
                                                color: '#f87171',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                            title="Delete"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
};

export default FacultyDashboard;

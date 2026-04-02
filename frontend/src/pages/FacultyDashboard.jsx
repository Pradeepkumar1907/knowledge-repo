import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaHeart, FaEdit, FaTrash, FaLayerGroup, FaCalendarAlt, FaPlus } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import Analytics from '../components/Analytics';

// ✅ USE CENTRALIZED API INSTANCE
import API from '../api';

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
    const [sortBy, setSortBy] = useState('newest');
    const [loading, setLoading] = useState(true);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // ✅ FETCH USER
    const fetchUserData = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get('/auth/me');

            setUser(res.data);
            sessionStorage.setItem('user', JSON.stringify(res.data));

        } catch (err) {
            console.error(err);
            navigate('/login');
        }
    };

    // ✅ FETCH STATS
    const fetchStats = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get('/knowledge/faculty/stats');

            setDashboardStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ FETCH ARTICLES
    const fetchArticles = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get('/knowledge/all');
            setArticles(res.data);
        } catch (err) {
            toast.error("Failed to fetch content");
        }
    };

    // ✅ DELETE
    const handleDelete = async (id) => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            await API.delete(`/knowledge/delete/${id}`);

            toast.success("Deleted");
            fetchArticles();
        } catch {
            toast.error("Delete failed");
        }
    };

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            await Promise.all([
                fetchUserData(),
                fetchArticles(),
                fetchStats()
            ]);
            setLoading(false);
        };
        initDashboard();
    }, []);

    // Filter
    const myArticles = user
        ? articles.filter(a =>
            (a.author?.name === user.name) ||
            (a.author === user.name)
        )
        : [];

    const filteredArticles = myArticles
        .filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)' }}>
                <Sidebar />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '1rem' }}></div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Loading your dashboard...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ display: 'flex', background: 'var(--bg-primary)', minHeight: '100vh' }}>
            <Sidebar />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <TopBar user={user} onSearch={setSearch} searchTerm={search} />

                <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

                    {/* Header */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                            {getGreeting()}, {user.name.split(' ')[0]} 👋
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
                            Here's what's happening with your knowledge repository today.
                        </p>
                    </div>

                    {myArticles.length > 0 ? (
                        <>
                            {/* Stats Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                                <StatCard title="Total Articles" value={dashboardStats.totalArticles} icon={<FaLayerGroup />} color="#3b82f6" />
                                <StatCard title="Total Views" value={dashboardStats.totalViews} icon={<FaEye />} color="#10b981" />
                                <StatCard title="Total Likes" value={dashboardStats.totalLikes} icon={<FaHeart />} color="#ef4444" />
                            </div>

                            {/* Analytics Section */}
                            <section style={{ marginBottom: '4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Performance Analytics</h2>
                                    <div style={{ height: '1px', flex: 1, background: 'var(--border-color)' }}></div>
                                </div>
                                <Analytics articles={myArticles} />
                            </section>

                            {/* Articles Section */}
                            <section>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Your Articles</h2>
                                    <div style={{ padding: '0.4rem 0.8rem', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', borderRadius: '8px', fontSize: '0.85rem', fontWeight: '600' }}>
                                        {myArticles.length} Published
                                    </div>
                                </div>

                                {filteredArticles.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
                                        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No articles match your current search "{search}".</p>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                                        {filteredArticles.map(article => (
                                            <div
                                                key={article._id}
                                                className="saas-card"
                                                style={{
                                                    background: 'var(--bg-card)',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '20px',
                                                    padding: '1.5rem',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '1rem',
                                                    transition: 'transform 0.2s, border-color 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => navigate(`/view/${article._id}`)}
                                                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700' }}>
                                                        {article.category || 'General'}
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); navigate(`/edit/${article._id}`); }}
                                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s' }}
                                                            onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'}
                                                            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                                                        >
                                                            <FaEdit />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDelete(article._id); }}
                                                            style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.9rem', transition: 'color 0.2s' }}
                                                            onMouseEnter={(e) => e.target.style.color = '#ef4444'}
                                                            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                                                        >
                                                            <FaTrash />
                                                        </button>
                                                    </div>
                                                </div>

                                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: '1.4' }}>{article.title}</h3>

                                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaEye /> {article.views || 0}</span>
                                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaHeart /> {article.likes?.length || 0}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <FaCalendarAlt size={12} /> {new Date(article.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>
                        </>
                    ) : (
                        /* Empty State */
                        <div style={{
                            marginTop: '4rem',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            padding: '4rem 2rem',
                            background: 'var(--bg-card)',
                            borderRadius: '32px',
                            border: '1px dashed var(--border-color)',
                            animation: 'fadeIn 0.6s ease-out'
                        }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: 'var(--accent-primary)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '2rem',
                                marginBottom: '1.5rem'
                            }}>
                                <FaLayerGroup />
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '1rem' }}>Ready to share your knowledge?</h2>
                            <p style={{ color: 'var(--text-secondary)', maxWidth: '450px', fontSize: '1.1rem', marginBottom: '2.5rem', lineHeight: '1.6' }}>
                                It looks like you haven't published any articles yet. Start contributing to the repository and track your impact here.
                            </p>
                            <button
                                onClick={() => navigate('/add')}
                                style={{
                                    background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: 'white',
                                    border: 'none',
                                    padding: '1rem 2.5rem',
                                    borderRadius: '14px',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}
                                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(37, 99, 235, 0.3)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(37, 99, 235, 0.2)'; }}
                            >
                                <FaPlus /> Create Your First Article
                            </button>
                        </div>
                    )}

                </main>
            </div>
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .saas-card:hover { border-color: var(--accent-primary); }
            `}</style>
        </div>
    );
};

export default FacultyDashboard;

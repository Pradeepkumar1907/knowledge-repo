
import API from '../api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaUsers, FaEdit, FaTrash, FaLayerGroup, FaDatabase, FaComments } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';

const AdminConsole = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('articles'); // 'articles' or 'users'
    const [dashboardStats, setDashboardStats] = useState({
        totalArticles: 0,
        totalUsers: 0,
        totalViews: 0,
        totalComments: 0
    });

    // Pagination and Data
    const [articles, setArticles] = useState([]);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const u = JSON.parse(storedUser);
                setUser(u);
                if ((u.role || '').toLowerCase() !== 'admin') {
                    navigate('/');
                }
            } else {
                navigate('/login');
            }
        };

        fetchUserData();
        fetchStats();
    }, [navigate]);

    useEffect(() => {
        if (activeTab === 'articles') {
            fetchArticles();
        } else if (activeTab === 'users') {
            fetchUsers();
        }
    }, [activeTab]);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.get(`${API}/knowledge/admin/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDashboardStats(res.data);
        } catch (err) {
            console.error("Error fetching admin stats:", err);
        }
    };

    const fetchArticles = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.get(`${API}/knowledge/admin/articles?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArticles(res.data.articles || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch articles");
        }
    };

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.get(`${API}/knowledge/admin/users?limit=50`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(res.data.users || []);
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch users");
        }
    };

    const handleDeleteArticle = async (id) => {
        if (window.confirm("Are you sure you want to permanently delete this article?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`${API}/knowledge/delete/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Article deleted");
                fetchArticles();
                fetchStats();
            } catch (err) {
                toast.error("Failed to delete article");
            }
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm("WARNING: This will permanently delete the user and all their content! Continue?")) {
            try {
                // Not yet implemented on backend, but mocked UI action
                toast.error("User deletion via UI is locked for safety.");
            } catch (err) {
                console.error(err);
            }
        }
    };

    // Sidebar State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));
    const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || 'general';
        switch (cat) {
            case 'math': return { bg: '#eef2ff', color: '#a5b4fc', initial: 'M' };
            case 'science': return { bg: '#f0fdf4', color: 'rgba(134, 239, 172, 1)', initial: 'S' };
            case 'history': return { bg: '#fffbeb', color: '#f1d576', initial: 'H' };
            case 'programming': return { bg: '#fdf4ff', color: '#f0abfc', initial: 'P' };
            default: return { bg: '#f8fafc', color: '#cbd5e1', initial: cat.charAt(0).toUpperCase() };
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
                            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
                            borderRadius: '50%',
                            filter: 'blur(50px)',
                            zIndex: 0,
                            pointerEvents: 'none'
                        }}></div>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                                Admin Console 🛡️
                            </h1>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                Master overview of the entire Knowledge Repository.
                            </p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid-cards" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                        <StatCard
                            title="Platform Users"
                            value={dashboardStats.totalUsers.toLocaleString()}
                            icon={<FaUsers />}
                            color="#8b5cf6"
                        />
                        <StatCard
                            title="Global Articles"
                            value={dashboardStats.totalArticles.toLocaleString()}
                            icon={<FaLayerGroup />}
                            color="#3b82f6"
                        />
                        <StatCard
                            title="Global Views"
                            value={dashboardStats.totalViews.toLocaleString()}
                            icon={<FaEye />}
                            color="#10b981"
                        />
                        <StatCard
                            title="Global Comments"
                            value={dashboardStats.totalComments.toLocaleString()}
                            icon={<FaComments />}
                            color="#f59e0b"
                        />
                    </div>

                    {/* Action Tabs */}
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                        <button
                            onClick={() => setActiveTab('articles')}
                            style={{
                                background: activeTab === 'articles' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                color: activeTab === 'articles' ? '#60a5fa' : '#94a3b8',
                                border: 'none',
                                padding: '0.75rem 1.5rem',
                                borderRadius: '8px',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <FaLayerGroup style={{ marginRight: '8px' }} /> Article Moderation
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === 'users' ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                padding: '12px 20px',
                                cursor: 'pointer',
                                borderBottom: activeTab === 'users' ? '2px solid var(--accent-primary)' : 'none',
                                fontWeight: activeTab === 'users' ? '700' : '500',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center'
                            }}
                        >
                            <FaUsers style={{ marginRight: '8px' }} /> User Directory
                        </button>
                    </div>

                    {/* Content Area */}
                    <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
                        {activeTab === 'articles' ? (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {filteredArticles.map((article) => {
                                    const styles = getCategoryStyles(article.category);
                                    return (
                                        <div
                                            key={article._id}
                                            style={{
                                                background: 'var(--card-bg)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                padding: '1rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '1.5rem',
                                                transition: 'all 0.2s',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => navigate(`/view/${article._id}`)}
                                        >
                                            <div style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '10px',
                                                background: styles.bg,
                                                color: styles.color,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '1.2rem',
                                                flexShrink: 0
                                            }}>
                                                {styles.initial}
                                            </div>

                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {article.title}
                                                </h3>
                                                <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                    By {article.author?.name || 'Unknown User'} • {new Date(article.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingRight: '1rem', borderRight: '1px solid var(--border-color)' }}>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><FaEye /> {article.views || 0}</span>
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}><FaComments /> {article.comments?.length || 0}</span>
                                            </div>

                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/edit/${article._id}`); }}
                                                    style={{
                                                        background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                    title="Edit Article"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteArticle(article._id); }}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}
                                                    title="Delete Article"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                                {filteredArticles.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        No articles match your search.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                {filteredUsers.map((u) => (
                                    <div
                                        key={u._id}
                                        style={{
                                            background: 'var(--card-bg)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1.5rem',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <img
                                            src={u.profilePicture || `https://api.dicebear.com/7.x/initials/svg?seed=${u.name}&backgroundColor=1e293b&textColor=f8fafc`}
                                            alt={u.name}
                                            style={{
                                                width: '48px',
                                                height: '48px',
                                                borderRadius: '50%',
                                                objectFit: 'cover'
                                            }}
                                        />

                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {u.name}
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '2px 8px',
                                                    borderRadius: '12px',
                                                    background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : u.role === 'faculty' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                    color: u.role === 'admin' ? '#ef4444' : u.role === 'faculty' ? '#60a5fa' : '#34d399',
                                                    textTransform: 'uppercase',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {u.role || 'User'}
                                                </span>
                                            </h3>
                                            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                                {u.email}
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button
                                                onClick={() => handleDeleteUser(u._id)}
                                                style={{
                                                    background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.5rem', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}
                                                title="Ban/Delete User"
                                                disabled={u.role === 'admin'}
                                            >
                                                <FaTrash style={{ opacity: u.role === 'admin' ? 0.3 : 1 }} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        No users match your search.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                </main>
            </div>
        </div>
    );
};

export default AdminConsole;

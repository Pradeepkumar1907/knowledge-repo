
import API from '../api';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaTag, FaFolderOpen, FaCalendarAlt, FaLayerGroup } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const AdminCategories = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const isManagementView = location.pathname.startsWith('/admin');

    // Form State
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Sidebar State
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            // Allow Student/Faculty to view, but redirect guests to login
        } else {
            navigate('/login');
        }
        fetchCategories();
    }, [navigate]);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API}/categories`);
            setCategories(res.data);
        } catch (err) {
            console.error("Error fetching categories:", err);
            toast.error("Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');

        try {
            if (isEditing) {
                await axios.put(`${API}/categories/${editId}`,
                    { name, description },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Category updated!");
            } else {
                await axios.post(`${API}/categories`,
                    { name, description },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                toast.success("Category created!");
            }

            resetForm();
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || "Operation failed");
        }
    };

    const handleEdit = (cat) => {
        setIsEditing(true);
        setEditId(cat._id);
        setName(cat.name);
        setDescription(cat.description || '');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure? Articles in this category will remain but might lose their classification.")) {
            try {
                const token = localStorage.getItem('token') || sessionStorage.getItem('token');
                await axios.delete(`${API}/categories/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Category removed");
                fetchCategories();
            } catch (err) {
                toast.error("Failed to delete category");
            }
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setIsEditing(false);
        setEditId(null);
    };

    if (!user) return null;

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex' }}>
            {isManagementView && (
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            )}

            <div style={{
                flex: 1,
                marginLeft: !isManagementView ? '0' : (isMobile ? '0' : (sidebarCollapsed ? '80px' : '260px')),
                width: !isManagementView ? '100%' : (isMobile ? '100%' : (sidebarCollapsed ? 'calc(100% - 80px)' : 'calc(100% - 260px)')),
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                paddingTop: !isManagementView ? '80px' : '0' // Space for top Navbar
            }}>
                {isManagementView && <TopBar user={user} />}

                <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Page Header */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '2.5rem'
                    }}>
                        <div>
                            <h1 style={{ fontSize: '2.2rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                                {isAdmin ? 'Categories Management 📂' : 'Explore Categories 📂'}
                            </h1>
                            <p style={{ margin: '0.5rem 0 0 0', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                                {isAdmin ? 'Define and organize the knowledge repository taxonomy.' : 'Browse various knowledge domains and disciplines.'}
                            </p>
                        </div>
                        <div style={{
                            background: 'rgba(59, 130, 246, 0.1)',
                            padding: '0.8rem 1.2rem',
                            borderRadius: '12px',
                            color: 'var(--accent-primary)',
                            fontSize: '0.9rem',
                            fontWeight: '700',
                            border: '1px solid var(--accent-primary)30'
                        }}>
                            {categories.length} Categories
                        </div>
                    </div>

                    {/* Create/Edit Section - Only for Admins */}
                    {isAdmin && (
                        <div style={{
                            background: 'var(--bg-card)',
                            border: '1px solid var(--border-color)',
                            padding: '2rem',
                            borderRadius: '24px',
                            marginBottom: '3rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
                                <div style={{
                                    background: 'var(--accent-primary)',
                                    color: 'white',
                                    padding: '10px',
                                    borderRadius: '12px',
                                    display: 'flex'
                                }}>
                                    {isEditing ? <FaEdit /> : <FaPlus />}
                                </div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                                    {isEditing ? 'Edit Category' : 'Create New Category'}
                                </h3>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Category Name</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Artificial Intelligence"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            required
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                color: 'var(--text-primary)',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Description</label>
                                        <input
                                            type="text"
                                            placeholder="Brief summary of this category"
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            style={{
                                                background: 'var(--bg-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                padding: '12px 16px',
                                                color: 'var(--text-primary)',
                                                fontSize: '1rem',
                                                outline: 'none',
                                                transition: 'border-color 0.2s'
                                            }}
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button
                                        type="submit"
                                        style={{
                                            background: 'var(--accent-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '12px',
                                            padding: '12px 24px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {isEditing ? <FaEdit /> : <FaPlus />}
                                        {isEditing ? 'Update Category' : 'Add Category'}
                                    </button>
                                    {isEditing && (
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            style={{
                                                background: 'transparent',
                                                color: 'var(--text-secondary)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '12px',
                                                padding: '12px 24px',
                                                fontWeight: '600',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>
                    )}

                    {/* Active Categories Grid */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>Active Categories</h3>
                            <div style={{ height: '2px', flex: 1, background: 'linear-gradient(to right, var(--border-color), transparent)' }}></div>
                        </div>

                        {loading ? (
                            <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                                <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                            </div>
                        ) : categories.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '5rem 2rem',
                                background: 'var(--bg-card)',
                                borderRadius: '32px',
                                border: '1px dashed var(--border-color)'
                            }}>
                                <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>📂</div>
                                <h4 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No categories created yet.</h4>
                                <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto' }}>Create your first category to organize articles and improve repository structure.</p>
                            </div>
                        ) : (
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                                gap: '1.5rem'
                            }}>
                                {categories.map(cat => (
                                    <div
                                        key={cat._id}
                                        style={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '24px',
                                            padding: '1.5rem',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                                                <div style={{
                                                    background: 'var(--bg-secondary)',
                                                    color: 'var(--accent-primary)',
                                                    width: '48px',
                                                    height: '48px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderRadius: '16px',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    <FaTag />
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {isAdmin && (
                                                        <>
                                                            <button
                                                                onClick={() => handleEdit(cat)}
                                                                style={{
                                                                    background: 'var(--bg-secondary)',
                                                                    border: '1px solid var(--border-color)',
                                                                    color: 'var(--text-primary)',
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    borderRadius: '10px',
                                                                    cursor: 'pointer'
                                                                }}
                                                                title="Edit Category"
                                                            >
                                                                <FaEdit size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(cat._id)}
                                                                style={{
                                                                    background: 'var(--bg-secondary)',
                                                                    border: '1px solid var(--border-color)',
                                                                    color: '#ff4d4d',
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    borderRadius: '10px',
                                                                    cursor: 'pointer'
                                                                }}
                                                                title="Delete Category"
                                                            >
                                                                <FaTrash size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <h4 style={{ fontSize: '1.25rem', fontWeight: '800', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>{cat.name}</h4>
                                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', minHeight: '2.7rem' }}>
                                                {cat.description || 'No description provided for this category.'}
                                            </p>
                                        </div>

                                        <div style={{
                                            marginTop: '1.5rem',
                                            paddingTop: '1.2rem',
                                            borderTop: '1px solid var(--border-color)',
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                <FaLayerGroup size={12} />
                                                <span><strong>{cat.articleCount || 0}</strong> Articles</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                <FaCalendarAlt size={12} />
                                                <span>{new Date(cat.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AdminCategories;

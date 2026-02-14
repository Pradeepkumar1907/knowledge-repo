import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaDatabase, FaChalkboardTeacher } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';

const FacultyDashboard = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                const u = JSON.parse(storedUser);
                setUser(u);
                if (u.role !== 'faculty' && u.role !== 'admin') {
                    // handle redirects
                }
            } else {
                navigate('/login');
            }
        };

        fetchUserData();
        fetchArticles();
    }, [navigate]);

    const fetchArticles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/knowledge/all');
            // Faculty can see all articles? Or only their own? 
            // Prompt says: "Faculty can manage content". Usually implies all or own.
            // I'll assume they can see all for now, similar to Admin.
            setArticles(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this article?")) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`http://localhost:5000/knowledge/delete/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Deleted");
                fetchArticles();
            } catch (err) {
                toast.error("Failed to delete. You might not have permission.");
            }
        }
    };

    // Filter articles
    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    if (!user) return null;

    return (
        <div className="container" style={{ paddingTop: '1rem' }}>
            <div className="dash-header">
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Faculty Dashboard</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '0.9rem', color: '#eab308', fontWeight: 'bold' }}>Faculty</span>
                </div>
            </div>

            <div className="profile-card" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        <Avatar name={user.name} size="60px" fontSize="1.5rem" />
                    )}
                    <div>
                        <h2 style={{ margin: '0', fontSize: '1.2rem' }}>{user.name}</h2>
                        <p style={{ margin: '0', color: '#94a3b8', fontSize: '0.9rem' }}>Manage your educational content</p>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <button className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => navigate('/add')}>
                    <FaPlus /> create New Article
                </button>
            </div>

            <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search articles..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>All Content</h3>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{articles.length} Total</span>
            </div>

            <div>
                {filteredArticles.map(item => (
                    <div key={item._id} className="list-item">
                        <div className="item-icon-box" style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#eab308' }}>
                            <FaDatabase />
                        </div>
                        <div className="item-content">
                            <span className="item-title" style={{ fontSize: '0.95rem' }}>{item.title}</span>
                            <span className="item-sub">By {item.author} • {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/view/${item._id}`)} title="View">
                                <FaSearch size={14} />
                            </button>
                            <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/edit/${item._id}`)} title="Edit">
                                <FaEdit size={14} />
                            </button>
                            <button className="btn-icon" style={{ width: '32px', height: '32px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(item._id)} title="Delete">
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FacultyDashboard;

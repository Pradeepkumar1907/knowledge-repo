import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaSearch, FaEdit, FaTrash, FaDatabase } from 'react-icons/fa';
import toast from 'react-hot-toast';

const AdminConsole = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            if ((u.role || '').toLowerCase() !== 'admin') {
                navigate('/');
            }
        }
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/knowledge/all');
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
                toast.error("Failed to delete");
            }
        }
    };

    const filteredArticles = articles.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="container">
            <div className="dash-header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>{'<'}</button>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>Admin Console</h2>
                <div style={{ width: '20px' }}></div>
            </div>

            <button className="btn-primary" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => navigate('/add')}>
                <FaPlus /> Add New Knowledge
            </button>

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
                <h3 style={{ margin: 0 }}>Manage Content</h3>
                <span style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{articles.length} Total</span>
            </div>

            <div>
                {filteredArticles.map(item => (
                    <div key={item._id} className="list-item">
                        <div className="item-icon-box" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            <FaDatabase />
                        </div>
                        <div className="item-content">
                            <span className="item-title" style={{ fontSize: '0.95rem' }}>{item.title}</span>
                            <span className="item-sub">By {item.author || 'Admin'} • {new Date(item.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '5px' }}>
                            <button className="btn-icon" style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/edit/${item._id}`)}>
                                <FaEdit size={14} />
                            </button>
                            <button className="btn-icon" style={{ width: '32px', height: '32px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDelete(item._id)}>
                                <FaTrash size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminConsole;

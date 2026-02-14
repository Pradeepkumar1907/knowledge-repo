import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { FaSearch, FaMicrophone, FaBook, FaCode, FaFlask, FaHistory } from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('All');

    const categories = ['All', 'Programming', 'Science', 'History', 'Math', 'General'];

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await axios.get('http://localhost:5000/knowledge/all');
            setArticles(res.data);
            setFiltered(res.data);
        } catch (err) {
            console.error("Error fetching articles:", err);
        }
    };

    const handleSearch = (e) => {
        const term = e.target.value;
        setSearch(term);
        filterArticles(term, activeCat);
    };

    const handleCategory = (cat) => {
        setActiveCat(cat);
        filterArticles(search, cat);
    };

    const filterArticles = (term, cat) => {
        let result = articles;
        if (cat !== 'All') {
            result = result.filter(a => a.category?.toLowerCase() === cat.toLowerCase());
        }
        if (term) {
            result = result.filter(a => a.title.toLowerCase().includes(term.toLowerCase()));
        }
        setFiltered(result);
    };

    const getIcon = (cat) => {
        if (!cat) return <FaBook />;
        const c = cat.toLowerCase();
        if (c.includes('code') || c.includes('program')) return <FaCode />;
        if (c.includes('science')) return <FaFlask />;
        if (c.includes('history')) return <FaHistory />;
        return <FaBook />;
    };

    // Check if user is admin (case insensitive)
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    return (
        <div style={{ paddingBottom: '90px' }}>
            {/* Header Background */}
            <div style={{ background: '#0f172a', padding: '1.5rem', paddingBottom: '1rem' }}>
                <div className="dash-header">
                    <div className="user-greeting" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* <div style={{ border: '2px solid #3b82f6', borderRadius: '50%', padding: '2px' }}>
                            <Avatar name={user?.username || 'User'} size="40px" />
                        </div> */}
                        <div>
                            <h2 style={{ fontSize: '2rem', color: 'white', margin: 0 }}>
                                Welcome back, <span style={{ color: '#3b82f6' }}>{user?.name || 'Guest'}</span>
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="search-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search articles, notes..."
                        value={search}
                        onChange={handleSearch}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '5px' }}>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`pill ${activeCat === cat ? 'active' : ''}`}
                            onClick={() => handleCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="container" style={{ paddingTop: '0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '1.5rem 0 1rem' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Featured Articles</h3>

                    {/* Admin Action Button in Header - Secondary Access */}
                    {isAdmin && (
                        <div onClick={() => navigate('/add')} style={{ cursor: 'pointer', color: '#3b82f6', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <span style={{ fontSize: '1.2rem' }}>+</span> Add New
                        </div>
                    )}
                </div>

                {filtered.length === 0 ? (
                    <p style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>No articles found.</p>
                ) : (
                    <div className="article-grid">
                        {filtered.map(item => (
                            <div key={item._id} className="article-card">
                                {/* Image Section */}
                                <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate(`/view/${item._id}`)}>
                                    <img
                                        src={`https://picsum.photos/seed/${item._id}/400/300`}
                                        alt="Cover"
                                        className="article-image"
                                    />
                                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(15, 23, 42, 0.8)', color: '#3b82f6', padding: '4px 10px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', backdropFilter: 'blur(4px)' }}>
                                        {item.category}
                                    </div>
                                </div>

                                <div className="article-content">
                                    <h3 className="article-title">{item.title}</h3>

                                    <div className="article-author">
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: 'white' }}>
                                            {(item.author || 'A').charAt(0)}
                                        </div>
                                        <span>{item.author || 'Admin'}</span>
                                    </div>

                                    <p className="article-excerpt">
                                        {item.content}
                                    </p>

                                    <div className="article-actions">
                                        <button
                                            className="btn-primary"
                                            style={{ padding: '0.6rem', fontSize: '0.9rem', width: '100%' }}
                                            onClick={() => navigate(`/view/${item._id}`)}
                                        >
                                            Read More
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home;

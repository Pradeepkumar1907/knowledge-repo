import API from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import { FaBookmark } from 'react-icons/fa';

const SavedArticles = () => {
    const navigate = useNavigate();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }

        const fetchBookmarks = async () => {
            try {
                // ✅ USE CENTRALIZED API INSTANCE
                const res = await API.get('/knowledge/user/bookmarks');
                setArticles(res.data);
            } catch (err) {
                console.error("Failed to fetch bookmarks:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarks();
    }, [navigate]);

    return (
        <div className="container" style={{ minHeight: '100vh', padding: '2rem 1rem' }}>
            <div className="dash-header" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-primary)' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1.2rem', cursor: 'pointer' }}>{'<'}</button>
                <h2 style={{ fontSize: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaBookmark style={{ color: 'var(--accent-primary)' }} /> Saved Articles
                </h2>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--bg-secondary)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-secondary)' }}>Loading saved articles...</p>
                </div>
            ) : (
                <>
                    {articles.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                            <FaBookmark style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '1rem' }} />
                            <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No saved articles yet</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Articles you bookmark will appear here for easy access.</p>
                        </div>
                    ) : (
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                            gap: '2rem'
                        }}>
                            {articles.map(article => (
                                <ArticleCard key={article._id} article={article} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default SavedArticles;

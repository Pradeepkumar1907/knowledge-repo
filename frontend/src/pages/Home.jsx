import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBook, FaCode, FaFlask, FaHistory, FaCalculator, FaGlobe, FaFire, FaLayerGroup, FaUserFriends } from 'react-icons/fa';
import ArticleCard from '../components/ArticleCard';

const Home = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [articles, setArticles] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCat, setActiveCat] = useState('All');

    // Dynamic Data States
    const [featured, setFeatured] = useState(null);
    const [trendingToday, setTrendingToday] = useState([]);
    const [trendingWeek, setTrendingWeek] = useState([]);
    const [categories, setCategories] = useState(['All']);
    const [stats, setStats] = useState({ articles: 0, users: 0, activeCategories: 0 });
    const [loading, setLoading] = useState(true);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    // Pagination Logic
    const indexOfLastArticle = currentPage * itemsPerPage;
    const indexOfFirstArticle = indexOfLastArticle - itemsPerPage;
    const currentArticles = filtered.slice(indexOfFirstArticle, indexOfLastArticle);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const iconMap = {
        'Programming': <FaCode />,
        'Science': <FaFlask />,
        'History': <FaHistory />,
        'Math': <FaCalculator />,
        'General': <FaBook />
    };

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [allRes, featuredRes, trendingTodayRes, trendingWeekRes, statsRes, catsRes] = await Promise.all([
                axios.get('http://localhost:5000/knowledge/all'),
                axios.get('http://localhost:5000/knowledge/featured'),
                axios.get('http://localhost:5000/knowledge/trending?timeframe=today'),
                axios.get('http://localhost:5000/knowledge/trending?timeframe=week'),
                axios.get('http://localhost:5000/knowledge/stats'),
                axios.get('http://localhost:5000/knowledge/categories')
            ]);

            setArticles(allRes.data);
            setFiltered(allRes.data);
            setFeatured(featuredRes.data);
            setTrendingToday(trendingTodayRes.data);
            setTrendingWeek(trendingWeekRes.data);
            setStats(statsRes.data);

            // Merge 'All' with fetched categories
            setCategories(['All', ...catsRes.data]);
        } catch (err) {
            console.error("Error fetching homepage data:", err);
        } finally {
            setLoading(false);
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
        setCurrentPage(1); // Reset to first page on filter change
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                    <p>Loading Knowledge...</p>
                </div>
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    const heroArticle = featured || articles[0] || {
        _id: '1',
        title: 'Welcome to Knowledge Repo',
        description: 'Start exploring millions of articles and research papers.',
        author: { name: 'Admin', profilePicture: '' },
        category: 'General'
    };

    return (
        <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
            <div className="container mx-auto px-6 max-w-7xl" style={{ marginTop: '2rem' }}>

                <div className="home-layout">

                    {/* LEFT SIDEBAR: Categories + Trending */}
                    <aside style={{ position: 'sticky', top: '100px' }}>

                        {/* Trending Today Widget */}
                        <div className="saas-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaFire style={{ color: '#fb923c' }} /> Trending Today
                            </h3>
                            <div className="trending-list">
                                {trendingToday.slice(0, 3).map((trend, index) => (
                                    <div key={trend._id} className="trending-item" onClick={() => navigate(`/view/${trend._id}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer' }}>
                                        <span className="trend-rank" style={{ fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic', background: 'linear-gradient(180deg, #fb923c 0%, #ea580c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginRight: '0.8rem', lineHeight: '1.2', paddingRight: '4px', paddingBottom: '2px' }}>0{index + 1}</span>
                                        <div className="trend-info">
                                            <h4 style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '4px', color: 'var(--text-primary)' }}>{trend.title}</h4>
                                            <div className="trend-meta" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {trend.views} views • {trend.likes?.length || 0} likes
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {trendingToday.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No trending topics today.</p>}
                            </div>
                        </div>

                        {/* Trending This Week Widget */}
                        <div className="saas-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
                            <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaFire style={{ color: '#3b82f6' }} /> Trending This Week
                            </h3>
                            <div className="trending-list">
                                {trendingWeek.slice(0, 3).map((trend, index) => (
                                    <div key={trend._id} className="trending-item" onClick={() => navigate(`/view/${trend._id}`)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '12px', cursor: 'pointer' }}>
                                        <span className="trend-rank" style={{ fontSize: '1.5rem', fontWeight: '900', fontStyle: 'italic', background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginRight: '0.8rem', lineHeight: '1.2', paddingRight: '4px', paddingBottom: '2px' }}>0{index + 1}</span>
                                        <div className="trend-info">
                                            <h4 style={{ fontSize: '0.9rem', lineHeight: '1.4', marginBottom: '4px', color: 'var(--text-primary)' }}>{trend.title}</h4>
                                            <div className="trend-meta" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {trend.views} views • {trend.likes?.length || 0} likes
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {trendingWeek.length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No trending topics this week.</p>}
                            </div>
                        </div>

                        {/* Categories Widget */}
                        <div className="saas-card" style={{ padding: '1.5rem' }}>
                            <h3 className="section-title" style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaLayerGroup style={{ color: '#3b82f6' }} /> Categories
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                                {categories.map(cat => (
                                    <div
                                        key={cat}
                                        className={`cat-pill ${activeCat === cat ? 'active' : ''}`}
                                        style={{
                                            width: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            justifyContent: 'flex-start',
                                            borderRadius: '8px',
                                            padding: '0.6rem 1rem',
                                            background: activeCat === cat ? 'var(--accent-primary)15' : 'transparent',
                                            color: activeCat === cat ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                            border: activeCat === cat ? '1px solid var(--border-color)' : 'none',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onClick={() => handleCategory(cat)}
                                    >
                                        {iconMap[cat] || <FaGlobe />}
                                        <span style={{ fontWeight: '500' }}>{cat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ padding: '1.5rem', marginTop: '2rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                <FaFactory /> <span style={{ fontWeight: 600 }}>Repo.edu</span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                The premier platform for academic knowledge sharing.
                            </p>
                        </div>
                    </aside>

                    {/* RIGHT MAIN CONTENT: Hero + Grid */}
                    <main>
                        {/* Hero Section (Card Style like ResearchHub) */}
                        <div className="hero-section" style={{
                            borderRadius: '24px',
                            padding: '3rem',
                            marginBottom: '3rem',
                            textAlign: 'left',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Abstract Decorative Background */}
                            <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }}></div>

                            <div style={{ position: 'relative', zIndex: 10 }}>
                                {heroArticle && (
                                    <>
                                        <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
                                            <span style={{ background: '#fb923c', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                FEATURED RESEARCH
                                            </span>
                                            <span style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', border: '1px solid var(--border-color)' }}>
                                                {heroArticle.category}
                                            </span>
                                        </div>

                                        <h1 style={{
                                            fontSize: '2.5rem',
                                            fontWeight: '800',
                                            lineHeight: '1.2',
                                            marginBottom: '1rem',
                                            color: 'var(--text-primary)'
                                        }}>
                                            {heroArticle.title}
                                        </h1>

                                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', maxWidth: '700px', marginBottom: '2rem', lineHeight: '1.6' }}>
                                            {heroArticle.description}
                                        </p>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <button className="new-btn" style={{ background: 'var(--accent-primary)', color: 'white', padding: '0.8rem 1.5rem', fontSize: '1rem', border: 'none' }} onClick={() => navigate(`/view/${heroArticle._id}`)}>
                                                Read Full Article
                                            </button>
                                            <button className="btn-secondary" style={{
                                                padding: '0.8rem 1.5rem',
                                                fontSize: '1rem',
                                                borderRadius: '8px',
                                                background: 'var(--bg-card)',
                                                color: 'var(--text-primary)',
                                                border: '1px solid var(--border-color)',
                                                cursor: 'pointer'
                                            }}>
                                                Save to Library
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Article Grid */}
                        <div className="section-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 className="section-title" style={{ fontSize: '1.5rem' }}>{activeCat === 'All' ? 'Latest Feed' : `${activeCat} Feed`}</h3>
                            {/* Stats Badge */}
                            <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                {filtered.length} articles
                            </span>
                        </div>

                        {filtered.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--bg-card)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>No articles found.</p>
                                <button className="new-btn" style={{ margin: '1rem auto', background: '#3b82f6', color: 'white' }} onClick={() => { setSearch(''); setActiveCat('All'); }}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="cards-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {currentArticles.map(item => (
                                        <ArticleCard key={item._id} article={item} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {filtered.length > itemsPerPage && (
                                    <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button
                                            onClick={() => paginate(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                background: 'var(--bg-card)',
                                                color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                border: '1px solid var(--border-color)',
                                                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            &lt;
                                        </button>

                                        {(() => {
                                            const totalPages = Math.ceil(filtered.length / itemsPerPage);
                                            const pageNumbers = [];

                                            // Always show first page
                                            pageNumbers.push(1);

                                            let startPage = Math.max(2, currentPage - 2);
                                            let endPage = Math.min(totalPages - 1, currentPage + 2);

                                            // Adjust if we are near the beginning
                                            if (currentPage <= 3) {
                                                endPage = Math.min(totalPages - 1, 5);
                                            }
                                            // Adjust if we are near the end
                                            if (currentPage >= totalPages - 2) {
                                                startPage = Math.max(2, totalPages - 4);
                                            }

                                            // Add ellipsis before range if needed
                                            if (startPage > 2) {
                                                pageNumbers.push('...');
                                            }

                                            // Add range
                                            for (let i = startPage; i <= endPage; i++) {
                                                pageNumbers.push(i);
                                            }

                                            // Add ellipsis after range if needed
                                            if (endPage < totalPages - 1) {
                                                pageNumbers.push('...');
                                            }

                                            // Always show last page if > 1
                                            if (totalPages > 1) {
                                                pageNumbers.push(totalPages);
                                            }

                                            return pageNumbers.map((number, idx) => (
                                                number === '...' ? (
                                                    <span key={`ellipsis-${idx}`} style={{ display: 'flex', alignItems: 'end', padding: '0 0.5rem', color: '#94a3b8' }}>...</span>
                                                ) : (
                                                    <button
                                                        key={number}
                                                        onClick={() => paginate(number)}
                                                        style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '8px',
                                                            background: currentPage === number ? 'var(--accent-primary)' : 'var(--bg-card)',
                                                            color: currentPage === number ? 'white' : 'var(--text-primary)',
                                                            border: currentPage === number ? 'none' : '1px solid var(--border-color)',
                                                            cursor: 'pointer',
                                                            fontWeight: 'bold',
                                                            transition: 'all 0.2s'
                                                        }}
                                                    >
                                                        {number}
                                                    </button>
                                                )
                                            ));
                                        })()}

                                        <button
                                            onClick={() => paginate(currentPage + 1)}
                                            disabled={currentPage === Math.ceil(filtered.length / itemsPerPage)}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                borderRadius: '8px',
                                                background: 'var(--bg-card)',
                                                color: currentPage === Math.ceil(filtered.length / itemsPerPage) ? 'var(--text-secondary)' : 'var(--text-primary)',
                                                border: '1px solid var(--border-color)',
                                                cursor: currentPage === Math.ceil(filtered.length / itemsPerPage) ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center'
                                            }}
                                        >
                                            &gt;
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

// Temp component fix for icon
const FaFactory = () => <FaBook />;

export default Home;

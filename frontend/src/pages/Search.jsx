import API from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSearch, FaFilter, FaLayerGroup, FaUser, FaEye, FaCalendarAlt } from 'react-icons/fa';
import ArticleCard from '../components/ArticleCard';
import Avatar from '../components/Avatar';

const Search = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Parse Initial URL Query Params
    const queryParams = new URLSearchParams(location.search);
    const initialQuery = queryParams.get('q') || '';
    const initialCat = queryParams.get('category') || 'All';

    // Form State
    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [category, setCategory] = useState(initialCat);
    const [author, setAuthor] = useState('');
    const [minViews, setMinViews] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    // Data State
    const [categories, setCategories] = useState(['All']);
    const [results, setResults] = useState([]);
    const [userResults, setUserResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchType, setSearchType] = useState(queryParams.get('type') || 'articles');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
    }, []);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(6);

    // Pagination Logic
    const indexOfLastArticle = currentPage * itemsPerPage;
    const indexOfFirstArticle = indexOfLastArticle - itemsPerPage;
    const currentArticles = results.slice(indexOfFirstArticle, indexOfLastArticle);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // ✅ USE CENTRALIZED API INSTANCE
                const res = await API.get('/knowledge/categories');
                setCategories(['All', ...res.data]);
            } catch (err) {
                console.error("Failed to fetch categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        executeSearch();
        // eslint-disable-next-line
    }, [location.search]); // Re-run when URL changes

    const executeSearch = async () => {
        setLoading(true);
        setResults([]);
        setUserResults([]);
        setCurrentPage(1);

        try {
            if (searchType === 'articles') {
                const params = new URLSearchParams();
                if (searchTerm) params.append('q', searchTerm);
                if (category && category !== 'All') params.append('category', category);
                if (author) params.append('author', author);
                if (minViews) params.append('minViews', minViews);
                if (sortBy) params.append('sortBy', sortBy);

                // ✅ USE CENTRALIZED API INSTANCE
                const res = await API.get(`/knowledge/search?${params.toString()}`);
                setResults(res.data);
            } else {
                // People Search
                if (!searchTerm) {
                    setUserResults([]);
                    setLoading(false);
                    return;
                }
                // ✅ USE CENTRALIZED API INSTANCE
                const res = await API.get(`/api/users/search?q=${searchTerm}`);
                setUserResults(res.data);
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFollow = async (e, targetUser) => {
        e.stopPropagation();
        if (!currentUser) return navigate('/login');

        try {
            const isFollowing = targetUser.isFollowing;
            const url = `/api/users/${isFollowing ? 'unfollow' : 'follow'}/${targetUser._id}`;

            // ✅ USE CENTRALIZED API INSTANCE
            await API.post(url);

            // Update local state
            setUserResults(prev => prev.map(u =>
                u._id === targetUser._id ? { ...u, isFollowing: !isFollowing } : u
            ));
        } catch (err) {
            console.error("Error toggling follow in search:", err);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();

        const params = new URLSearchParams();
        if (searchTerm) params.append('q', searchTerm);
        params.append('type', searchType);

        if (searchType === 'articles') {
            if (category && category !== 'All') params.append('category', category);
            if (author) params.append('author', author);
            if (minViews) params.append('minViews', minViews);
            if (sortBy) params.append('sortBy', sortBy);
        }

        navigate(`/search?${params.toString()}`);
    };

    return (
        <div className="container mx-auto px-6 max-w-7xl" style={{ paddingTop: '3rem', minHeight: '100vh' }}>

            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                    Advanced <span style={{ color: 'var(--accent-primary)' }}>Search</span>
                </h1>

                {/* Search Type Tabs */}
                <div style={{
                    display: 'inline-flex',
                    background: 'var(--bg-secondary)',
                    padding: '4px',
                    borderRadius: '12px',
                    marginBottom: '2rem',
                    border: '1px solid var(--border-color)'
                }}>
                    <button
                        onClick={() => setSearchType('articles')}
                        style={{
                            padding: '8px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: searchType === 'articles' ? 'var(--accent-primary)' : 'transparent',
                            color: searchType === 'articles' ? 'white' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        Articles
                    </button>
                    <button
                        onClick={() => setSearchType('people')}
                        style={{
                            padding: '8px 24px',
                            borderRadius: '10px',
                            border: 'none',
                            background: searchType === 'people' ? 'var(--accent-primary)' : 'transparent',
                            color: searchType === 'people' ? 'white' : 'var(--text-secondary)',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        People
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                {/* Top Filter Section */}
                <section style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '1.5rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    top: '80px',
                    zIndex: 100,
                    width: '100%'
                }}>
                    <form onSubmit={handleSearchSubmit} style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '1.5rem',
                        alignItems: 'flex-end',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ flex: '1 1 300px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>
                                <FaSearch /> {searchType === 'articles' ? 'Search Articles' : 'Search People'}
                            </label>
                            <input
                                type="text"
                                placeholder={searchType === 'articles' ? "Search titles..." : "Search by name or email..."}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{
                                    width: '100%',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px',
                                    padding: '12px 14px',
                                    color: 'var(--text-primary)',
                                    outline: 'none',
                                    transition: 'all 0.2s',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </div>

                        {searchType === 'articles' && (
                            <>
                                <div style={{ flex: '1 1 180px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>
                                        <FaLayerGroup /> Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '10px',
                                            padding: '12px 14px',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div style={{ flex: '1 1 180px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>
                                        <FaUser /> Author
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Dr. Smith"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '10px',
                                            padding: '12px 14px',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            fontSize: '0.95rem'
                                        }}
                                    />
                                </div>

                                <div style={{ flex: '1 1 150px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '8px', fontWeight: 'bold' }}>
                                        <FaCalendarAlt /> Sort By
                                    </label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '10px',
                                            padding: '12px 14px',
                                            color: 'var(--text-primary)',
                                            outline: 'none',
                                            cursor: 'pointer',
                                            appearance: 'none',
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="views">Most Viewed</option>
                                    </select>
                                </div>
                            </>
                        )}

                        <button className="btn-primary" type="submit" style={{ padding: '12px 24px', borderRadius: '10px', height: '48px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                            <FaFilter /> Search
                        </button>
                    </form>
                </section>

                {/* Results Area */}
                <main>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-primary)', fontWeight: '800' }}>
                            {searchType === 'articles' ? 'Search Results' : 'Find People'}
                        </h2>
                        <span style={{ color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.9rem', border: '1px solid var(--border-color)' }}>
                            {searchType === 'articles' ? `${results.length} articles found` : `${userResults.length} users found`}
                        </span>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                            <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid var(--bg-secondary)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
                            <p style={{ color: 'var(--text-secondary)' }}>Searching...</p>
                        </div>
                    ) : (
                        searchType === 'articles' ? (
                            results.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                    <FaSearch style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No matching articles found</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search criteria or removing some filters.</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
                                        {currentArticles.map(article => (
                                            <ArticleCard key={article._id} article={article} />
                                        ))}
                                    </div>

                                    {/* Pagination Controls */}
                                    {results.length > itemsPerPage && (
                                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '3rem', gap: '0.5rem', flexWrap: 'wrap', paddingBottom: '2rem' }}>
                                            {(() => {
                                                const totalPages = Math.ceil(results.length / itemsPerPage);
                                                const pageNumbers = [];
                                                pageNumbers.push(1);
                                                let startPage = Math.max(2, currentPage - 2);
                                                let endPage = Math.min(totalPages - 1, currentPage + 2);
                                                if (currentPage <= 3) endPage = Math.min(totalPages - 1, 5);
                                                if (currentPage >= totalPages - 2) startPage = Math.max(2, totalPages - 4);
                                                if (startPage > 2) pageNumbers.push('...');
                                                for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
                                                if (endPage < totalPages - 1) pageNumbers.push('...');
                                                if (totalPages > 1) pageNumbers.push(totalPages);

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
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            // People Results
                            userResults.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '4rem 0', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                    <FaUser style={{ fontSize: '3rem', color: 'var(--text-secondary)', opacity: 0.3, marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No users found</h3>
                                    <p style={{ color: 'var(--text-secondary)' }}>Try searching by name or email.</p>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                    {userResults.map(u => (
                                        <div
                                            key={u._id}
                                            className="saas-card"
                                            onClick={() => navigate(`/profile/${u._id}`)}
                                            style={{
                                                padding: '1.5rem',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                textAlign: 'center',
                                                cursor: 'pointer',
                                                transition: 'transform 0.2s'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                        >
                                            <Avatar name={u.name} size="80px" />
                                            <h3 style={{ margin: '1rem 0 0.2rem 0', fontSize: '1.1rem', fontWeight: '700' }}>{u.name}</h3>
                                            <span style={{ color: 'var(--accent-primary)', fontSize: '0.85rem', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                                {u.role || 'User'}
                                            </span>
                                            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{u.email}</p>

                                            <div style={{ display: 'flex', gap: '0.8rem', width: '100%', marginTop: '1.5rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u._id}`); }}
                                                    style={{
                                                        flex: 1,
                                                        padding: '0.6rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        background: 'var(--bg-secondary)',
                                                        color: 'var(--text-primary)',
                                                        border: '1px solid var(--border-color)',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Profile
                                                </button>
                                                <button
                                                    onClick={(e) => toggleFollow(e, u)}
                                                    style={{
                                                        flex: 1.5,
                                                        padding: '0.6rem',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        background: u.isFollowing ? 'var(--bg-secondary)' : 'var(--accent-primary)',
                                                        color: u.isFollowing ? 'var(--text-primary)' : 'white',
                                                        border: u.isFollowing ? '1px solid var(--border-color)' : 'none',
                                                        fontWeight: '700',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {u.isFollowing ? 'Following' : 'Follow'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )
                    )}
                </main>
            </div>
        </div>
    );
};

export default Search;

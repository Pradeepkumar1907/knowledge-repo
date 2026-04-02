
const API = import.meta.env.VITE_API_URL;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCalendarAlt, FaHeart, FaRegHeart, FaComment, FaEdit, FaTrash, FaTrashAlt, FaClock, FaBookmark, FaRegBookmark, FaShareSquare, FaMagic } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import 'react-quill-new/dist/quill.snow.css';

// Helper for category styles
const getCategoryStyles = (category) => {
    const cat = category?.toLowerCase() || 'general';
    switch (cat) {
        case 'math': return { bg: 'rgba(165, 180, 252, 0.1)', color: 'var(--accent-primary)', border: 'rgba(165, 180, 252, 0.2)' };
        case 'science': return { bg: 'rgba(134, 239, 172, 0.1)', color: '#10b981', border: 'rgba(134, 239, 172, 0.2)' };
        case 'history': return { bg: 'rgba(252, 211, 77, 0.1)', color: '#f59e0b', border: 'rgba(252, 211, 77, 0.2)' };
        case 'programming': return { bg: 'rgba(240, 171, 252, 0.1)', color: 'var(--accent-primary)', border: 'rgba(240, 171, 252, 0.2)' };
        default: return { bg: 'rgba(203, 213, 225, 0.1)', color: 'var(--text-secondary)', border: 'rgba(203, 213, 225, 0.2)' };
    }
};

const KnowledgeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [trending, setTrending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [commentText, setCommentText] = useState("");


    const fetchItem = async (currentUser) => {
        try {
            const res = await axios.get(`${API}/knowledge/${id}`);
            setItem(res.data);
            setLoading(false);

            const activeUser = currentUser || user;
            if (activeUser) {
                const uid = activeUser._id || activeUser.id || activeUser.userId;
                setIsBookmarked(res.data.bookmarkedBy?.includes(uid?.toString()) || false);
            }

            // Record a legitimate article view
            let identifier = null;
            if (activeUser) {
                identifier = activeUser._id || activeUser.id || activeUser.email || activeUser.username;
            }
            if (!identifier) {
                identifier = localStorage.getItem('guestId');
                if (!identifier) {
                    identifier = 'guest_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('guestId', identifier);
                }
            }
            await axios.post(`${API}/knowledge/${id}/view`, { userId: identifier }).catch(e => console.error("View increment failed", e));

            // Fetch trending
            const trendRes = await axios.get(`${API}/knowledge/trending`);
            setTrending(trendRes.data.filter(t => t._id !== id).slice(0, 4));

            // Record visit
            if (activeUser) {
                const token = localStorage.getItem('token');
                if (token) {
                    await axios.post(
                        `${API}/user/visit`,
                        { articleId: id },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }
            }
        } catch (err) {
            console.error("Error fetching item", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        let parsedUser = null;
        if (storedUser) {
            parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
        fetchItem(parsedUser);
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        const handleScroll = () => {
            const totalScroll = document.documentElement.scrollTop;
            const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scroll = `${totalScroll / windowHeight}`;
            setScrollProgress(scroll * 100);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLike = async () => {
        if (!user) return toast.error("Please login to like posts");
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.put(`${API}/knowledge/like/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Preserve populated author object if backend returns a raw ID
            let updatedData = res.data;
            if (updatedData.author && typeof updatedData.author === 'string' && item && typeof item.author === 'object') {
                updatedData.author = item.author;
            }
            setItem(updatedData);
        } catch (err) {
            console.error("Error liking post", err);
        }
    };

    const [replyText, setReplyText] = useState("");
    const [activeReplyId, setActiveReplyId] = useState(null);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!user) return toast.error("Please login to comment");
        if (!commentText.trim()) return;
        if (!commentText.trim()) return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.post(`${API}/knowledge/comment/${id}`,
                { text: commentText },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setItem(res.data);
            setCommentText("");
            toast.success("Comment added!");
        } catch (err) {
            console.error("Error commenting", err);
            toast.error("Failed to post comment");
        }
    };

    const handleReply = async (commentId) => {
        if (!user) return toast.error("Please login to reply");
        if (!replyText.trim()) return;

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.post(`${API}/knowledge/comment/${id}/reply/${commentId}`,
                { text: replyText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setItem(res.data);
            setReplyText("");
            setActiveReplyId(null);
            toast.success("Reply added!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to post reply");
        }
    };

    const handleCommentLike = async (commentId) => {
        if (!user) return toast.error("Please login to like comments");
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.put(`${API}/knowledge/comment/${id}/like/${commentId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItem(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to like comment");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this article?")) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API}/knowledge/delete/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Deleted successfully");
            navigate('/');
        } catch (err) {
            console.error("Error deleting item", err);
            toast.error("Error deleting item");
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied to clipboard!");
    };

    const toggleBookmark = async () => {
        if (!user) return toast.error("Please login to save articles");
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.put(`${API}/knowledge/${id}/bookmark`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const uid = user._id || user.id || user.userId;
            setIsBookmarked(res.data.bookmarkedBy?.includes(uid?.toString()));
            toast.success(res.data.message);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update bookmark");
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.delete(`${API}/knowledge/comment/${id}/${commentId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItem(res.data);
            toast.success("Comment deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete comment");
        }
    };

    const handleReplyDelete = async (commentId, replyId) => {
        if (!window.confirm("Delete this reply?")) return;
        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            const res = await axios.delete(`${API}/knowledge/comment/${id}/reply/${commentId}/${replyId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setItem(res.data);
            toast.success("Reply deleted");
        } catch (err) {
            console.error(err);
            toast.error("Failed to delete reply");
        }
    };

    if (loading) return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
            <div style={{ width: '40px', height: '40px', border: '4px solid var(--border-color)', borderTop: '4px solid var(--accent-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        </div>
    );

    if (!item) return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Article not found</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>This article may have been deleted or the link is invalid.</p>
            <Link to="/" style={{ padding: '0.8rem 1.5rem', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>Back to Home</Link>
        </div>
    );

    const isLiked = item.likes && user && item.likes.includes(user.username || user.name || user.email);
    const catStyles = getCategoryStyles(item.category);
    const readTime = Math.max(1, Math.ceil((item.content?.split(/\\s+/).length || 0) / 200));

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
            <style>
                {`
                @media (max-width: 992px) {
                    .knowledge-grid {
                        grid-template-columns: 1fr !important;
                    }
                }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                `}
            </style>

            {/* Scroll Progress Bar */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                height: '4px',
                width: `${scrollProgress}%`,
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                zIndex: 9999,
                transition: 'width 0.1s ease-out'
            }}></div>

            <div className="knowledge-grid" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 320px', gap: '3rem', alignItems: 'start' }}>

                {/* Main Content Area */}
                <main style={{ animation: 'fadeIn 0.6s ease-out' }}>

                    {/* Header Card */}
                    <div style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        marginBottom: '2rem'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <span style={{
                                padding: '6px 16px',
                                borderRadius: '20px',
                                background: catStyles.bg,
                                color: catStyles.color,
                                border: `1px solid ${catStyles.border}`,
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {item.category || 'General'}
                            </span>

                            {user && ((user.username || user.name || user.email) === (item.author?.username || item.author?.name || item.author?.email || item.author) || user.id === item.author?._id) && (
                                <div style={{ display: 'flex', gap: '0.8rem' }}>
                                    <Link to={`/edit/${item._id}`} style={{ color: '#94a3b8', padding: '8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex' }} title="Edit">
                                        <FaEdit />
                                    </Link>
                                    <button onClick={handleDelete} style={{ color: '#ef4444', padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: 'none', cursor: 'pointer', display: 'flex' }} title="Delete">
                                        <FaTrash />
                                    </button>
                                </div>
                            )}
                        </div>

                        {item.image && (
                            <img
                                src={item.image}
                                alt={item.title}
                                style={{
                                    width: '100%',
                                    maxHeight: '450px',
                                    objectFit: 'cover',
                                    borderRadius: '16px',
                                    marginBottom: '2rem',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                                }}
                            />
                        )}

                        <h1 style={{
                            fontSize: '3rem',
                            fontWeight: '800',
                            lineHeight: '1.2',
                            marginBottom: '1.5rem',
                            color: 'var(--text-primary)'
                        }}>
                            {item.title}
                        </h1>

                        {/* Author & Meta */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                {item.author?.profilePicture ? (
                                    <img src={item.author.profilePicture} alt="Author" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                                ) : (
                                    <Avatar name={item.author?.name || item.author || 'Admin'} size="48px" fontSize="1.2rem" />
                                )}
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                        <Link to={`/profile/${item.author?.username || item.author?._id || item.author}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {item.author?.name || item.author || 'Admin'}
                                        </Link>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaCalendarAlt /> {new Date(item.createdAt).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><FaClock /> {readTime} min read</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '1rem 0',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        flexWrap: 'wrap'
                    }}>
                        <button onClick={handleLike} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '50px',
                            background: isLiked ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-secondary)',
                            color: isLiked ? '#ef4444' : 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                            transform: isLiked ? 'scale(1.05)' : 'scale(1)'
                        }}>
                            {isLiked ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
                            {item.likes ? item.likes.length : 0} Likes
                        </button>

                        <button onClick={() => { document.getElementById('comments').scrollIntoView({ behavior: 'smooth' }); }} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '50px',
                            background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            fontWeight: '600', cursor: 'pointer', transition: 'background 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-card-hover)'} onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-secondary)'}>
                            <FaComment size={18} />
                            {item.comments ? item.comments.length : 0} Comments
                        </button>

                        <div style={{ flex: 1 }}></div>

                        <button onClick={toggleBookmark} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '50px',
                            background: 'transparent', color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = isBookmarked ? 'var(--accent-primary)' : 'var(--text-secondary)'}>
                            {isBookmarked ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />} Save
                        </button>

                        <button onClick={handleShare} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '50px',
                            background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
                        }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}>
                            <FaShareSquare size={16} /> Share
                        </button>

                    </div>


                    {/* Article Content */}
                    <article className="ql-editor" dangerouslySetInnerHTML={{ __html: item.content }} style={{
                        fontSize: '1.15rem',
                        lineHeight: '1.9',
                        color: 'var(--text-primary)',
                        marginBottom: '4rem',
                        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                        padding: 0
                    }} />

                    {/* Comments Section */}
                    <div id="comments" style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '24px',
                        padding: '2.5rem',
                        marginTop: '3rem'
                    }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Responses ({item.comments ? item.comments.length : 0})
                        </h2>

                        {/* Comment Input */}
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="You" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                            ) : (
                                <Avatar name={user?.name || 'Guest'} size="40px" fontSize="1rem" />
                            )}
                            <div style={{ flex: 1 }}>
                                <form onSubmit={handleComment}>
                                    <textarea
                                        placeholder="What are your thoughts?"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        style={{
                                            width: '100%',
                                            background: 'var(--bg-secondary)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '12px',
                                            padding: '1rem',
                                            color: 'var(--text-primary)',
                                            fontSize: '1rem',
                                            minHeight: '100px',
                                            resize: 'vertical',
                                            outline: 'none',
                                            fontFamily: 'inherit',
                                            marginBottom: '1rem',
                                            transition: 'border-color 0.2s'
                                        }}
                                        onFocus={(e) => e.target.style.borderColor = 'var(--accent-primary)'}
                                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" style={{
                                            background: '#3b82f6', color: 'white', padding: '10px 24px',
                                            borderRadius: '50px', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)', transition: 'background 0.2s'
                                        }} onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}>
                                            Respond
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Comment List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {item.comments && item.comments.length > 0 ? (
                                item.comments.map((comment, index) => {
                                    const commentUser = comment.user || {};
                                    const cUserName = typeof commentUser === 'object' ? (commentUser.name || 'User') : 'User';
                                    const cUserPic = typeof commentUser === 'object' ? commentUser.profilePicture : null;
                                    const cUserId = typeof commentUser === 'object' ? commentUser._id : null;
                                    const uid = user?._id || user?.id || user?.userId;
                                    const hasLiked = comment.likes?.includes(uid?.toString());
                                    const isArticleAuthor = uid === item.author?._id || uid === item.author;
                                    const hasCommentDeleteAccess = uid === cUserId || user?.role === 'admin' || user?.role === 'faculty' || isArticleAuthor;

                                    return (
                                        <div key={comment._id || index} style={{ borderBottom: index === item.comments.length - 1 ? 'none' : '1px solid var(--border-color)', paddingBottom: index === item.comments.length - 1 ? '0' : '1.5rem', marginTop: index === 0 ? '0' : '1.5rem' }}>
                                            {/* Main Comment */}
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
                                                {cUserPic ? (
                                                    <img src={cUserPic} alt={cUserName} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
                                                ) : (
                                                    <Avatar name={cUserName} size="36px" fontSize="0.9rem" />
                                                )}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {cUserName}
                                                        {uid && (uid === cUserId?.toString() || uid === cUserId) && <span style={{ fontSize: '0.7rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '2px 6px', borderRadius: '4px' }}>You</span>}
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{new Date(comment.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p style={{ margin: '6px 0', color: 'var(--text-primary)', opacity: 0.9, lineHeight: '1.6', fontSize: '0.95rem' }}>{comment.text}</p>

                                                    {/* Comment Actions */}
                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                                        <button onClick={() => handleCommentLike(comment._id)} style={{ background: 'none', border: 'none', color: hasLiked ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                                            {hasLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />} {comment.likes?.length || 0}
                                                        </button>
                                                        <button onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                                            Reply
                                                        </button>
                                                        {hasCommentDeleteAccess && (
                                                            <button onClick={() => handleCommentDelete(comment._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}>
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Reply Input Box */}
                                                    {activeReplyId === comment._id && (
                                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                                            <input
                                                                type="text"
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder={`Reply to ${cUserName}...`}
                                                                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none' }}
                                                            />
                                                            <button onClick={() => handleReply(comment._id)} style={{ background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '0 16px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
                                                                Post
                                                            </button>
                                                        </div>
                                                    )}

                                                    {/* Nested Replies */}
                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem', opacity: 0.9 }}>
                                                            {comment.replies.map((reply, rIdx) => {
                                                                const rUser = reply.user || {};
                                                                const rUserName = typeof rUser === 'object' ? (rUser.name || 'User') : 'User';
                                                                const rUserPic = typeof rUser === 'object' ? rUser.profilePicture : null;
                                                                const rUserId = typeof rUser === 'object' ? (rUser._id || rUser.id) : null;
                                                                const hasReplyDeleteAccess = uid === rUserId?.toString() || uid === rUserId || user?.role === 'admin' || user?.role === 'faculty' || isArticleAuthor;

                                                                return (
                                                                    <div key={reply._id || rIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                                                                        {rUserPic ? (
                                                                            <img src={rUserPic} alt={rUserName} style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                                                                        ) : (
                                                                            <Avatar name={rUserName} size="28px" fontSize="0.75rem" />
                                                                        )}
                                                                        <div style={{ flex: 1 }}>
                                                                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                                                {rUserName}
                                                                                {uid && (uid === rUserId?.toString() || uid === rUserId) && <span style={{ fontSize: '0.65rem', background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '1px 5px', borderRadius: '4px' }}>You</span>}
                                                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{new Date(reply.date).toLocaleDateString()}</span>
                                                                            </div>
                                                                            <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', lineHeight: '1.5', fontSize: '0.9rem' }}>{reply.text}</p>
                                                                            {hasReplyDeleteAccess && (
                                                                                <button onClick={() => handleReplyDelete(comment._id, reply._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '4px', padding: 0 }}>
                                                                                    <FaTrashAlt size={10} /> Delete
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>No responses yet. Be the first to share your thoughts!</p>
                            )}
                        </div>
                    </div>
                </main>

                {/* Right Sidebar */}
                <aside style={{ position: 'sticky', top: '90px' }}>

                    {/* Trending Articles Widget */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        padding: '1.5rem',
                        marginBottom: '2rem'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#f8fafc', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.8rem' }}>
                            Trending Articles
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            {trending.length > 0 ? trending.map((t, idx) => {
                                const tStyles = getCategoryStyles(t.category);
                                return (
                                    <Link to={`/view/${t._id}`} key={idx} style={{ textDecoration: 'none', display: 'flex', gap: '1rem', alignItems: 'center', group: 'true' }}>
                                        <div style={{
                                            width: '48px', height: '48px', borderRadius: '10px', flexShrink: 0,
                                            background: tStyles.bg,
                                            color: tStyles.color,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '1.2rem', fontWeight: 'bold'
                                        }}>
                                            {(t.category || 'G').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#e2e8f0', lineHeight: '1.3', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {t.title}
                                            </h4>
                                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.author?.name || 'Admin'}</span>
                                        </div>
                                    </Link>
                                );
                            }) : (
                                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No trending articles.</p>
                            )}
                        </div>
                    </div>

                    {/* Tags Widget */}
                    <div style={{
                        background: 'rgba(30, 41, 59, 0.4)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '24px',
                        padding: '1.5rem'
                    }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: '#f8fafc' }}>
                            Related Tags
                        </h3>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {['Technology', 'Science', 'Programming', 'Education', 'Design'].map((tag, idx) => (
                                <span key={idx} style={{
                                    padding: '6px 12px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '50px',
                                    fontSize: '0.8rem',
                                    color: '#cbd5e1',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.color = '#fff'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default KnowledgeView;

import API from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComment, FaEdit, FaTrash, FaCalendarAlt, FaClock, FaBookmark, FaRegBookmark, FaShareSquare } from 'react-icons/fa';
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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get(`/knowledge/${id}`);
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
            // ✅ USE CENTRALIZED API INSTANCE
            await API.post(`/knowledge/${id}/view`, { userId: identifier }).catch(e => console.error("View increment failed", e));

            // Fetch trending
            // ✅ USE CENTRALIZED API INSTANCE
            const trendRes = await API.get('/knowledge/trending');
            setTrending(trendRes.data.filter(t => t._id !== id).slice(0, 4));

            // Record visit
            if (activeUser) {
                // ✅ USE CENTRALIZED API INSTANCE (Interceptor handles token)
                await API.post('/api/users/visit', { articleId: id }).catch(e => console.error("Visit record failed", e));
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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.put(`/knowledge/like/${id}`);

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

        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.post(`/knowledge/comment/${id}`, { text: commentText });

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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.post(`/knowledge/comment/${id}/reply/${commentId}`, { text: replyText });
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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.put(`/knowledge/comment/${id}/like/${commentId}`);
            setItem(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to like comment");
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this article?")) return;
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            await API.delete(`/knowledge/delete/${id}`);
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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.put(`/knowledge/${id}/bookmark`);
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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.delete(`/knowledge/comment/${id}/${commentId}`);
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
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.delete(`/knowledge/comment/${id}/reply/${commentId}/${replyId}`);
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

    const isLiked = item.likes && user && item.likes.includes(user.userId || user._id || user.username);
    const catStyles = getCategoryStyles(item.category);
    const readTime = Math.max(1, Math.ceil((item.content?.split(/\s+/).length || 0) / 200));

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', paddingBottom: '4rem' }}>
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
                <main style={{ animation: 'fadeIn 0.6s ease-out' }}>
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

                            {user && ((user.username || user.name || user.email) === (item.author?.username || item.author?.name || item.author?.email || item.author) || user.id === item.author?._id || user._id === item.author?._id) && (
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

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <Avatar name={item.author?.name || 'Contributor'} size="48px" fontSize="1.2rem" />
                                <div>
                                    <div style={{ fontWeight: 'bold', fontSize: '1rem', color: 'var(--text-primary)' }}>
                                        <Link to={`/profile/${item.author?._id || item.author}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                            {item.author?.name || 'Contributor'}
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
                        }}>
                            <FaHeart size={18} />
                            {item.likes ? item.likes.length : 0} Likes
                        </button>

                        <button onClick={() => { document.getElementById('comments').scrollIntoView({ behavior: 'smooth' }); }} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '50px',
                            background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            fontWeight: '600', cursor: 'pointer'
                        }}>
                            <FaComment size={18} />
                            {item.comments ? item.comments.length : 0} Comments
                        </button>

                        <div style={{ flex: 1 }}></div>

                        <button onClick={toggleBookmark} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '50px',
                            background: 'transparent', color: isBookmarked ? 'var(--accent-primary)' : 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            fontWeight: '600', cursor: 'pointer'
                        }}>
                            {isBookmarked ? <FaBookmark size={16} /> : <FaRegBookmark size={16} />} Save
                        </button>

                        <button onClick={handleShare} style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '50px',
                            background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                            fontWeight: '600', cursor: 'pointer'
                        }}>
                            <FaShareSquare size={16} /> Share
                        </button>
                    </div>

                    <article className="ql-editor" dangerouslySetInnerHTML={{ __html: item.content }} style={{
                        fontSize: '1.15rem',
                        lineHeight: '1.9',
                        color: 'var(--text-primary)',
                        marginBottom: '4rem',
                        fontFamily: "'Inter', sans-serif",
                        padding: 0
                    }} />

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

                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
                            <Avatar name={user?.name || 'Guest'} size="40px" fontSize="1rem" />
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
                                            marginBottom: '1rem'
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                        <button type="submit" className="btn-primary" style={{ padding: '10px 24px', borderRadius: '50px' }}>
                                            Respond
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {item.comments && item.comments.length > 0 ? (
                                item.comments.map((comment, index) => {
                                    const commentUser = comment.user || {};
                                    const cUserName = commentUser.name || 'User';
                                    const cUserPic = commentUser.profilePicture;
                                    const cUserId = commentUser._id || commentUser.id;
                                    const uid = user?._id || user?.id || user?.userId;
                                    const hasLiked = comment.likes?.includes(uid?.toString());
                                    const isArticleAuthor = uid === item.author?._id || uid === item.author;
                                    const hasCommentDeleteAccess = uid === cUserId?.toString() || uid === cUserId || user?.role === 'admin' || user?.role === 'faculty' || isArticleAuthor;

                                    return (
                                        <div key={comment._id || index} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                <Avatar name={cUserName} size="36px" fontSize="0.9rem" />
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        {cUserName}
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>{new Date(comment.date).toLocaleDateString()}</span>
                                                    </div>
                                                    <p style={{ margin: '6px 0', color: 'var(--text-primary)', opacity: 0.9, lineHeight: '1.6', fontSize: '0.95rem' }}>{comment.text}</p>

                                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                                                        <button onClick={() => handleCommentLike(comment._id)} style={{ background: 'none', border: 'none', color: hasLiked ? '#ef4444' : 'var(--text-secondary)', cursor: 'pointer' }}>
                                                            Likes {comment.likes?.length || 0}
                                                        </button>
                                                        <button onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                                            Reply
                                                        </button>
                                                        {hasCommentDeleteAccess && (
                                                            <button onClick={() => handleCommentDelete(comment._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>

                                                    {activeReplyId === comment._id && (
                                                        <div style={{ marginTop: '1rem', display: 'flex', gap: '10px' }}>
                                                            <input
                                                                type="text"
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                placeholder={`Reply to ${cUserName}...`}
                                                                style={{ flex: 1, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '8px 12px', color: 'var(--text-primary)' }}
                                                            />
                                                            <button onClick={() => handleReply(comment._id)} className="btn-primary" style={{ borderRadius: '8px', padding: '0 16px' }}>
                                                                Post
                                                            </button>
                                                        </div>
                                                    )}

                                                    {comment.replies && comment.replies.length > 0 && (
                                                        <div style={{ marginTop: '1rem', borderLeft: '2px solid var(--border-color)', paddingLeft: '1rem' }}>
                                                            {comment.replies.map((reply, rIdx) => (
                                                                <div key={reply._id || rIdx} style={{ marginBottom: '1rem' }}>
                                                                    <div style={{ fontWeight: '600', fontSize: '0.85rem' }}>{reply.user?.name || 'User'}</div>
                                                                    <div style={{ fontSize: '0.9rem' }}>{reply.text}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No responses yet.</p>
                            )}
                        </div>
                    </div>
                </main>

                <aside style={{ position: 'sticky', top: '90px' }}>
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '1.5rem', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
                            Trending Articles
                        </h3>
                        {trending.map((t, idx) => (
                            <Link to={`/view/${t._id}`} key={idx} style={{ textDecoration: 'none', display: 'block', marginBottom: '1rem' }}>
                                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{t.title}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{t.author?.name || 'Contributor'}</span>
                            </Link>
                        ))}
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default KnowledgeView;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCalendar, FaHeart, FaComment, FaEdit, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const KnowledgeView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);

    const fetchItem = async (currentUser) => {
        try {
            const res = await axios.get(`http://localhost:5000/knowledge/${id}`);
            setItem(res.data);
            setLoading(false);

            // Record visit if user is logged in
            // Use passed currentUser or check localStorage if not provided (though passed is better)
            const activeUser = currentUser || user;

            if (activeUser && activeUser.username) {
                await axios.post(`http://localhost:5000/user/${activeUser.username}/visit`, { articleId: id });
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
    }, [id]);

    const handleLike = async () => {
        if (!user) return toast.error("Please login to like posts");
        try {
            const res = await axios.put(`http://localhost:5000/knowledge/like/${id}`, { username: user.username });
            setItem(res.data);
            toast.success("Liked!");
        } catch (err) {
            console.error("Error liking post", err);
        }
    };

    const handleComment = async () => {
        if (!user) return toast.error("Please login to comment");
        const text = prompt("Enter your comment:");
        if (!text) return;

        try {
            const res = await axios.post(`http://localhost:5000/knowledge/comment/${id}`, { username: user.username, text });
            setItem(res.data);
        } catch (err) {
            console.error("Error commenting", err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this article?")) return;
        try {
            await axios.delete(`http://localhost:5000/knowledge/delete/${id}`);
            toast.success("Deleted successfully");
            navigate('/');
        } catch (err) {
            console.error("Error deleting item", err);
            toast.error("Error deleting item");
        }
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem', color: '#fff' }}>Loading article...</div>;
    if (!item) return (
        <div style={{ textAlign: 'center', marginTop: '4rem', color: '#fff' }}>
            <h2>Article not found</h2>
            <p>This article may have been deleted or the link is invalid.</p>
            <Link to="/" style={{ color: '#60a5fa', textDecoration: 'underline' }}>Back to Home</Link>
        </div>
    );

    return (
        <div>
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="card" style={{ padding: '2rem' }}>

                    {/* Header */}
                    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                        <span className="card-tag" style={{ fontSize: '0.9rem' }}>{item.category}</span>
                        <h1 style={{ fontSize: '2.5rem', margin: '0.5rem 0', lineHeight: 1.2 }}>{item.title}</h1>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', color: '#94a3b8' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaUserCircle />
                                    By <Link to={`/profile/${item.author}`} style={{ color: '#60a5fa', fontWeight: 'bold' }}>{item.author || 'Admin'}</Link>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaCalendar /> {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    onClick={handleLike}
                                    style={{ background: 'none', border: 'none', color: item.likes && user && item.likes.includes(user.username) ? '#ef4444' : '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}
                                    title={item.likes && user && item.likes.includes(user.username) ? "Unlike this article" : "Like this article"}
                                >
                                    <FaHeart /> {item.likes ? item.likes.length : 0} Likes
                                </button>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <FaComment /> {item.comments ? item.comments.length : 0} Comments
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#f1f5f9', whiteSpace: 'pre-wrap' }}>
                        {item.content}
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '3rem', paddingTop: '1rem', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <button className="btn-primary" onClick={handleComment} title="Write a new comment">
                            Write a Comment
                        </button>

                        {user && user.username === item.author && (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link to={`/edit/${item._id}`} className="btn-icon edit" style={{ background: '#3b82f6', color: 'white', padding: '0.5rem', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Edit">
                                    <FaEdit />
                                </Link>
                                <button onClick={handleDelete} className="btn-icon delete" style={{ background: '#ef4444', color: 'white', padding: '0.5rem', borderRadius: '5px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Delete">
                                    <FaTrash />
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Comments Section */}
                <div style={{ marginTop: '2rem' }}>
                    <h3>Comments ({item.comments ? item.comments.length : 0})</h3>
                    {item.comments && item.comments.map((comment, index) => (
                        <div key={index} className="card" style={{ padding: '1rem', marginBottom: '1rem', background: '#1e293b' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 'bold', color: '#60a5fa' }}>{comment.user}</span>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{new Date(comment.date).toLocaleDateString()}</span>
                            </div>
                            <p style={{ margin: 0, color: '#e2e8f0' }}>{comment.text}</p>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default KnowledgeView;

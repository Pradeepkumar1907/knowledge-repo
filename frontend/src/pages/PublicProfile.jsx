import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Avatar from '../components/Avatar';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaBook, FaCode, FaGraduationCap, FaComments, FaFlask, FaHistory, FaCalculator, FaGlobe } from 'react-icons/fa';

const getIcon = (category) => {
    switch (category) {
        case 'Programming': return <FaCode />;
        case 'Science': return <FaFlask />;
        case 'History': return <FaHistory />;
        case 'Math': return <FaCalculator />;
        case 'General': return <FaBook />;
        default: return <FaGlobe />;
    }
};


const PublicProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [knowledgeList, setKnowledgeList] = useState([]);
    const [profileUser, setProfileUser] = useState(null);
    const [stats, setStats] = useState({ likes: 0, reviews: 0 });
    const [loading, setLoading] = useState(true);
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [isFollowing, setIsFollowing] = useState(false);


    const currentUser = JSON.parse(sessionStorage.getItem('user'));


    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const fetchProfileData = async () => {
        try {
            const token = localStorage.getItem('token');
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };

            let targetUser = null;

            const cleanUsername = username?.trim();
            console.log(`[DEBUG] Resolving profile for: "${cleanUsername}"`);

            // 1. Try resolving by ID directly first
            const isId = /^[0-9a-fA-F]{24}$/.test(cleanUsername);

            if (isId) {
                const profileUrl = `http://localhost:5000/api/users/profile/${cleanUsername}`;
                console.log(`[DEBUG] Attempting direct ID lookup: ${profileUrl}`);
                try {
                    const profileRes = await axios.get(profileUrl, authConfig);
                    targetUser = profileRes.data;
                    console.log(`[DEBUG] Direct ID lookup SUCCESS`);
                } catch (e) {
                    console.warn(`[DEBUG] Direct ID lookup FAILED (Expected if search fallback needed): ${e.response?.status}`);
                }
            }

            // 2. Fallback: Search by name/email (or ID if previous failed)
            if (!targetUser) {
                const searchUrl = `http://localhost:5000/api/users/search?q=${cleanUsername}`;
                console.log(`[DEBUG] Attempting fallback search: ${searchUrl}`);
                try {
                    const searchRes = await axios.get(searchUrl, authConfig);
                    console.log(`[DEBUG] Fallback search returned ${searchRes.data.length} results`);

                    // Find most likely match or first result
                    const resolved = searchRes.data.find(u => u.name.toLowerCase() === cleanUsername.toLowerCase()) ||
                        searchRes.data.find(u => u._id === cleanUsername) ||
                        searchRes.data[0];

                    if (resolved && resolved._id) {
                        console.log(`[DEBUG] Search resolved to user: ${resolved._id}. Fetching full profile stats.`);
                        const profileRes = await axios.get(`http://localhost:5000/api/users/profile/${resolved._id}`, authConfig);
                        targetUser = profileRes.data;
                    }
                } catch (e) {
                    console.error("[DEBUG] Search fallback critical failure", e);
                }
            }

            if (targetUser) {
                setProfileUser(targetUser);
                setFollowersCount(targetUser.followersCount || 0);
                setFollowingCount(targetUser.followingCount || 0);
                setIsFollowing(targetUser.isFollowing || false);

                // 3. Knowledge Feed Logic
                const articlesRes = await axios.get('http://localhost:5000/knowledge/all');
                const tId = targetUser.id || targetUser._id;
                console.log(`[DEBUG] Fetching articles for author ID: ${tId}`);
                const items = articlesRes.data.filter(item => {
                    const authorId = (item.author?._id || item.author)?.toString();
                    return authorId === tId?.toString();
                });

                let totalLikes = 0;
                let totalComments = 0;
                items.forEach(item => {
                    if (item.likes) totalLikes += item.likes.length;
                    if (item.comments) totalComments += item.comments.length;
                });
                setStats({ likes: totalLikes, reviews: totalComments });
                setKnowledgeList(items);
            } else {
                // If still no user, reset state
                setProfileUser(null);
            }

            setLoading(false);
        } catch (err) {
            console.error("Error fetching profile data", err);
            setLoading(false);
        }
    };



    const toggleFollow = async () => {
        if (!currentUser) return navigate('/login');
        if (!profileUser) return;

        try {
            const token = localStorage.getItem('token');
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };

            if (isFollowing) {
                await axios.post(`http://localhost:5000/api/users/unfollow/${profileUser.id}`, {}, authConfig);
                setFollowersCount(prev => prev - 1);
            } else {
                await axios.post(`http://localhost:5000/api/users/follow/${profileUser.id}`, {}, authConfig);
                setFollowersCount(prev => prev + 1);
            }
            setIsFollowing(!isFollowing);
        } catch (err) {
            console.error("Error toggling follow", err);
        }
    };

    const handleMessage = async () => {
        if (!currentUser) return navigate('/login');
        if (!profileUser) return;

        try {
            const token = localStorage.getItem('token');
            const authConfig = { headers: { Authorization: `Bearer ${token}` } };
            await axios.post('http://localhost:5000/api/chat/conversation', { participantId: profileUser.id }, authConfig);
            navigate('/chat');
        } catch (err) {
            console.error("Error starting conversation", err);
        }
    };


    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
            <div className="container" style={{ maxWidth: '800px', padding: '2rem 1rem' }}>

                {/* Profile Header */}
                <div className="profile-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', animation: 'fadeIn 0.5s ease-out' }}>
                    <Avatar name={profileUser?.name || username} size="120px" fontSize="3rem" />

                    <h2 className="profile-name" style={{ fontSize: '2rem', fontWeight: '800', margin: '1.5rem 0 0.5rem 0', color: 'var(--text-primary)' }}>
                        {profileUser?.name || username}
                    </h2>

                    <span className="profile-role" style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                        {profileUser?.role === 'student' ? 'Student' : 'Faculty / Contributor'}
                    </span>

                    <div className="profile-meta" style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', background: 'var(--bg-secondary)', padding: '6px 16px', borderRadius: '20px', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                        Active {profileUser?.role === 'student' ? 'Learner' : 'Contributor'}
                    </div>

                    {((currentUser?.id || currentUser?._id) !== profileUser?.id) && (
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <button
                                onClick={toggleFollow}
                                style={{
                                    background: isFollowing ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                    color: isFollowing ? 'var(--text-primary)' : 'white',
                                    border: isFollowing ? '1px solid var(--border-color)' : 'none',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '50px',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    boxShadow: isFollowing ? 'none' : '0 4px 15px rgba(37, 99, 235, 0.3)',
                                }}
                            >
                                {isFollowing ? 'Following' : 'Follow'}

                            </button>
                            <button
                                onClick={handleMessage}
                                style={{
                                    background: 'var(--bg-card)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-color)',
                                    padding: '0.8rem 2rem',
                                    borderRadius: '50px',
                                    fontWeight: '700',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <FaComments /> Message
                            </button>
                        </div>
                    )}
                </div>

                {/* Followers/Following Stats */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    marginBottom: '2rem',
                    padding: '1rem',
                    background: 'var(--bg-card)',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)'
                }}>
                    <div
                        onClick={() => navigate(`/followers/${profileUser?.id || profileUser?._id}`)}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                    >
                        <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800' }}>{followersCount}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Followers</span>
                    </div>
                    <div
                        onClick={() => navigate(`/following/${profileUser?.id || profileUser?._id}`)}
                        style={{ textAlign: 'center', cursor: 'pointer' }}
                    >
                        <span style={{ display: 'block', fontSize: '1.2rem', fontWeight: '800' }}>{followingCount}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Following</span>
                    </div>
                </div>



                {/* Stats Grid */}
                <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                    <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <span className="stat-label" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Articles</span>
                        <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{knowledgeList.length}</span>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <span className="stat-label" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Likes</span>
                        <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.likes}</span>
                    </div>
                    <div className="stat-card" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '20px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <span className="stat-label" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Reviews</span>
                        <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--text-primary)' }}>{stats.reviews}</span>
                    </div>
                </div>

                {/* Contributions List */}
                <div className="section-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: '700' }}>Published Articles</h3>
                </div>

                <div className="contribution-list">
                    {knowledgeList.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-card)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>No articles published yet.</p>
                        </div>
                    ) : (
                        knowledgeList.map(item => (
                            <div key={item._id} className="contribution-item" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                padding: '1rem',
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '16px',
                                marginBottom: '1rem',
                                transition: 'transform 0.2s',
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <div className="item-icon" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--accent-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: '10px',
                                    fontSize: '1.2rem'
                                }}>
                                    {getIcon(item.category)}
                                </div>
                                <div className="item-info" style={{ flex: 1 }}>
                                    <span className="item-title" style={{ display: 'block', fontWeight: '600', color: 'var(--text-primary)', fontSize: '1.05rem' }}>{item.title}</span>
                                    <span className="item-date" style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        {new Date(item.createdAt).toLocaleDateString()} • {item.likes ? item.likes.length : 0} Likes
                                    </span>
                                </div>
                                <Link to={`/view/${item._id}`} style={{ marginLeft: 'auto', textDecoration: 'none' }}>
                                    <button style={{
                                        background: 'var(--accent-primary)',
                                        color: '#fff',
                                        border: 'none',
                                        padding: '0.6rem 1.2rem',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s'
                                    }}
                                        onMouseEnter={(e) => e.target.style.opacity = '0.9'}
                                        onMouseLeave={(e) => e.target.style.opacity = '1'}
                                    >
                                        Read
                                    </button>
                                </Link>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div >
    );
};

export default PublicProfile;

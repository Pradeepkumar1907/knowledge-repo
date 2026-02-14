import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Avatar from '../components/Avatar';
import { useParams } from 'react-router-dom';
import { FaBook, FaCode, FaGraduationCap } from 'react-icons/fa';

const PublicProfile = () => {
    const { username } = useParams();
    const [knowledgeList, setKnowledgeList] = useState([]);
    const [stats, setStats] = useState({ likes: 0, reviews: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const fetchProfileData = async () => {
        try {
            const res = await axios.get('http://localhost:5000/knowledge/all');
            const items = res.data.filter(item => item.author === username);

            let totalLikes = 0;
            let totalComments = 0;
            items.forEach(item => {
                if (item.likes) totalLikes += item.likes.length;
                if (item.comments) totalComments += item.comments.length;
            });
            setStats({ likes: totalLikes, reviews: totalComments });
            setKnowledgeList(items);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching data", err);
            setLoading(false);
        }
    };

    // Helper to get random icon
    const getIcon = (cat) => {
        if (cat.toLowerCase().includes('react') || cat.toLowerCase().includes('code')) return <FaCode />;
        if (cat.toLowerCase().includes('science')) return <FaGraduationCap />;
        return <FaBook />;
    };

    if (loading) return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Loading profile...</div>;

    return (
        <div>
            <div className="container" style={{ maxWidth: '600px' }}>

                {/* Profile Header */}
                <div className="profile-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
                    <Avatar name={username} size="100px" fontSize="2.5rem" />

                    <h2 className="profile-name">
                        {username}
                    </h2>

                    <span className="profile-role">
                        Faculty / Contributor
                    </span>

                    <div className="profile-meta">
                        Active Contributor
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <span className="stat-label">Articles</span>
                        <span className="stat-value">{knowledgeList.length}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Likes</span>
                        <span className="stat-value">{stats.likes}</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-label">Reviews</span>
                        <span className="stat-value">{stats.reviews}</span>
                    </div>
                </div>

                {/* Contributions List */}
                <div className="section-header">
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Published Articles</h3>
                </div>

                <div className="contribution-list">
                    {knowledgeList.length === 0 ? (
                        <p style={{ color: '#94a3b8', textAlign: 'center' }}>No articles published yet.</p>
                    ) : (
                        knowledgeList.map(item => (
                            <div key={item._id} className="contribution-item">
                                <div className="item-icon">
                                    {getIcon(item.category)}
                                </div>
                                <div className="item-info">
                                    <span className="item-title">{item.title}</span>
                                    <span className="item-date">
                                        {new Date(item.createdAt).toLocaleDateString()} • {item.likes ? item.likes.length : 0} Likes
                                    </span>
                                </div>
                                <Link to={`/view/${item._id}`} style={{ marginLeft: 'auto' }}>
                                    <button style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                                        Read
                                    </button>
                                </Link>
                            </div>
                        ))
                    )}
                </div>

            </div>
        </div>
    );
};

export default PublicProfile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaHeart, FaEdit, FaTrash, FaLayerGroup, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import StatCard from '../components/StatCard';
import Analytics from '../components/Analytics';

// ✅ USE CENTRALIZED API INSTANCE
import API from '../api';

const FacultyDashboard = () => {
    const navigate = useNavigate();

    const [articles, setArticles] = useState([]);
    const [dashboardStats, setDashboardStats] = useState({
        totalArticles: 0,
        totalViews: 0,
        totalLikes: 0,
        totalComments: 0
    });
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [sortBy, setSortBy] = useState('newest');

    // ✅ FETCH USER
    const fetchUserData = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get('/auth/me');

            setUser(res.data);
            sessionStorage.setItem('user', JSON.stringify(res.data));

        } catch (err) {
            console.error(err);
            navigate('/login');
        }
    };

    // ✅ FETCH STATS
    const fetchStats = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get('/knowledge/faculty/stats');

            setDashboardStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ FETCH ARTICLES
    const fetchArticles = async () => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            const res = await API.get('/knowledge/all');
            setArticles(res.data);
        } catch (err) {
            toast.error("Failed to fetch content");
        }
    };

    // ✅ DELETE
    const handleDelete = async (id) => {
        try {
            // ✅ USE CENTRALIZED API INSTANCE
            await API.delete(`/knowledge/delete/${id}`);

            toast.success("Deleted");
            fetchArticles();
        } catch {
            toast.error("Delete failed");
        }
    };

    useEffect(() => {
        fetchUserData();
        fetchArticles();
        fetchStats();
    }, []);

    // Filter
    const myArticles = user
        ? articles.filter(a =>
            (a.author?.name === user.name) ||
            (a.author === user.name)
        )
        : [];

    const filteredArticles = myArticles
        .filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

    if (!user) return null;

    return (
        <div style={{ display: 'flex' }}>

            <Sidebar />

            <div style={{ flex: 1 }}>
                <TopBar user={user} onSearch={setSearch} searchTerm={search} />

                <div style={{ padding: '2rem' }}>

                    <h1>Welcome {user.name} 👋</h1>

                    {/* Stats */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <StatCard title="Articles" value={dashboardStats.totalArticles} icon={<FaLayerGroup />} />
                        <StatCard title="Views" value={dashboardStats.totalViews} icon={<FaEye />} />
                        <StatCard title="Likes" value={dashboardStats.totalLikes} icon={<FaHeart />} />
                    </div>

                    <Analytics articles={myArticles} />

                    {/* Articles */}
                    <h2>My Articles</h2>

                    {filteredArticles.map(article => (
                        <div key={article._id} style={{ border: '1px solid gray', padding: '10px', margin: '10px 0' }}>

                            <h3>{article.title}</h3>

                            <p>
                                <FaEye /> {article.views}
                            </p>

                            <button onClick={() => navigate(`/edit/${article._id}`)}>
                                <FaEdit />
                            </button>

                            <button onClick={() => handleDelete(article._id)}>
                                <FaTrash />
                            </button>

                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;

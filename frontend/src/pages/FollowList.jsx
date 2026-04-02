import API from '../api';
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserCheck, FaComments, FaArrowLeft, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Avatar from '../components/Avatar';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';

const FollowList = () => {
    const { userId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const type = location.pathname.includes('followers') ? 'followers' : 'following';

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentUser, setCurrentUser] = useState(JSON.parse(sessionStorage.getItem('user')) || {});

    // Layout States
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchUsers = async (pageNum = 1, append = false) => {
        try {
            setLoading(true);

            // ✅ USE CENTRALIZED API INSTANCE (Interceptors handle token)
            const url = `/api/users/${type}${userId ? `/${userId}` : ''}?page=${pageNum}&limit=20`;
            const res = await API.get(url);

            if (append) {
                setUsers(prev => [...(prev || []), ...(res.data?.users || [])]);
            } else {
                setUsers(res.data?.users || []);
            }
            setTotal(res.data?.total || 0);
            setPage(res.data?.page || 1);
            setLoading(false);
        } catch (err) {
            console.error(`Error fetching ${type}:`, err);
            if (err.response?.status === 401) {
                toast.error("Authentication required");
                navigate('/login');
            } else {
                toast.error(`Failed to load ${type}`);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(1, false);
    }, [type, userId]);

    const handleToggleFollow = async (e, targetUser) => {
        e.stopPropagation();
        try {
            const isFollowing = targetUser.isFollowing;
            const url = `/api/users/${isFollowing ? 'unfollow' : 'follow'}/${targetUser._id}`;
            // ✅ USE CENTRALIZED API INSTANCE
            await API.post(url);

            setUsers(prev => prev.map(u =>
                u._id === targetUser._id ? { ...u, isFollowing: !isFollowing } : u
            ));
        } catch (err) {
            console.error("Error toggling follow:", err);
            toast.error("Follow action failed");
        }
    };

    const handleMessage = (e, targetUserId) => {
        e.stopPropagation();
        navigate(`/chat?userId=${targetUserId}`);
    };

    const filteredUsers = (users || []).filter(u =>
        u && u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u && u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex' }}>
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

            <div style={{
                flex: 1,
                marginLeft: isMobile ? '0' : (sidebarCollapsed ? '80px' : '260px'),
                transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}>
                <TopBar user={currentUser} />

                <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
                        <button
                            onClick={() => navigate(-1)}
                            style={{
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                padding: '10px',
                                borderRadius: '50%',
                                color: 'var(--text-primary)',
                                cursor: 'pointer'
                            }}
                        >
                            <FaArrowLeft />
                        </button>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', textTransform: 'capitalize' }}>
                            {type} <span style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', fontWeight: '500' }}>({total})</span>
                        </h1>
                    </div>

                    <div style={{ position: 'relative', marginBottom: '2rem' }}>
                        <FaSearch style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                        <input
                            type="text"
                            placeholder={`Search ${type}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                background: 'var(--bg-secondary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '12px',
                                padding: '12px 12px 12px 45px',
                                color: 'var(--text-primary)',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                        {filteredUsers.length === 0 && !loading ? (
                            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No users found.
                            </div>
                        ) : (
                            filteredUsers.map(u => (
                                <div
                                    key={u._id}
                                    onClick={() => navigate(`/profile/${u._id}`)}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        borderBottom: '1px solid var(--border-color)',
                                        transition: 'background 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    className="user-list-item"
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <Avatar name={u.name} src={u.profilePicture} size="50px" />
                                        <div>
                                            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '700' }}>{u.name}</h4>
                                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                {u.role} • {u.bio || 'No bio yet'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', gap: '0.8rem' }}>
                                        {u._id !== currentUser.id && u._id !== currentUser._id && (
                                            <>
                                                <button
                                                    onClick={(e) => handleToggleFollow(e, u)}
                                                    style={{
                                                        padding: '6px 16px',
                                                        borderRadius: '8px',
                                                        fontSize: '0.85rem',
                                                        fontWeight: '600',
                                                        border: u.isFollowing ? '1px solid var(--border-color)' : 'none',
                                                        background: u.isFollowing ? 'transparent' : 'var(--accent-primary)',
                                                        color: u.isFollowing ? 'var(--text-primary)' : 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '6px'
                                                    }}
                                                >
                                                    {u.isFollowing ? <><FaUserCheck /> Following</> : <><FaUserPlus /> Follow</>}
                                                </button>
                                                <button
                                                    onClick={(e) => handleMessage(e, u._id)}
                                                    style={{
                                                        padding: '8px',
                                                        borderRadius: '8px',
                                                        background: 'var(--bg-primary)',
                                                        border: '1px solid var(--border-color)',
                                                        color: 'var(--text-primary)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <FaComments />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {users.length < total && (
                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button
                                onClick={() => fetchUsers(page + 1, true)}
                                disabled={loading}
                                style={{
                                    padding: '0.8rem 2rem',
                                    borderRadius: '12px',
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    opacity: loading ? 0.5 : 1
                                }}
                            >
                                {loading ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default FollowList;

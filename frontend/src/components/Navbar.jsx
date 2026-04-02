import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaPlus, FaSignOutAlt, FaSearch, FaBell, FaCog, FaBookmark, FaThLarge, FaSun, FaMoon } from 'react-icons/fa';
import Avatar from './Avatar';
import { useTheme } from '../context/ThemeContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        const checkUser = () => {
            const storedUser = sessionStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            } else {
                setUser(null);
            }
        };

        checkUser();
    }, [location.pathname]);

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const isAdmin = user?.role?.toLowerCase() === 'admin';
    const isFaculty = user?.role?.toLowerCase() === 'faculty' || isAdmin;
    const isStudent = user?.role?.toLowerCase() === 'student';

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (isAdmin) return '/admin';
        if (isFaculty) return '/faculty-dashboard';
        if (isStudent) return '/student-dashboard';
        return '/';
    };

    return (
        <nav className="top-bar">
            {/* Left: Brand */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', textDecoration: 'none' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))', padding: '8px', borderRadius: '10px', display: 'flex', boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)' }}>
                    <FaBook style={{ color: 'white', fontSize: '1.2rem' }} />
                </div>
                <span style={{ fontSize: '1.2rem', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
                    Repo<span style={{ color: 'var(--accent-primary)' }}>.edu</span>
                </span>
            </Link>

            {/* Center: Navigation */}
            <div className="nav-center">
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Explore</Link>
                {!isAdmin && <Link to="/categories" className={`nav-link ${location.pathname === '/categories' ? 'active' : ''}`}>Categories</Link>}
                {/* {user && !isAdmin && <Link to={getDashboardPath()} className={`nav-link ${location.pathname === getDashboardPath() ? 'active' : ''}`}>My Learning</Link>} */}
            </div>

            {/* Right: Actions */}
            <div className="nav-right">
                <button
                    className="icon-btn"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    onClick={toggleTheme}
                    style={{ color: theme === 'dark' ? '#fde047' : 'var(--text-secondary)' }}
                >
                    {theme === 'dark' ? <FaSun /> : <FaMoon />}
                </button>

                <button className="icon-btn" title="Search" onClick={() => navigate('/search')}>
                    <FaSearch />
                </button>

                {user ? (
                    <>
                        {isFaculty && (
                            <Link to="/add" style={{ textDecoration: 'none' }}>
                                <button className="new-btn">
                                    <FaPlus size={12} /> <span style={{ fontSize: '0.85rem' }}>Add New</span>
                                </button>
                            </Link>
                        )}

                        <button className="icon-btn" title="Saved Articles" onClick={() => navigate('/saved')}>
                            <FaBookmark />
                        </button>

                        <NotificationDropdown user={user} />

                        <Link to={getDashboardPath()} style={{ textDecoration: 'none' }}>
                            <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'} title="Go to Dashboard">
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }} />
                                ) : (
                                    <Avatar name={user.name} size="40px" fontSize="0.9rem" />
                                )}
                            </div>
                        </Link>
                    </>
                ) : (
                    <Link to="/login">
                        <button className="new-btn" style={{ padding: '0.6rem 1.2rem' }}>
                            Login
                        </button>
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

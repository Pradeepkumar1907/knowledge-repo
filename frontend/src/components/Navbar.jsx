import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBook, FaPlus, FaSignOutAlt } from 'react-icons/fa';
import Avatar from './Avatar';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    // Refresh user verification on every route change or mount
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
    }, [location.pathname]); // Update when path changes

    const handleLogout = () => {
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('role');
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const isAdmin = user?.role?.toLowerCase() === 'faculty';

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'student') return '/student-dashboard';
        if (user.role === 'faculty') return '/faculty-dashboard';
        return '/dashboard'; // Admin or default
    };

    return (
        <nav className="navbar top-bar" style={{ background: '#0f172a', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Brand Logo */}
            <div className="navbar-brand">
                <Link to="/" style={{ fontSize: '1.2rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
                    <div style={{ background: '#3b82f6', padding: '6px', borderRadius: '8px', display: 'flex' }}>
                        <FaBook style={{ color: 'white', fontSize: '1.1rem' }} />
                    </div>
                    <span style={{ color: 'white', letterSpacing: '0.5px' }}>Repo.edu</span>
                </Link>
            </div>

            {/* Navbar Actions */}
            <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <Link to="/" style={{ color: '#94a3b8', fontSize: '1rem', fontWeight: '500' }} className="nav-link">Home</Link>

                {user ? (
                    <>
                        {/* Admin Action: Add New Article */}
                        {isAdmin && (
                            <Link to="/add">
                                <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '5px', width: 'auto' }}>
                                    <FaPlus size={12} /> Add New
                                </button>
                            </Link>
                        )}

                        {/* Profile Avatar */}
                        <Link to={getDashboardPath()} title="My Dashboard" style={{ textDecoration: 'none' }}>
                            <div style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
                                {user.profilePicture ? (
                                    <img src={user.profilePicture} alt={user.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                                ) : (
                                    <Avatar name={user.name || 'User'} size="40px" fontSize="0.9rem" />
                                )}
                            </div>
                        </Link>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', fontSize: '0.9rem' }}
                            title="Logout"
                        >
                            <FaSignOutAlt />
                        </button>
                    </>
                ) : (
                    <>
                        {/* Guest State */}
                        <Link to="/login" style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem' }}>Login</Link>

                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

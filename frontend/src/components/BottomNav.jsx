import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaBook, FaPlus, FaUser, FaCog } from 'react-icons/fa';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser));
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <div className="bottom-nav">
            <div
                className={`nav-item ${isActive('/') ? 'active' : ''}`}
                onClick={() => navigate('/')}
            >
                <FaHome />
                <span>Home</span>
            </div>

            <div
                className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => {
                    // If admin, go to console, else maybe library/explore
                    if (user?.role === 'admin' || user?.role === 'Admin') navigate('/admin');
                    else navigate('/'); // Or a library page if exists
                }}
            >
                <FaBook />
                <span>{user?.role === 'admin' || user?.role === 'Admin' ? 'Admin' : 'Library'}</span>
            </div>

            <div className="nav-fab-container">
                <button className="nav-fab" onClick={() => navigate('/add')}>
                    <FaPlus />
                </button>
            </div>

            {/* Spacer */}
            <div style={{ width: '20px' }}></div>

            <div
                className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
            >
                <FaUser />
                <span>Profile</span>
            </div>

            <div className="nav-item">
                <FaCog />
                <span>Settings</span>
            </div>
        </div>
    );
};

export default BottomNav;

import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell, FaPlus, FaChevronDown, FaHome, FaCheckDouble, FaComments } from 'react-icons/fa';

import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from './Avatar';
import NotificationDropdown from './NotificationDropdown';

const TopBar = ({ user, onSearch, searchTerm }) => {
    const navigate = useNavigate();
    const [localSearch, setLocalSearch] = useState('');

    return (
        <header style={{
            height: '70px',
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 1000
        }}>
            {/* Search Bar */}
            <div style={{ position: 'relative', width: '400px' }}>
                <FaSearch style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-secondary)'
                }} />
                <input
                    type="text"
                    placeholder="Search articles, analytics, or settings... (Enter)"
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (typeof onSearch === 'function') {
                                onSearch(localSearch);
                            } else {
                                navigate(`/search?q=${localSearch}`);
                            }
                        }
                    }}
                    style={{
                        width: '100%',
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '50px',
                        padding: '10px 16px 10px 44px',
                        color: 'var(--text-primary)',
                        fontSize: '0.95rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                    }}
                    className="topbar-search"
                />
            </div>

            {/* Right Actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>

                <button
                    onClick={() => navigate('/')}
                    className="btn-secondary"
                    style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        padding: '0.6rem 1.2rem',
                        borderRadius: '50px',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-card-hover)';
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                    }}
                >
                    <FaHome /> Home
                </button>

                {(user?.role === "admin" || user?.role === "faculty") && (
                    <button
                        className="new-btn"
                        onClick={() => navigate('/add')}
                        style={{
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            color: 'white',
                            padding: '0.6rem 1rem',
                            borderRadius: '50px',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                            transition: 'transform 0.2s'
                        }}
                    >
                        <FaPlus /> New Article
                    </button>
                )}


                <button
                    onClick={() => navigate('/chat')}
                    style={{
                        background: 'var(--bg-secondary)',
                        color: 'var(--text-primary)',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.color = 'var(--accent-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                >
                    <FaComments />
                </button>

                <NotificationDropdown user={user} />


                <div style={{ height: '32px', width: '1px', background: 'var(--border-color)' }}></div>

                <div
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                    onClick={() => {
                        const userId = user?.id || user?._id;
                        if (userId) {
                            navigate(`/profile/${userId}`);
                        } else {
                            // Fallback to dashboard if ID is somehow missing
                            if (user?.role === 'admin') navigate('/admin');
                            else if (user?.role === 'faculty') navigate('/faculty-dashboard');
                            else navigate('/student-dashboard');
                        }
                    }}
                >

                    {user?.profilePicture ? (
                        <img
                            src={user.profilePicture}
                            alt={user.name}
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid rgba(59, 130, 246, 0.5)'
                            }}
                        />
                    ) : (
                        <Avatar name={user?.name || 'User'} size="36px" fontSize="1rem" />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)' }}>{user?.name}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{user?.role === 'admin' ? 'Administrator' : user?.role === 'faculty' ? 'Faculty Member' : user?.role === 'student' ? 'Student' : 'User'}</span>
                    </div>
                    <FaChevronDown style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }} />
                </div>
            </div>
        </header >
    );
};

export default TopBar;

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from './Modal';
import {
    FaChartPie,
    FaBook,
    FaFileAlt,
    FaCog,
    FaSignOutAlt,
    FaChevronLeft,
    FaChevronRight,
    FaLayerGroup,
    FaSun,
    FaMoon,
    FaPlus
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState(JSON.parse(sessionStorage.getItem('user') || 'null'));

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const getDashboardPath = () => {
        if (user?.role === 'admin') return '/admin';
        if (user?.role === 'faculty') return '/faculty-dashboard';
        return '/student-dashboard';
    };

    const allMenuItems = [
        { path: getDashboardPath(), label: 'Dashboard', icon: <FaChartPie /> },
        { path: '/categories', label: 'Explore Categories', icon: <FaLayerGroup /> },
        { path: '/admin/categories', label: 'Manage Categories', icon: <FaLayerGroup />, adminOnly: true },
        { path: '/add', label: 'Add New Content', icon: <FaPlus />, facultyOnly: true },
        { path: '/saved', label: 'Saved Articles', icon: <FaBook /> },
    ];

    const menuItems = allMenuItems.filter(item => {
        if (item.adminOnly && user?.role !== 'admin') return false;
        if (item.facultyOnly && user?.role !== 'faculty' && user?.role !== 'admin') return false;
        if (item.studentOnly && user?.role !== 'student') return false;
        return true;
    });

    const handleLogoutClick = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        sessionStorage.clear();
        localStorage.removeItem('token');

        toast.success("Successfully logged out", {
            style: {
                background: 'rgba(15, 23, 42, 0.9)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)'
            },
            iconTheme: {
                primary: '#4ade80',
                secondary: '#0f172a',
            },
        });

        setTimeout(() => {
            navigate('/login');
        }, 500);
    };

    // Mobile Overlay Style
    const sidebarStyle = isMobile ? {
        transform: collapsed ? 'translateX(-100%)' : 'translateX(0)',
        width: '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        zIndex: 1000,
        transition: 'transform 0.3s ease-in-out',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        boxShadow: collapsed ? 'none' : '0 0 20px rgba(0,0,0,0.5)'
    } : {
        width: collapsed ? '80px' : '260px',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        background: 'var(--bg-secondary)',
        backdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-color)',
        zIndex: 100,
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem'
    };

    return (
        <>
            {/* Mobile Overlay Backdrop */}
            {isMobile && !collapsed && (
                <div
                    onClick={onToggle}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 999
                    }}
                />
            )}

            <aside className={`dashboard-sidebar ${collapsed ? 'collapsed' : ''}`} style={sidebarStyle}>
                {/* Logo Area */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '3rem',
                    padding: '0 0.5rem',
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start'
                }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '1.2rem',
                        flexShrink: 0
                    }}>
                        <FaBook />
                    </div>
                    {(!collapsed || isMobile) && (
                        <span style={{
                            fontSize: '1.2rem',
                            fontWeight: '700',
                            color: 'var(--text-primary)',
                            whiteSpace: 'nowrap'
                        }}>
                            Repo.edu
                        </span>
                    )}
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <div
                                key={item.path}
                                onClick={() => {
                                    navigate(item.path);
                                    if (isMobile) onToggle();
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 14px',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    background: isActive ? 'var(--accent-primary)15' : 'transparent',
                                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                                    position: 'relative'
                                }}
                                className="sidebar-item"
                                title={collapsed ? item.label : ''}
                            >
                                <span style={{ fontSize: '1.1rem', display: 'flex' }}>{item.icon}</span>
                                {(!collapsed || isMobile) && (
                                    <span style={{ fontSize: '0.95rem', fontWeight: 500 }}>{item.label}</span>
                                )}
                                {isActive && !collapsed && !isMobile && (
                                    <div style={{
                                        position: 'absolute',
                                        right: '12px',
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: '#60a5fa',
                                        boxShadow: '0 0 10px #60a5fa'
                                    }}></div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {!isMobile && (
                        <button
                            onClick={onToggle}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#64748b',
                                padding: '10px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: collapsed ? 'center' : 'flex-start',
                                gap: '12px',
                                width: '100%',
                                borderRadius: '8px'
                            }}
                            className="sidebar-toggle"
                        >
                            {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                            {!collapsed && <span>Collapse</span>}
                        </button>
                    )}

                    <button
                        onClick={toggleTheme}
                        style={{
                            background: 'var(--border-color)',
                            border: 'none',
                            color: theme === 'dark' ? '#fde047' : 'var(--text-primary)',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                            gap: '12px',
                            width: '100%',
                            borderRadius: '12px',
                            marginTop: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        title={collapsed ? 'Toggle Theme' : ''}
                    >
                        {theme === 'dark' ? <FaSun /> : <FaMoon />}
                        {(!collapsed || isMobile) && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
                    </button>

                    <button
                        onClick={handleLogoutClick}
                        style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            color: '#f87171',
                            padding: '12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                            gap: '12px',
                            width: '100%',
                            borderRadius: '12px',
                            marginTop: '0.5rem',
                            transition: 'all 0.2s'
                        }}
                        className="logout-btn"
                        title={collapsed ? 'Logout' : ''}
                    >
                        <FaSignOutAlt />
                        {(!collapsed || isMobile) && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Logout Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
                title="Confirm Logout"
                message="Are you sure you want to logout? You will need to login again to access your account."
                confirmText="Logout"
                cancelText="Cancel"
                type="danger"
            />
        </>
    );
};

export default Sidebar;


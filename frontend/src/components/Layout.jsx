import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const noNavPaths = ['/login', '/faculty-dashboard', '/admin', '/student-dashboard', '/select-role', '/followers', '/following'];
    const isDashboardPath = location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/faculty-dashboard') ||
        location.pathname.startsWith('/student-dashboard') ||
        location.pathname.startsWith('/followers') ||
        location.pathname.startsWith('/following');
    const showNav = !noNavPaths.includes(location.pathname) && !isDashboardPath;

    return (
        <div className="app-layout">
            {showNav && <Navbar />}
            <main className="app-content">
                {children}
            </main>
        </div>
    );
};

export default Layout;

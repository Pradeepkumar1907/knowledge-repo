import React from 'react';
import Navbar from './Navbar';
import { useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    const location = useLocation();
    const noNavPaths = ['/login'];
    const showNav = !noNavPaths.includes(location.pathname);

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

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/Avatar';
import { FaCog, FaCalendar, FaBook, FaEye, FaBookmark, FaCode } from 'react-icons/fa';
// Removed Navbar import as it is handled by Layout

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [recentlyVisited, setRecentlyVisited] = useState([]);
    const [allSystemArticles, setAllSystemArticles] = useState([]);
    const [showOldest, setShowOldest] = useState(false); // false = Recently Added (Default), true = Oldest Articles
    const [myKnowledge, setMyKnowledge] = useState([]);

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            fetchUserData();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const fetchUserData = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const me = res.data;
            if (me && me.recentlyVisited) {
                setRecentlyVisited(me.recentlyVisited);
                sessionStorage.setItem('user', JSON.stringify(me));
                setUser(me);
            }

            // Fetch all articles
            const articlesRes = await axios.get('http://localhost:5000/knowledge/all');

            // Stats (My Articles)
            const myItems = me?.name ? articlesRes.data.filter(item => item.author === me.name) : [];
            setMyKnowledge(myItems);

            // Store all articles for Admin toggle logic
            if (me.role === 'admin') {
                setAllSystemArticles(articlesRes.data);
            }

        } catch (err) {
            console.error("Error fetching user data:", err);
        }
    };

    const timeAgo = (date) => {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    if (!user) return null;

    const isAdmin = user.role === 'admin';

    // Derived state for sorting/filtering
    let displayedArticles = [];
    if (isAdmin) {
        if (showOldest) {
            // STATE 2: Oldest Articles (ASC), Show 5
            displayedArticles = [...allSystemArticles].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).slice(0, 5);
        } else {
            // STATE 1: Recently Added (DESC), Show ONLY 5
            displayedArticles = [...allSystemArticles].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        }
    }

    return (
        <div className="container" style={{ paddingTop: '1rem' }}>
            <div className="dash-header" style={{ marginBottom: '0' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>{'<'}</button>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>My Profile</h2>
                <FaCog style={{ color: 'white', fontSize: '1.2rem' }} />
            </div>

            <div className="profile-card">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                    {user.profilePicture ? (
                        <img src={user.profilePicture} alt={user.name} style={{ width: '100px', height: '100px', borderRadius: '50%' }} />
                    ) : (
                        <Avatar name={user.name} size="100px" fontSize="2.5rem" />
                    )}
                </div>
                <h2 style={{ margin: '0.5rem 0', fontSize: '1.5rem' }}>{user.name}</h2>
                <div className="profile-role" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)', padding: '4px 12px', borderRadius: '20px', display: 'inline-block', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {user.role}
                </div>
                <div style={{ marginTop: '0.5rem', color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <FaCalendar /> Member since 2026
                </div>
            </div>

            <div className="stats-row">
                <div className="stat-item">
                    <div className="item-icon-box" style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px' }}>
                        <FaBook />
                    </div>
                    <span className="stat-val">{myKnowledge.length}</span>
                    <span className="stat-label">Articles</span>
                </div>
                <div className="stat-item">
                    <div className="item-icon-box" style={{ margin: '0 auto 0.5rem', width: '40px', height: '40px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                        <FaEye />
                    </div>
                    <span className="stat-val">{recentlyVisited.length}</span>
                    <span className="stat-label">Visited</span>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>
                    {isAdmin ? (showOldest ? 'Oldest Articles' : 'Recently Added') : 'Recently Visited'}
                </h3>
                {isAdmin ? (
                    <button
                        onClick={() => setShowOldest(!showOldest)}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '0.85rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        {showOldest ? 'Recently Added' : 'Oldest'}
                    </button>
                ) : (
                    <span style={{ fontSize: '0.85rem', color: '#3b82f6' }}>History</span>
                )}
            </div>

            <div>
                {isAdmin ? (
                    // ADMIN VIEW
                    displayedArticles.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>No articles found.</p>
                    ) : (
                        displayedArticles.map((item, index) => (
                            <div key={index} className="list-item" onClick={() => navigate(`/view/${item._id}`)} style={{ cursor: 'pointer' }}>
                                <div className="item-icon-box" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                                    <FaBook />
                                </div>
                                <div className="item-content">
                                    <span className="item-title">{item.title}</span>
                                    <span className="item-sub" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        Added {timeAgo(item.createdAt)}
                                    </span>
                                </div>
                                <button className="btn-primary" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                    View
                                </button>
                            </div>
                        ))
                    )
                ) : (
                    // USER VIEW: Recently Visited
                    recentlyVisited.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#64748b' }}>No history yet.</p>
                    ) : (
                        recentlyVisited.filter(item => item.article).map((item, index) => (
                            <div key={index} className="list-item" onClick={() => navigate(`/view/${item.article._id}`)} style={{ cursor: 'pointer' }}>
                                <div className="item-icon-box">
                                    <FaBook />
                                </div>
                                <div className="item-content">
                                    <span className="item-title">{item.article.title}</span>
                                    <span className="item-sub" style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                        Visited {timeAgo(item.timestamp)}
                                    </span>
                                </div>
                                <button className="btn-primary" style={{ width: 'auto', padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
                                    Open
                                </button>
                            </div>
                        ))
                    )
                )}
            </div>
        </div>
    );
};

export default Dashboard;

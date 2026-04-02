import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBook, FaCheckCircle } from 'react-icons/fa';

const API = import.meta.env.VITE_API_URL;

const Login = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!window.google || !clientId) return;

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
                setIsLoading(true);
                try {
                    // ✅ FIXED API URL
                    const res = await axios.post(`${API}/auth/google`, {
                        idToken: response.credential
                    });

                    if (res.data.roleRequired) {
                        localStorage.setItem('token', res.data.token);
                        navigate('/select-role');
                    } else {
                        localStorage.setItem('token', res.data.token);
                        axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
                        sessionStorage.setItem('user', JSON.stringify(res.data.user));

                        if (res.data.user.role) {
                            sessionStorage.setItem('role', res.data.user.role);
                        }

                        toast.success("Login Successful!");

                        if (res.data.user.role === 'student') {
                            navigate('/student-dashboard');
                        } else if (res.data.user.role === 'faculty') {
                            navigate('/faculty-dashboard');
                        } else {
                            navigate('/admin');
                        }
                    }
                } catch (err) {
                    setIsLoading(false);
                    toast.error(err.response?.data?.error || 'Google sign-in failed');
                }
            }
        });

        const btn = document.getElementById('googleSignInBtn');
        if (btn) {
            window.google.accounts.id.renderButton(btn, {
                theme: 'filled_blue',
                size: 'large',
                shape: 'pill',
                text: 'signin_with',
                width: 250
            });
        }
    }, [navigate]);

    return (
        <div className="login-container">
            
            {/* Left Section */}
            <div className="login-brand-section">
                <div className="brand-content">
                    <div className="brand-logo-large">
                        <div className="brand-logo-icon-wrap">
                            <FaBook style={{ color: '#fff' }} />
                        </div>
                        KnowledgeRepo
                    </div>

                    <h1 className="brand-tagline">
                        Centralized Academic Knowledge Platform
                    </h1>

                    <div className="feature-list">
                        <div className="feature-item">
                            <FaCheckCircle style={{ color: '#60a5fa' }} />
                            <span>Structured Learning Resources</span>
                        </div>
                        <div className="feature-item">
                            <FaCheckCircle style={{ color: '#60a5fa' }} />
                            <span>Faculty Verified Content</span>
                        </div>
                        <div className="feature-item">
                            <FaCheckCircle style={{ color: '#60a5fa' }} />
                            <span>Smart Search & Categorization</span>
                        </div>
                        <div className="feature-item">
                            <FaCheckCircle style={{ color: '#60a5fa' }} />
                            <span>Collaborative Knowledge Sharing</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section */}
            <div className="login-form-section">
                <div className="login-card-modern">
                    <h2 className="login-card-title">Welcome Back</h2>
                    <p className="login-card-subtitle">
                        Sign in to continue to your dashboard
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ display: isLoading ? 'none' : 'block' }}>
                            <div className="google-btn-wrapper">
                                <div id="googleSignInBtn"></div>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="auth-loading-btn" style={{ width: '250px' }}>
                                <div className="spinner"></div>
                                Signing you in...
                            </div>
                        )}
                    </div>
                </div>

                <div className="login-footer">
                    <div>&copy; 2026 KnowledgeRepo</div>
                    <div className="login-footer-links">
                        <a href="#terms">Terms</a>
                        <span>&bull;</span>
                        <a href="#privacy">Privacy</a>
                        <span>&bull;</span>
                        <a href="#contact">Contact</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

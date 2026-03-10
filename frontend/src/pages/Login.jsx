import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaBook, FaCheckCircle } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!window.google || !clientId) return;

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
                try {
                    const res = await axios.post('http://localhost:5000/auth/google', { idToken: response.credential });
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
                width: 250 // Custom width for modern look
            });
        }
    }, [navigate]);

    return (
        <div className="login-container">
            {/* Left Brand Section */}
            <div className="login-brand-section">
                <div className="brand-content">
                    <div className="brand-logo-large">
                        <div style={{ background: 'var(--accent-primary)', padding: '10px', borderRadius: '12px', display: 'flex' }}>
                            <FaBook style={{ color: '#fff' }} />
                        </div>
                        KnowledgeRepo
                    </div>

                    <h1 className="brand-tagline">
                        Centralized Academic Knowledge Platform
                    </h1>

                    <div className="feature-list">
                        <div className="feature-item">
                            <FaCheckCircle style={{ color: 'var(--accent-primary)' }} />
                            <span>Structured Learning Resources</span>
                        </div>
                        <div className="feature-item">
                            <FaCheckCircle style={{ color: 'var(--accent-primary)' }} />
                            <span>Faculty Verified Content</span>
                        </div>
                        <div className="feature-item">
                            <FaCheckCircle style={{ color: 'var(--accent-primary)' }} />
                            <span>Smart Search & Categorization</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Login Section */}
            <div className="login-form-section">
                <div className="login-card-modern">
                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Welcome Back</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Sign in to continue to your dashboard</p>

                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                        <div id="googleSignInBtn"></div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '1.5rem 0' }}>
                        <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></span>
                        <span>OR</span>
                        <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></span>
                    </div>

                    <button className="btn-primary" disabled style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        Continue with Phone (Coming Soon)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;

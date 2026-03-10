import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

const SelectRole = () => {
    const navigate = useNavigate();

    const handleSelectRole = async (role) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error("Session expired. Please login again.");
                navigate('/login');
                return;
            }

            const res = await axios.post('http://localhost:5000/auth/set-role',
                { role },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update local storage and state with new token and user info
            localStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(res.data.user));
            sessionStorage.setItem('role', res.data.user.role);

            toast.success(`Welcome, ${role === 'student' ? 'Student' : 'Faculty'}!`);

            // Redirect based on role
            if (role === 'student') {
                navigate('/student-dashboard');
            } else {
                navigate('/faculty-dashboard');
            }

            // Force reload to update navbar etc if needed, or rely on context/state updates. 
            // Since we use sessionStorage in Navbar, a navigate should be enough if Navbar listens to storage/location.
            // Navbar listens to location.pathname, so it might not update user state immediately unless we trigger it.
            // A window.location.reload() is a brute force way to ensure everything is fresh.
            window.location.reload();

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to set role");
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            background: 'var(--bg-primary)',
            color: 'var(--text-primary)'
        }}>
            <h2 style={{ marginBottom: '2rem', color: 'var(--text-primary)', fontWeight: '800', fontSize: '2rem' }}>Select Your Role</h2>
            <div style={{ display: 'flex', gap: '2rem' }}>

                {/* Student Card */}
                <div
                    onClick={() => handleSelectRole('student')}
                    style={{
                        background: 'var(--bg-card)',
                        padding: '2rem',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        width: '240px',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <FaUserGraduate size={60} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 10px 0', fontSize: '1.5rem' }}>Student</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>Access learning materials and track progress.</p>
                </div>

                {/* Faculty Card */}
                <div
                    onClick={() => handleSelectRole('faculty')}
                    style={{
                        background: 'var(--bg-card)',
                        padding: '2rem',
                        borderRadius: '24px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        width: '240px',
                        border: '1px solid var(--border-color)',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.borderColor = 'var(--accent-primary)';
                        e.currentTarget.style.transform = 'translateY(-5px)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.borderColor = 'var(--border-color)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <FaChalkboardTeacher size={60} color="var(--accent-primary)" style={{ marginBottom: '1.5rem' }} />
                    <h3 style={{ color: 'var(--text-primary)', margin: '0 0 10px 0', fontSize: '1.5rem' }}>Faculty</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: 0 }}>Manage content and mentor students.</p>
                </div>

            </div>
        </div>
    );
};

export default SelectRole;

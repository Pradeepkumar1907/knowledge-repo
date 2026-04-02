import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaUserGraduate, FaChalkboardTeacher } from 'react-icons/fa';

// ✅ API URL from Vercel ENV
import API from '../api';

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

            // ✅ CORRECT API CALL
            const res = await axios.post(
                `${API}/auth/set-role`,
                { role }, // body
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // ✅ Save updated data
            localStorage.setItem('token', res.data.token);
            sessionStorage.setItem('user', JSON.stringify(res.data.user));
            sessionStorage.setItem('role', res.data.user.role);

            toast.success(`Welcome, ${role === 'student' ? 'Student' : 'Faculty'}!`);

            // ✅ Redirect based on role
            if (role === 'student') {
                navigate('/student-dashboard');
            } else {
                navigate('/faculty-dashboard');
            }

            // optional reload
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
            <h2 style={{
                marginBottom: '2rem',
                fontWeight: '800',
                fontSize: '2rem'
            }}>
                Select Your Role
            </h2>

            <div style={{ display: 'flex', gap: '2rem' }}>

                {/* Student */}
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
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaUserGraduate size={60} color="var(--accent-primary)" />
                    <h3>Student</h3>
                    <p>Access learning materials and track progress.</p>
                </div>

                {/* Faculty */}
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
                        transition: 'all 0.3s ease'
                    }}
                >
                    <FaChalkboardTeacher size={60} color="var(--accent-primary)" />
                    <h3>Faculty</h3>
                    <p>Manage content and mentor students.</p>
                </div>

            </div>
        </div>
    );
};

export default SelectRole;
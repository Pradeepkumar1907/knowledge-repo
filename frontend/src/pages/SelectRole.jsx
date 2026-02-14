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
            background: '#0f172a',
            color: 'white'
        }}>
            <h2 style={{ marginBottom: '2rem' }}>Select Your Role</h2>
            <div style={{ display: 'flex', gap: '2rem' }}>

                {/* Student Card */}
                <div
                    onClick={() => handleSelectRole('student')}
                    style={{
                        background: '#1e293b',
                        padding: '2rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        width: '200px',
                        border: '2px solid transparent',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <FaUserGraduate size={50} color="#3b82f6" style={{ marginBottom: '1rem' }} />
                    <h3>Student</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Access learning materials and track progress.</p>
                </div>

                {/* Faculty Card */}
                <div
                    onClick={() => handleSelectRole('faculty')}
                    style={{
                        background: '#1e293b',
                        padding: '2rem',
                        borderRadius: '16px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        width: '200px',
                        border: '2px solid transparent',
                        transition: 'all 0.3s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.borderColor = '#eab308'}
                    onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                >
                    <FaChalkboardTeacher size={50} color="#eab308" style={{ marginBottom: '1rem' }} />
                    <h3>Faculty</h3>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Manage content and mentor students.</p>
                </div>

            </div>
        </div>
    );
};

export default SelectRole;

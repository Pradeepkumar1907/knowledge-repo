import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaTimes, FaSave, FaFileUpload } from 'react-icons/fa';

const AddEditKnowledge = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        content: '',
        author: ''
    });

    useEffect(() => {
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setFormData(prev => ({ ...prev, author: u.name }));
        }

        if (id) {
            axios.get(`http://localhost:5000/knowledge/${id}`)
                .then(res => setFormData(res.data))
                .catch(err => console.error(err));
        }
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            if (id) {
                await axios.put(`http://localhost:5000/knowledge/update/${id}`, formData, { headers });
                toast.success("Updated successfully!");
            } else {
                await axios.post('http://localhost:5000/knowledge/add', formData, { headers });
                toast.success("Added successfully!");
            }
            navigate('/');
        } catch (err) {
            toast.error("Error saving data");
        }
    };

    return (
        <div style={{ background: '#0f172a', minHeight: '100vh', padding: '1rem', paddingBottom: '5rem' }}>
            <div className="dash-header">
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem' }}>
                    <FaTimes />
                </button>
                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{id ? 'Edit Knowledge' : 'Add Knowledge'}</h2>
                <button onClick={handleSubmit} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 'bold' }}>Save</button>
            </div>

            <form onSubmit={handleSubmit}>
                <h3 style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '1.5rem' }}>General Information</h3>

                <div className="form-group">
                    <label className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Introduction to Quantum Physics"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                        className="form-input"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        <option>General</option>
                        <option>Programming</option>
                        <option>Science</option>
                        <option>History</option>
                        <option>Math</option>
                    </select>
                </div>

                <div className="form-group">
                    <label className="form-label">Author</label>
                    <input
                        type="text"
                        className="form-input"
                        style={{ opacity: 0.7 }}
                        value={formData.author}
                        readOnly
                    />
                </div>

                <div className="form-group">
                    <label className="form-label">Content</label>
                    <textarea
                        className="form-input"
                        rows="8"
                        placeholder="Write your academic notes here..."
                        value={formData.content}
                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        required
                    ></textarea>
                </div>

                <div style={{ border: '2px dashed #334155', borderRadius: '12px', padding: '2rem', textAlign: 'center', marginBottom: '2rem', cursor: 'pointer' }}>
                    <FaFileUpload size={24} color="#64748b" />
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Add Attachments (PDF, DOCX)</p>
                </div>

                <button type="submit" className="btn-primary">Submi Entry</button>
            </form>
        </div>
    );
};

export default AddEditKnowledge;

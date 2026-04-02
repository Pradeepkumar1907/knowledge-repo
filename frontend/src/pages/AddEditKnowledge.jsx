import API from '../api';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaTimes, FaCloudUploadAlt, FaImage, FaCheckCircle } from 'react-icons/fa';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const AddEditKnowledge = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        content: '',
        author: '',
        image: ''
    });
    const [authorId, setAuthorId] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = React.useRef(null);

    const isEditMode = !!id;

    useEffect(() => {
        // Fetch dynamic categories
        // ✅ USE CENTRALIZED API INSTANCE
        API.get('/categories')
            .then(res => {
                setCategories(res.data);
                if (!isEditMode && res.data.length > 0 && formData.category === 'General') {
                    setFormData(prev => ({ ...prev, category: res.data[0].name }));
                }
            })
            .catch(err => console.error("Error fetching categories", err));

        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            if (!isEditMode) {
                setFormData(prev => ({ ...prev, author: u.name }));
            }
        }

        if (isEditMode) {
            // ✅ USE CENTRALIZED API INSTANCE
            API.get(`/knowledge/${id}`)
                .then(res => {
                    const data = res.data;
                    const authorName = data.author && data.author.name ? data.author.name : data.author;
                    const authId = data.author && data.author._id ? data.author._id : data.author;

                    setAuthorId(authId);
                    setFormData({
                        title: data.title || '',
                        category: data.category || 'General',
                        content: data.content || '',
                        author: authorName || '',
                        image: data.image || ''
                    });
                })
                .catch(err => {
                    console.error(err);
                    toast.error("Failed to load article");
                });
        }
    }, [id, isEditMode]);

    useEffect(() => {
        if (!isEditMode && (formData.title || formData.content)) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem('article_draft', JSON.stringify(formData));
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [formData, isEditMode]);

    useEffect(() => {
        if (!isEditMode) {
            const draft = localStorage.getItem('article_draft');
            if (draft) {
                if (window.confirm("You have an unsaved draft. Would you like to restore it?")) {
                    setFormData(JSON.parse(draft));
                } else {
                    localStorage.removeItem('article_draft');
                }
            }
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = formData.image;

            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('image', selectedFile);

                toast.loading("Uploading cover image...", { id: "upload-toast" });
                try {
                    // ✅ USE CENTRALIZED API INSTANCE
                    // The interceptor will NOT add Content-Type for FormData as per axios defaults (letting browser set boundary)
                    const uploadRes = await API.post('/api/upload', uploadData);
                    imageUrl = uploadRes.data.imageUrl;
                    toast.success("Image uploaded!");
                } catch (uploadErr) {
                    toast.error("Failed to upload image.");
                    console.error("Upload Error:", uploadErr);
                    return;
                } finally {
                    toast.dismiss("upload-toast");
                }
            }

            const payload = { ...formData, image: imageUrl };

            if (isEditMode) {
                const updatePayload = { ...payload, author: authorId || formData.author };
                // ✅ USE CENTRALIZED API INSTANCE
                await API.put(`/knowledge/update/${id}`, updatePayload);
                toast.success("Article updated successfully!");
            } else {
                // ✅ USE CENTRALIZED API INSTANCE
                await API.post('/knowledge/add', payload);
                localStorage.removeItem('article_draft');
                toast.success("Article published!");
            }
            navigate('/');
        } catch (err) {
            toast.error("Error saving data");
        }
    };

    const handleDrag = function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = function (e) {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = function (e) {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const onUploadClick = () => {
        fileInputRef.current?.click();
    };

    const inputStyles = {
        width: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        boxSizing: 'border-box'
    };

    const labelStyles = {
        display: 'block',
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
        fontWeight: '500',
        marginBottom: '0.5rem'
    };

    return (
        <div style={{
            background: 'var(--bg-primary)',
            minHeight: '100vh',
            padding: '2rem 1rem 5rem 1rem',
            color: 'var(--text-primary)'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                    <button onClick={() => navigate(-1)} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '50%', color: 'var(--text-primary)', width: '40px', height: '40px', cursor: 'pointer' }}>
                        <FaTimes />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0 }}>{isEditMode ? 'Edit Knowledge' : 'Create New Material'}</h1>
                    </div>
                </div>

                <form onSubmit={handleSubmit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '2.5rem' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <label style={labelStyles}>Article Title *</label>
                                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={inputStyles} />
                            </div>
                            <div>
                                <label style={labelStyles}>Category</label>
                                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={inputStyles}>
                                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={labelStyles}>Author</label>
                                <div style={{ ...inputStyles, borderStyle: 'dashed' }}><FaCheckCircle color="#10b981" style={{ marginRight: '8px' }} />{formData.author}</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <label style={labelStyles}>Content *</label>
                            <ReactQuill theme="snow" value={formData.content} onChange={(val) => setFormData({ ...formData, content: val })} style={{ height: '350px', marginBottom: '40px', background: 'var(--bg-secondary)', borderRadius: '10px' }} />
                        </div>
                    </div>

                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={labelStyles}>Cover Image</label>
                        <div onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop} onClick={onUploadClick} style={{ border: '2px dashed var(--border-color)', borderRadius: '16px', padding: '3rem', textAlign: 'center', cursor: 'pointer' }}>
                            <FaCloudUploadAlt size={40} color="var(--accent-primary)" />
                            <p>{selectedFile ? selectedFile.name : 'Click or Drag & Drop Cover Image'}</p>
                            <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleChange} accept="image/*" />
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                        <button type="button" onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ padding: '12px 32px', borderRadius: '10px' }}>{isEditMode ? 'Update Details' : 'Publish Article'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditKnowledge;

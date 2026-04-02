
const API = import.meta.env.VITE_API_URL;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FaTimes, FaCloudUploadAlt, FaFileAlt, FaImage, FaCheckCircle } from 'react-icons/fa';
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
        axios.get(`${API}/categories`)
            .then(res => {
                setCategories(res.data);
                if (!isEditMode && res.data.length > 0 && formData.category === 'General') {
                    // Update default category to the first available category if General isn't hardcoded
                    setFormData(prev => ({ ...prev, category: res.data[0].name }));
                }
            })
            .catch(err => console.error("Error fetching categories", err));

        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            // Default author to logged in user if creating new
            if (!isEditMode) {
                setFormData(prev => ({ ...prev, author: u.name }));
            }
        }

        if (isEditMode) {
            axios.get(`${API}/knowledge/${id}`)
                .then(res => {
                    // Populate form, gracefully handling if author is populated object or string ID
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
        // Auto-save draft logic
        if (!isEditMode && (formData.title || formData.content)) {
            const timeoutId = setTimeout(() => {
                localStorage.setItem('article_draft', JSON.stringify(formData));
            }, 1000);
            return () => clearTimeout(timeoutId);
        }
    }, [formData, isEditMode]);

    useEffect(() => {
        // Restore draft logic on mount
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
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            let imageUrl = formData.image;

            if (selectedFile) {
                const uploadData = new FormData();
                uploadData.append('image', selectedFile);

                toast.loading("Uploading cover image...", { id: "upload-toast" });
                try {
                    const uploadRes = await axios.post(`${API}/api/upload`, uploadData, {
                        headers: { ...headers, 'Content-Type': 'multipart/form-data' }
                    });
                    imageUrl = uploadRes.data.imageUrl;
                    toast.success("Image uploaded!");
                } catch (uploadErr) {
                    toast.error("Failed to upload image.");
                    console.error("Upload Error:", uploadErr);
                    return; // Stop submission on upload failure
                } finally {
                    toast.dismiss("upload-toast");
                }
            }

            const payload = { ...formData, image: imageUrl };

            if (isEditMode) {
                // Important: Mongoose expects an ObjectId for the author field, not the string name.
                const updatePayload = { ...payload, author: authorId || formData.author };
                await axios.put(`${API}/knowledge/update/${id}`, updatePayload, { headers });
                toast.success("Article updated successfully!");
            } else {
                await axios.post(`${API}/knowledge/add`, payload, { headers });
                localStorage.removeItem('article_draft');
                if (selectedFile) {
                    toast.success(`Article published with cover image!`);
                } else {
                    toast.success("New article published!");
                }
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

    // Shared input styling to ensure perfect consistency
    const inputStyles = {
        width: '100%',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '10px',
        padding: '12px 16px',
        color: 'var(--text-primary)',
        fontSize: '1rem',
        outline: 'none',
        transition: 'all 0.2s ease',
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
            fontFamily: 'Inter, system-ui, sans-serif',
            color: 'var(--text-primary)'
        }}>
            {/* Global Container */}
            <div style={{
                maxWidth: '1000px',
                margin: '0 auto',
            }}>

                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    gap: '1rem',
                    animation: 'fadeIn 0.4s ease-out'
                }}>
                    <button
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '40px',
                            height: '40px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)';
                            e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(30, 41, 59, 0.5)';
                            e.currentTarget.style.transform = 'scale(1)';
                        }}
                        aria-label="Go Back"
                    >
                        <FaTimes size={16} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, color: 'var(--text-primary)' }}>
                            {isEditMode ? 'Edit Knowledge' : 'Create New Material'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: '0.2rem 0 0 0', fontSize: '0.95rem' }}>
                            {isEditMode ? 'Update your existing academic content and resources.' : 'Draft and publish new academic content for the repository.'}
                        </p>
                    </div>
                </div>

                {/* Main Form Card Container - Glassmorphism */}
                <form onSubmit={handleSubmit} style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    animation: 'fadeIn 0.5s ease-out'
                }}>

                    {/* Two-Column CSS Grid Configuration */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: '2.5rem',
                        marginBottom: '2.5rem'
                    }}>

                        {/* LEFT COLUMN: Metadata Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Title Field */}
                            <div>
                                <label style={labelStyles}>Article Title <span style={{ color: '#f43f5e' }}>*</span></label>
                                <input
                                    type="text"
                                    placeholder="e.g. Introduction to Quantum Physics"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={inputStyles}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = 'var(--accent-primary)';
                                        e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = 'var(--border-color)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                />
                            </div>

                            {/* Category Field */}
                            <div>
                                <label style={labelStyles}>Category</label>
                                <div style={{ position: 'relative' }}>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        style={{
                                            ...inputStyles,
                                            appearance: 'none',
                                            cursor: 'pointer'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = 'var(--accent-primary)';
                                            e.target.style.boxShadow = '0 0 0 2px var(--accent-glow)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--border-color)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        {categories.length === 0 && <option value="General">General</option>}
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                    {/* Custom Select Arrow */}
                                    <div style={{
                                        position: 'absolute',
                                        right: '16px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                        color: '#94a3b8'
                                    }}>
                                        ▼
                                    </div>
                                </div>
                            </div>

                            {/* Author Field (Read-only aesthetic) */}
                            <div>
                                <label style={labelStyles}>Author (Auto-filled)</label>
                                <div style={{
                                    ...inputStyles,
                                    background: 'var(--bg-secondary)',
                                    color: 'var(--text-secondary)',
                                    border: '1px dashed var(--border-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px'
                                }}>
                                    <FaCheckCircle color="#10b981" />
                                    {formData.author || 'User'}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: Content Textarea */}
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <label style={{ ...labelStyles, display: 'flex', justifyContent: 'space-between' }}>
                                <span>Article Content <span style={{ color: '#f43f5e' }}>*</span></span>
                                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>Supports Markdown</span>
                            </label>
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(val) => setFormData({ ...formData, content: val })}
                                placeholder="Start writing your academic notes, research, or guide here..."
                                style={{
                                    height: '350px',
                                    marginBottom: '40px',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: '10px'
                                }}
                            />
                        </div>
                    </div>

                    {/* FULL-WIDTH ROW: Premium File Upload Zone */}
                    <div style={{ marginBottom: '2.5rem' }}>
                        <label style={labelStyles}>Attachments (Optional)</label>
                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            onClick={onUploadClick}
                            style={{
                                border: `2px dashed ${dragActive ? '#3b82f6' : 'rgba(59, 130, 246, 0.4)'}`,
                                borderRadius: '16px',
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(15, 23, 42, 0.4)',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.05)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(15, 23, 42, 0.4)';
                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                boxShadow: '0 0 20px rgba(59, 130, 246, 0.2)'
                            }}>
                                <FaCloudUploadAlt />
                            </div>

                            <div>
                                {selectedFile ? (
                                    <>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#10b981', fontSize: '1.1rem', fontWeight: '600' }}>
                                            {selectedFile.name}
                                        </h3>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB ready for upload
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: '600' }}>
                                            Drag & Drop image or <span style={{ color: 'var(--accent-primary)' }}>Click to Upload</span>
                                        </h3>
                                        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <FaImage /> Supported formats: JPG, PNG, WEBP (Max 5MB)
                                        </p>
                                    </>
                                )}
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                style={{ display: 'none' }}
                                onChange={handleChange}
                                accept=".jpg,.jpeg,.png,.webp"
                            />
                        </div>
                    </div>

                    {/* Action Bar (Footer) */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '1rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        paddingTop: '2rem'
                    }}>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            style={{
                                padding: '12px 24px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'color 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            style={{
                                padding: '12px 32px',
                                background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                border: 'none',
                                borderRadius: '10px',
                                color: 'white',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.6)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #1d4ed8, #2563eb)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                                e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb, #3b82f6)';
                            }}
                        >
                            {isEditMode ? 'Update Details' : 'Publish Article'}
                        </button>
                    </div>

                </form>
            </div>

        </div>
    );
};

export default AddEditKnowledge;

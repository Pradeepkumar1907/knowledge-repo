import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaArrowRight } from 'react-icons/fa';
import './ArticleCard.css';

const ArticleCard = ({ article }) => {
    const navigate = useNavigate();

    const readTime = Math.ceil((article.content?.split(' ').length || 0) / 200);

    const getCategoryStyles = (category) => {
        const cat = category?.toLowerCase() || 'general';
        switch (cat) {
            case 'math': return { bg: '#eef2ff', color: '#a5b4fc' }; // Very light lavender/blue
            case 'science': return { bg: '#f0fdf4', color: '#86efac' }; // Very light mint green
            case 'history': return { bg: '#fffbeb', color: '#f1d576ff' }; // Very light yellow
            case 'programming': return { bg: '#fdf4ff', color: '#f0abfc' }; // Very light pink/purple
            default: return { bg: '#f8fafc', color: '#cbd5e1' }; // Very light slate
        }
    };

    const styles = getCategoryStyles(article.category);
    const initial = (article.category || 'General').charAt(0).toUpperCase();

    const isValidImage = article.image &&
        !article.image.includes('unsplash') &&
        !article.image.includes('picsum') &&
        !article.image.includes('lorem');

    return (
        <div
            className="saas-card group"
            onClick={() => navigate(`/view/${article._id}`)}
        >
            <div className="card-img-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: styles.bg, height: '200px', overflow: 'hidden', position: 'relative' }}>
                {isValidImage ? (
                    <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                    <span style={{ fontSize: '5rem', fontWeight: '800', color: styles.color, opacity: 0.8 }}>
                        {initial}
                    </span>
                )}
                <div className="card-badge" style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10 }}>{article.category || 'General'}</div>
            </div>

            <div className="card-body">
                <div className="read-time" style={{ color: 'var(--text-secondary)' }}>
                    <FaClock /> {readTime} min read
                </div>
                <h3 className="card-title-lg" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }}>
                    {article.title}
                </h3>
                <p className="card-desc" style={{ color: 'var(--text-secondary)' }}>
                    {article.description || (article.content ? article.content.substring(0, 100) + '...' : 'No description.')}
                </p>

                <div className="card-footer" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div
                        className="card-author"
                        onClick={(e) => {
                            e.stopPropagation();
                            const authorId = article.author?._id || article.author;
                            if (authorId) navigate(`/profile/${authorId}`);
                        }}
                        style={{ cursor: 'pointer' }}
                    >
                        {article.author?.profilePicture ? (
                            <img src={article.author.profilePicture} alt="Author" className="author-avatar-small" style={{ objectFit: 'cover' }} />
                        ) : (
                            <div className="author-avatar-small" style={{ background: 'var(--border-color)', color: 'var(--text-primary)' }}>
                                {(article.author?.name || (typeof article.author === 'string' ? article.author : 'A')).charAt(0).toUpperCase()}
                            </div>
                        )}
                        <span className="card-author-name" style={{ color: 'var(--text-primary)', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-primary)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}>
                            {article.author?.name || (typeof article.author === 'string' ? article.author : 'Repo Admin')}
                        </span>
                    </div>

                    <div className="card-action-icon" style={{ color: 'var(--accent-primary)' }}>
                        <FaArrowRight />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArticleCard;

import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

const StatCard = ({ title, value, change, isPositive, icon, color }) => {
    return (
        <div className="saas-card" style={{
            background: 'var(--card-bg)',
            backdropFilter: 'blur(10px)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'default',
            position: 'relative',
            overflow: 'hidden'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = `0 10px 20px -5px ${color}20`;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '200px',
                height: '200px',
                background: `radial-gradient(circle, ${color}10 0%, transparent 70%)`,
                borderRadius: '50%',
                pointerEvents: 'none'
            }}></div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: `${color}15`,
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem'
                }}>
                    {icon}
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 4px 0', lineHeight: 1 }}>{value}</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: 0 }}>{title}</p>
            </div>
        </div>
    );
};

export default StatCard;

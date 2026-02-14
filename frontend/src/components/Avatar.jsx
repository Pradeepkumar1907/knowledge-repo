import React from 'react';

const Avatar = ({ name, size = '40px', fontSize, bg = '#3b82f6' }) => {
    const getInitials = (n) => {
        if (!n) return 'U';
        const parts = n.toString().trim().split(' ');
        if (parts.length === 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const styles = {
        width: size,
        height: size,
        borderRadius: '50%',
        backgroundColor: bg,
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: fontSize || `calc(${size} / 2.2)`,
        userSelect: 'none',
        flexShrink: 0,
        textTransform: 'uppercase',
        border: '2px solid transparent', // Optional border handling
    };

    return (
        <div className="avatar-circle" style={styles}>
            {getInitials(name)}
        </div>
    );
};

export default Avatar;

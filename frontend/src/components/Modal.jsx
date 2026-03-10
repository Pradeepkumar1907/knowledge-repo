import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';

const Modal = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "normal" }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    const isDanger = type === 'danger';

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isOpen ? 1 : 0,
            pointerEvents: isOpen ? 'auto' : 'none',
            transition: 'opacity 0.3s ease'
        }}>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(2, 6, 23, 0.7)',
                    backdropFilter: 'blur(4px)',
                }}
            />

            {/* Modal Content */}
            <div style={{
                background: 'rgba(30, 41, 59, 0.9)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '24px',
                width: '90%',
                maxWidth: '400px',
                position: 'relative',
                transform: isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
                transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {isDanger && (
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(239, 68, 68, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ef4444'
                            }}>
                                <FaExclamationTriangle />
                            </div>
                        )}
                        <h3 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            padding: '4px',
                            transition: 'color 0.2s'
                        }}
                    >
                        <FaTimes />
                    </button>
                </div>

                <p style={{ color: '#cbd5e1', marginBottom: '24px', lineHeight: 1.5 }}>
                    {message}
                </p>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            background: 'transparent',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: '#e2e8f0',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            background: isDanger ? '#ef4444' : '#3b82f6',
                            border: 'none',
                            color: 'white',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isDanger ? '0 4px 6px -1px rgba(239, 68, 68, 0.3)' : '0 4px 6px -1px rgba(59, 130, 246, 0.3)'
                        }}
                        onMouseEnter={(e) => e.target.style.filter = 'brightness(110%)'}
                        onMouseLeave={(e) => e.target.style.filter = 'none'}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;

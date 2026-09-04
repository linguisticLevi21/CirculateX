import React from 'react';
import { useApp } from '../context/AppContext';

const TOAST_STYLES = {
  success: { bg: 'linear-gradient(135deg, #10b981, #059669)', icon: '✅' },
  error:   { bg: 'linear-gradient(135deg, #f43f5e, #e11d48)', icon: '❌' },
  info:    { bg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', icon: 'ℹ️' },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      zIndex: 9999,
      pointerEvents: 'none',
      alignItems: 'center',
    }}>
      {toasts.map(toast => {
        const s = TOAST_STYLES[toast.type] || TOAST_STYLES.success;
        return (
          <div
            key={toast.id}
            onClick={() => removeToast(toast.id)}
            style={{
              background: s.bg,
              color: '#fff',
              padding: '0.85rem 1.5rem',
              borderRadius: '12px',
              fontWeight: 600,
              fontSize: '0.9rem',
              fontFamily: 'Inter, sans-serif',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              animation: 'fadeInUp 0.3s ease',
              pointerEvents: 'all',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              maxWidth: '380px',
              backdropFilter: 'blur(12px)',
            }}
          >
            <span>{s.icon}</span>
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;

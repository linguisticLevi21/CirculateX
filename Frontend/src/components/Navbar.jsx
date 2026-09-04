import React from 'react';
import { useApp } from '../context/AppContext';

const Navbar = ({ onNavigate, currentPage }) => {
  const { myBorrows, listings } = useApp();
  const myListingsCount = listings.filter(l => l.lender === 'You').length;
  const activeBorrows = myBorrows.length;

  const navStyle = {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '64px',
    background: 'rgba(10, 10, 15, 0.88)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
  };

  const linkStyle = (page) => ({
    color: currentPage === page ? '#a78bfa' : '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: currentPage === page ? 600 : 500,
    cursor: 'pointer',
    transition: 'color 0.2s',
    background: 'none',
    border: 'none',
    fontFamily: 'Inter, sans-serif',
  });

  return (
    <nav style={navStyle}>
      {/* Logo */}
      <span
        style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.5rem',
          fontWeight: 700,
          background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          cursor: 'pointer',
          letterSpacing: '-0.02em',
        }}
        onClick={() => onNavigate('home')}
      >CirculateX</span>

      {/* Nav Links */}
      <div style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
        <button style={linkStyle('home')} onClick={() => onNavigate('home')}
          onMouseEnter={e => e.target.style.color = '#f1f5f9'}
          onMouseLeave={e => e.target.style.color = currentPage === 'home' ? '#a78bfa' : '#94a3b8'}
        >Home</button>

        <button style={linkStyle('main')} onClick={() => onNavigate('main')}
          onMouseEnter={e => e.target.style.color = '#f1f5f9'}
          onMouseLeave={e => e.target.style.color = currentPage === 'main' ? '#a78bfa' : '#94a3b8'}
        >Marketplace</button>

        {/* Dashboard with notification dot */}
        <button
          onClick={() => onNavigate('dashboard')}
          style={{ ...linkStyle('dashboard'), position: 'relative' }}
          onMouseEnter={e => e.target.style.color = '#f1f5f9'}
          onMouseLeave={e => e.target.style.color = currentPage === 'dashboard' ? '#a78bfa' : '#94a3b8'}
        >
          Dashboard
          {(myListingsCount > 0 || activeBorrows > 0) && (
            <span style={{
              position: 'absolute', top: '-5px', right: '-10px',
              width: '16px', height: '16px',
              background: '#8b5cf6',
              borderRadius: '50%',
              fontSize: '0.6rem', fontWeight: 700, color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              {myListingsCount + activeBorrows}
            </span>
          )}
        </button>
        {/* Get Started CTA */}
        <button
          onClick={() => onNavigate('main')}
          style={{
            padding: '0.5rem 1.25rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            border: 'none',
            transition: 'all 0.2s',
            fontFamily: 'Inter, sans-serif',
          }}
          onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; e.target.style.boxShadow = '0 0 24px rgba(139,92,246,0.5)'; }}
          onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
        >Get Started</button>

        {/* User Avatar */}
        <div
          onClick={() => onNavigate('dashboard')}
          title="My Dashboard"
          style={{
            width: '34px', height: '34px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '0.85rem', fontWeight: 700, color: '#fff',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: currentPage === 'dashboard' ? '0 0 16px rgba(139,92,246,0.5)' : 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 20px rgba(139,92,246,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = currentPage === 'dashboard' ? '0 0 16px rgba(139,92,246,0.5)' : 'none'; }}
        >S</div>
      </div>
    </nav>
  );
};

export default Navbar;

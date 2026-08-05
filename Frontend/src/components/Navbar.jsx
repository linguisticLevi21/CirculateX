import React, { useState } from 'react';

// ─── Inline styles as JS objects for full control ───────────────────────────

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    height: '64px',
    background: 'rgba(10, 10, 15, 0.85)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(139, 92, 246, 0.12)',
  },
  logo: {
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: '1.5rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    cursor: 'pointer',
    letterSpacing: '-0.02em',
  },
  navLinks: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  navLink: {
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'color 0.2s',
    background: 'none',
    border: 'none',
  },
  navCta: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
    color: '#fff',
    fontWeight: 600,
    fontSize: '0.9rem',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.2s',
  },
};

const Navbar = ({ onNavigate }) => (
  <nav style={styles.nav}>
    <span style={styles.logo} onClick={() => onNavigate('home')}>CirculateX</span>
    <div style={styles.navLinks}>
      <button style={styles.navLink} onClick={() => onNavigate('home')}
        onMouseEnter={e => e.target.style.color = '#f1f5f9'}
        onMouseLeave={e => e.target.style.color = '#94a3b8'}
      >Home</button>
      <button style={styles.navLink} onClick={() => onNavigate('main')}
        onMouseEnter={e => e.target.style.color = '#f1f5f9'}
        onMouseLeave={e => e.target.style.color = '#94a3b8'}
      >Marketplace</button>
      <button style={{...styles.navCta}}
        onClick={() => onNavigate('main')}
        onMouseEnter={e => { e.target.style.transform = 'scale(1.04)'; e.target.style.boxShadow = '0 0 24px rgba(139,92,246,0.5)'; }}
        onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = 'none'; }}
      >Get Started</button>
    </div>
  </nav>
);

export default Navbar;

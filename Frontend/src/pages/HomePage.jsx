import React from 'react';

const points = [
  {
    icon: '📤',
    title: 'Lend',
    desc: 'Have something you rarely use? List it and earn while others borrow it.',
  },
  {
    icon: '📥',
    title: 'Borrow',
    desc: 'Need something temporarily? Borrow it from someone nearby instead of buying.',
  },
  {
    icon: '🔒',
    title: 'Trust',
    desc: 'Every exchange is backed by deposits and community ratings for safety.',
  },
];

const HomePage = ({ onNavigate }) => (
  <div style={{
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex',
    flexDirection: 'column',
    paddingTop: '64px',
  }}>

    {/* ── Hero ───────────────────────────────────────────── */}
    <main style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '4rem 2rem',
      gap: '1.5rem',
    }}>

      {/* Logo / Name */}
      <h1 style={{
        fontFamily: "'Space Grotesk', sans-serif",
        fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
        fontWeight: 800,
        letterSpacing: '-0.03em',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        margin: 0,
      }}>
        CirculateX
      </h1>

      {/* Motto / Taglines */}
      <h2 style={{
        color: '#f1f5f9',
        fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
        fontWeight: 700,
        margin: '0.5rem 0',
      }}>
        "Transfer Product , Not Ownership"
      </h2>
      
      <h3 style={{
        color: '#94a3b8',
        fontSize: 'clamp(1rem, 2vw, 1.15rem)',
        fontWeight: 400,
        maxWidth: '480px',
        lineHeight: 1.7,
        margin: 0,
      }}>
        Lend what you own. Borrow what you need.
        <br />A peer-to-peer platform for the circular economy.
      </h3>

      {/* Enter Button */}
      <button
        id="enter-marketplace-btn"
        onClick={() => onNavigate('main')}
        style={{
          padding: '0.85rem 2.2rem',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
          color: '#fff',
          fontWeight: 700,
          fontSize: '1rem',
          border: 'none',
          cursor: 'pointer',
          boxShadow: '0 0 32px rgba(139,92,246,0.4)',
          transition: 'all 0.2s',
          marginTop: '0.5rem',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 0 48px rgba(139,92,246,0.6)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 32px rgba(139,92,246,0.4)'; }}
      >
        Enter Marketplace →
      </button>

      {/* 3 Points */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        maxWidth: '720px',
        width: '100%',
        marginTop: '2.5rem',
      }}>
        {points.map((p, i) => (
          <div
            key={i}
            style={{
              padding: '1.5rem',
              borderRadius: '16px',
              background: 'rgba(19,19,31,0.9)',
              border: '1px solid rgba(139,92,246,0.12)',
              textAlign: 'left',
              transition: 'border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '0.6rem' }}>{p.icon}</div>
            <h3 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1rem', fontWeight: 700,
              color: '#f1f5f9', marginBottom: '0.4rem',
            }}>{p.title}</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>{p.desc}</p>
          </div>
        ))}
      </div>
    </main>

    {/* ── Footer ─────────────────────────────────────────── */}
    <footer style={{
      borderTop: '1px solid rgba(139,92,246,0.1)',
      padding: '1.75rem 2rem',
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '0.75rem',
    }}>
      <span style={{ color: '#475569', fontSize: '0.85rem' }}>
        © 2025 <span style={{ color: '#8b5cf6', fontWeight: 600 }}>CirculateX</span>
      </span>

      <span style={{ color: '#475569', fontSize: '0.85rem' }}>
        Built by{' '}
        <span style={{ color: '#94a3b8', fontWeight: 500 }}>Shahadat Hussain</span>
      </span>

      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
        <a
          href="mailto:your@email.com"
          style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#a78bfa'}
          onMouseLeave={e => e.target.style.color = '#64748b'}
        >
          your@email.com
        </a>
        <a
          href="https://github.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#a78bfa'}
          onMouseLeave={e => e.target.style.color = '#64748b'}
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/yourusername"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = '#a78bfa'}
          onMouseLeave={e => e.target.style.color = '#64748b'}
        >
          LinkedIn
        </a>
      </div>
    </footer>

  </div>
);

export default HomePage;

import React, { useState } from 'react';

const MainPage = ({ onNavigate }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      paddingTop: '64px',
      position: 'relative',
    }}>

      {/* ── Page Title ─────────────────────────────────── */}
      <div style={{ padding: '2rem' }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.8rem',
          fontWeight: 700,
          color: '#f1f5f9',
          marginBottom: '0.3rem',
        }}>
          Marketplace
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
          Items listed here will appear once connected to backend.
        </p>
      </div>

      {/* ── Listings area (empty for now) ──────────────── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '5rem 2rem',
        color: '#475569',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
        <p style={{ fontSize: '1rem', color: '#64748b' }}>No listings yet.</p>
        <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem' }}>
          Be the first — lend something!
        </p>
      </div>

      {/* ── Corner Lend / Borrow Button ────────────────── */}
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.75rem',
        zIndex: 100,
      }}>

        {/* Expanded options */}
        {menuOpen && (
          <>
            <button
              id="corner-lend-btn"
              onClick={() => { setMenuOpen(false); onNavigate('lend'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(16,185,129,0.4)',
                animation: 'fadeInUp 0.2s ease',
                whiteSpace: 'nowrap',
              }}
            >
              📤 Lend
            </button>

            <button
              id="corner-borrow-btn"
              onClick={() => { setMenuOpen(false); onNavigate('borrow'); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                padding: '0.75rem 1.4rem',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.95rem',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(139,92,246,0.4)',
                animation: 'fadeInUp 0.25s ease',
                whiteSpace: 'nowrap',
              }}
            >
              📥 Borrow
            </button>
          </>
        )}

        {/* Main FAB toggle button */}
        <button
          id="corner-fab-btn"
          onClick={() => setMenuOpen(o => !o)}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: menuOpen
              ? 'rgba(30,30,50,0.95)'
              : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#fff',
            border: menuOpen ? '1px solid rgba(139,92,246,0.4)' : 'none',
            cursor: 'pointer',
            fontSize: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(139,92,246,0.45)',
            transition: 'all 0.25s',
            transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
          title="Lend or Borrow"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default MainPage;

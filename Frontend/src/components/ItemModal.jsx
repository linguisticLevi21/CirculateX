import React, { useEffect } from 'react';

const ItemModal = ({ item, onClose, onBorrow }) => {
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!item) return null;

  const stars = item.rating ? '★'.repeat(Math.floor(item.rating)) : '★★★★★';

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 500,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#13131f',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: '24px',
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          animation: 'modalIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          boxShadow: '0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(139,92,246,0.1)',
        }}
      >
        {/* Image Banner */}
        <div style={{
          height: '180px',
          background: item.imageBg,
          borderRadius: '24px 24px 0 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '5rem',
          position: 'relative',
        }}>
          {item.imageEmoji}
          {/* Available badge */}
          <div style={{
            position: 'absolute',
            top: '1rem', right: '1rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '100px',
            background: item.available
              ? 'rgba(16,185,129,0.2)'
              : 'rgba(244,63,94,0.2)',
            border: `1px solid ${item.available ? 'rgba(16,185,129,0.5)' : 'rgba(244,63,94,0.5)'}`,
            color: item.available ? '#10b981' : '#f43f5e',
            fontSize: '0.78rem',
            fontWeight: 700,
            backdropFilter: 'blur(8px)',
          }}>
            {item.available ? '● Available Now' : '● On Loan'}
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1rem', left: '1rem',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff', cursor: 'pointer', fontSize: '1.1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >×</button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.75rem' }}>
          {/* Category tag */}
          <span style={{
            display: 'inline-block',
            padding: '0.25rem 0.75rem',
            borderRadius: '100px',
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#a78bfa',
            fontSize: '0.75rem',
            fontWeight: 600,
            marginBottom: '0.75rem',
          }}>{item.category}</span>

          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.5rem', fontWeight: 700,
            color: '#f1f5f9', marginBottom: '0.5rem',
          }}>{item.title}</h2>

          {/* Lender info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 700, color: '#fff',
            }}>
              {item.lender[0]}
            </div>
            <div>
              <div style={{ color: '#f1f5f9', fontSize: '0.9rem', fontWeight: 600 }}>{item.lender}</div>
              <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                {item.rating ? `${stars} ${item.rating} · ${item.totalLends} lends` : 'New lender'}
                {' · '}{item.distance}
              </div>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            {item.description}
          </p>

          {/* Price & Deposit */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem', marginBottom: '1.75rem',
          }}>
            <div style={{
              padding: '1rem', borderRadius: '12px',
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}>
              <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price / Day</div>
              <div style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>₹{item.pricePerDay.toLocaleString()}</div>
            </div>
            <div style={{
              padding: '1rem', borderRadius: '12px',
              background: 'rgba(139,92,246,0.08)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}>
              <div style={{ color: '#a78bfa', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Security Deposit</div>
              <div style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif" }}>₹{item.deposit.toLocaleString()}</div>
            </div>
          </div>

          {/* Info note */}
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '10px',
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.15)',
            color: '#67e8f9', fontSize: '0.8rem', lineHeight: 1.5,
            marginBottom: '1.5rem',
          }}>
            🔒 Deposit is held in secure escrow and refunded automatically on safe return.
          </div>

          {/* CTA */}
          <button
            id={`modal-borrow-btn-${item.id}`}
            disabled={!item.available}
            onClick={() => { onClose(); onBorrow(item); }}
            style={{
              width: '100%', padding: '1rem',
              borderRadius: '12px',
              background: item.available
                ? 'linear-gradient(135deg, #8b5cf6, #6366f1)'
                : 'rgba(30,30,50,0.8)',
              color: item.available ? '#fff' : '#475569',
              fontWeight: 700, fontSize: '1rem',
              border: item.available ? 'none' : '1px solid rgba(255,255,255,0.05)',
              cursor: item.available ? 'pointer' : 'not-allowed',
              boxShadow: item.available ? '0 0 28px rgba(139,92,246,0.35)' : 'none',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
            onMouseEnter={e => { if (item.available) { e.target.style.transform = 'scale(1.02)'; e.target.style.boxShadow = '0 0 40px rgba(139,92,246,0.5)'; }}}
            onMouseLeave={e => { e.target.style.transform = 'scale(1)'; e.target.style.boxShadow = item.available ? '0 0 28px rgba(139,92,246,0.35)' : 'none'; }}
          >
            {item.available ? '📥 Request to Borrow' : '⏳ Currently on Loan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ItemModal;

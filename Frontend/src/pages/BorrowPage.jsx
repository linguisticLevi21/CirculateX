import React, { useState } from 'react';

const BorrowPage = ({ onNavigate }) => {
  const [form, setForm] = useState({ item: '', startDate: '', endDate: '', message: '' });

  const input = (field, placeholder, type = 'text') => (
    <input
      id={`borrow-${field}`}
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        background: 'rgba(19,19,31,0.9)',
        border: '1px solid rgba(139,92,246,0.2)',
        color: '#f1f5f9',
        fontSize: '0.9rem',
        outline: 'none',
        fontFamily: 'Inter, sans-serif',
        marginBottom: '1.25rem',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
    />
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <button
          id="borrow-back-btn"
          onClick={() => onNavigate('main')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem' }}
        >
          ← Back to Marketplace
        </button>

        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.8rem', fontWeight: 700,
          color: '#f1f5f9', marginBottom: '0.4rem',
        }}>
          📥 Borrow an Item
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Fill in the details and send a request to the lender.
        </p>

        <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          What do you want to borrow?
        </label>
        {input('item', 'e.g. Canon Camera, PS5, Drill...')}

        <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          From Date
        </label>
        {input('startDate', '', 'date')}

        <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Return Date
        </label>
        {input('endDate', '', 'date')}

        <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Message to Lender (optional)
        </label>
        <textarea
          id="borrow-message"
          placeholder="Hi, I need this for..."
          value={form.message}
          onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
          rows={3}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            borderRadius: '10px',
            background: 'rgba(19,19,31,0.9)',
            border: '1px solid rgba(139,92,246,0.2)',
            color: '#f1f5f9',
            fontSize: '0.9rem',
            outline: 'none',
            fontFamily: 'Inter, sans-serif',
            resize: 'vertical',
            marginBottom: '2rem',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
        />

        <button
          id="borrow-submit-btn"
          style={{
            width: '100%', padding: '1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 0 28px rgba(139,92,246,0.35)',
          }}
        >
          Send Borrow Request
        </button>
      </div>
    </div>
  );
};

export default BorrowPage;

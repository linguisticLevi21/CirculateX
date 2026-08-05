import React, { useState } from 'react';

const LendPage = ({ onNavigate }) => {
  const [form, setForm] = useState({ title: '', category: '', description: '', pricePerDay: '', deposit: '' });

  const input = (field, placeholder, type = 'text') => (
    <input
      id={`lend-${field}`}
      type={type}
      placeholder={placeholder}
      value={form[field]}
      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
      style={{
        width: '100%',
        padding: '0.75rem 1rem',
        borderRadius: '10px',
        background: 'rgba(19,19,31,0.9)',
        border: '1px solid rgba(16,185,129,0.2)',
        color: '#f1f5f9',
        fontSize: '0.9rem',
        outline: 'none',
        fontFamily: 'Inter, sans-serif',
        marginBottom: '1.25rem',
      }}
      onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
      onBlur={e => e.target.style.borderColor = 'rgba(16,185,129,0.2)'}
    />
  );

  const label = (text) => (
    <label style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {text}
    </label>
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <button
          id="lend-back-btn"
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
          📤 Lend an Item
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          List something you own. Others can request to borrow it.
        </p>

        {label('Item Name')}
        {input('title', 'e.g. Sony Camera, Drill Set...')}

        {label('Category')}
        <select
          id="lend-category"
          value={form.category}
          onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
            background: 'rgba(19,19,31,0.9)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: form.category ? '#f1f5f9' : '#64748b',
            fontSize: '0.9rem', outline: 'none',
            fontFamily: 'Inter, sans-serif',
            marginBottom: '1.25rem', cursor: 'pointer',
          }}
        >
          <option value="" style={{ background: '#13131f', color: '#64748b' }}>Select a category</option>
          {['Electronics', 'Gaming', 'Cameras', 'Tools', 'Music', 'Books', 'Outdoor', 'Other'].map(c => (
            <option key={c} value={c} style={{ background: '#13131f', color: '#f1f5f9' }}>{c}</option>
          ))}
        </select>

        {label('Description')}
        <textarea
          id="lend-description"
          placeholder="Describe the item, its condition, what's included..."
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          rows={3}
          style={{
            width: '100%', padding: '0.75rem 1rem', borderRadius: '10px',
            background: 'rgba(19,19,31,0.9)',
            border: '1px solid rgba(16,185,129,0.2)',
            color: '#f1f5f9', fontSize: '0.9rem', outline: 'none',
            fontFamily: 'Inter, sans-serif', resize: 'vertical',
            marginBottom: '1.25rem',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(16,185,129,0.2)'}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            {label('Price / Day (₹)')}
            {input('pricePerDay', 'e.g. 200', 'number')}
          </div>
          <div>
            {label('Security Deposit (₹)')}
            {input('deposit', 'e.g. 3000', 'number')}
          </div>
        </div>

        <button
          id="lend-submit-btn"
          style={{
            width: '100%', padding: '1rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 0 28px rgba(16,185,129,0.35)',
            marginTop: '0.5rem',
          }}
        >
          Post Listing
        </button>
      </div>
    </div>
  );
};

export default LendPage;

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const BorrowPage = ({ onNavigate, prefillItem }) => {
  const { addToast } = useApp();
  const [form, setForm] = useState({
    item: prefillItem || '',
    startDate: '',
    endDate: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  // Update prefill if navigated from item modal
  useEffect(() => {
    if (prefillItem) setForm(f => ({ ...f, item: prefillItem }));
  }, [prefillItem]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  // Calculate days & estimated cost
  const days = (() => {
    if (!form.startDate || !form.endDate) return 0;
    const diff = new Date(form.endDate) - new Date(form.startDate);
    return Math.max(0, Math.ceil(diff / 86400000));
  })();

  const ESTIMATE_RATE = 500; // generic ₹/day estimate shown before backend
  const estimatedCost = days * ESTIMATE_RATE;

  const validate = () => {
    const e = {};
    if (!form.item.trim()) e.item = 'Please enter what you want to borrow';
    if (!form.startDate) e.startDate = 'Pick a start date';
    if (!form.endDate) e.endDate = 'Pick a return date';
    if (form.startDate && form.endDate && days <= 0)
      e.endDate = 'Return date must be after start date';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setConfirmed(true);
    addToast(`📥 Borrow request sent for "${form.item}"!`, 'success');
    setSubmitting(false);
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    background: 'rgba(19,19,31,0.9)',
    border: `1px solid ${errors[field] ? 'rgba(244,63,94,0.5)' : 'rgba(139,92,246,0.2)'}`,
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
    marginBottom: '0.25rem',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600,
    display: 'block', marginBottom: '0.4rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  // Confirmation screen
  if (confirmed) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          textAlign: 'center', padding: '3rem 2rem', maxWidth: '460px',
          animation: 'modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 2s ease-in-out infinite' }}>📥</div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem',
          }}>Request Sent!</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.5rem' }}>
            Your borrow request for <strong style={{ color: '#a78bfa' }}>"{form.item}"</strong> has been sent.
            The lender will confirm within 2–4 hours.
          </p>

          {/* What's next */}
          <div style={{
            background: 'rgba(19,19,31,0.9)',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: '16px',
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}>
            <div style={{ color: '#94a3b8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem' }}>What Happens Next</div>
            {[
              { icon: '✅', text: 'Lender reviews & accepts your request' },
              { icon: '🔒', text: 'Security deposit locked in escrow' },
              { icon: '🤝', text: 'Coordinate handover with lender' },
              { icon: '📦', text: 'Enjoy! Return on time to get deposit back' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', marginBottom: i < 3 ? '0.75rem' : 0 }}>
                <span style={{ fontSize: '1.1rem' }}>{step.icon}</span>
                <span style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>{step.text}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('main')}
              style={{
                padding: '0.85rem 1.75rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 28px rgba(139,92,246,0.35)',
                fontFamily: 'Inter, sans-serif',
              }}
            >Back to Marketplace</button>
            <button
              onClick={() => onNavigate('dashboard')}
              style={{
                padding: '0.85rem 1.75rem', borderRadius: '12px',
                background: 'rgba(19,19,31,0.9)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >View My Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <button
          id="borrow-back-btn"
          onClick={() => onNavigate('main')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}
        >← Back to Marketplace</button>

        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.8rem', fontWeight: 700,
          color: '#f1f5f9', marginBottom: '0.4rem',
        }}>📥 Borrow an Item</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Fill in the details and send a request to the lender.
        </p>

        {/* Item */}
        <label style={labelStyle}>What do you want to borrow?</label>
        <input
          id="borrow-item"
          value={form.item}
          onChange={e => set('item', e.target.value)}
          placeholder="e.g. Canon Camera, PS5, Drill..."
          style={{ ...inputStyle('item'), marginBottom: errors.item ? '0.25rem' : '1.25rem' }}
          onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
          onBlur={e => e.target.style.borderColor = errors.item ? 'rgba(244,63,94,0.5)' : 'rgba(139,92,246,0.2)'}
        />
        {errors.item && <p style={{ color: '#f43f5e', fontSize: '0.78rem', marginBottom: '1rem' }}>{errors.item}</p>}

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.25rem' }}>
          <div>
            <label style={labelStyle}>From Date</label>
            <input
              id="borrow-startDate"
              type="date"
              value={form.startDate}
              min={new Date().toISOString().split('T')[0]}
              onChange={e => set('startDate', e.target.value)}
              style={{
                ...inputStyle('startDate'),
                colorScheme: 'dark',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
              onBlur={e => e.target.style.borderColor = errors.startDate ? 'rgba(244,63,94,0.5)' : 'rgba(139,92,246,0.2)'}
            />
            {errors.startDate && <p style={{ color: '#f43f5e', fontSize: '0.73rem' }}>{errors.startDate}</p>}
          </div>
          <div>
            <label style={labelStyle}>Return Date</label>
            <input
              id="borrow-endDate"
              type="date"
              value={form.endDate}
              min={form.startDate || new Date().toISOString().split('T')[0]}
              onChange={e => set('endDate', e.target.value)}
              style={{
                ...inputStyle('endDate'),
                colorScheme: 'dark',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
              onBlur={e => e.target.style.borderColor = errors.endDate ? 'rgba(244,63,94,0.5)' : 'rgba(139,92,246,0.2)'}
            />
            {errors.endDate && <p style={{ color: '#f43f5e', fontSize: '0.73rem' }}>{errors.endDate}</p>}
          </div>
        </div>

        {/* Duration calculator */}
        {days > 0 && (
          <div style={{
            padding: '1rem', borderRadius: '12px', marginTop: '0.75rem', marginBottom: '1.25rem',
            background: 'rgba(139,92,246,0.08)',
            border: '1px solid rgba(139,92,246,0.2)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</div>
              <div style={{ color: '#a78bfa', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem' }}>
                {days} day{days !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#64748b', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Rental Cost</div>
              <div style={{ color: '#10b981', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem' }}>
                ~₹{estimatedCost.toLocaleString()}
              </div>
            </div>
          </div>
        )}

        {/* Message */}
        <label style={{ ...labelStyle, marginTop: days > 0 ? '0' : '0.5rem' }}>Message to Lender <span style={{ color: '#475569', textTransform: 'none', fontWeight: 400 }}>(optional)</span></label>
        <textarea
          id="borrow-message"
          value={form.message}
          onChange={e => set('message', e.target.value)}
          placeholder="Hi, I need this for... I'll take good care of it!"
          rows={3}
          style={{
            ...inputStyle('message'),
            resize: 'vertical', marginBottom: '2rem',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
          onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
        />

        <button
          id="borrow-submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '1rem',
            borderRadius: '12px',
            background: submitting ? 'rgba(30,30,50,0.9)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 0 28px rgba(139,92,246,0.35)',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
        >
          {submitting ? '⏳ Sending request...' : '📩 Send Borrow Request'}
        </button>
      </div>
    </div>
  );
};

export default BorrowPage;

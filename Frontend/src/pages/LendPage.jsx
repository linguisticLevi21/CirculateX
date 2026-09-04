import React, { useState } from 'react';
import { useApp, CATEGORY_EMOJI } from '../context/AppContext';

const CATEGORIES = ['Electronics', 'Gaming', 'Cameras', 'Tools', 'Music', 'Books', 'Outdoor', 'Other'];

const LendPage = ({ onNavigate }) => {
  const { addListing, addToast } = useApp();
  const [form, setForm] = useState({
    title: '', category: '', description: '', pricePerDay: '', deposit: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Item name is required';
    if (!form.category) e.category = 'Please select a category';
    if (!form.description.trim()) e.description = 'Description is required';
    if (!form.pricePerDay || isNaN(form.pricePerDay) || +form.pricePerDay <= 0)
      e.pricePerDay = 'Enter a valid daily price';
    if (!form.deposit || isNaN(form.deposit) || +form.deposit <= 0)
      e.deposit = 'Enter a valid security deposit';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900)); // simulate async
    addListing({
      title: form.title.trim(),
      category: form.category,
      description: form.description.trim(),
      pricePerDay: +form.pricePerDay,
      deposit: +form.deposit,
    });
    addToast(`🎉 "${form.title}" listed successfully!`, 'success');
    setSuccess(true);
    setSubmitting(false);
  };

  const inputStyle = (field) => ({
    width: '100%',
    padding: '0.75rem 1rem',
    borderRadius: '10px',
    background: 'rgba(19,19,31,0.9)',
    border: `1px solid ${errors[field] ? 'rgba(244,63,94,0.5)' : 'rgba(16,185,129,0.2)'}`,
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  });

  const labelStyle = {
    color: '#94a3b8', fontSize: '0.78rem', fontWeight: 600,
    display: 'block', marginBottom: '0.4rem',
    textTransform: 'uppercase', letterSpacing: '0.05em',
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          textAlign: 'center', padding: '3rem 2rem', maxWidth: '440px',
          animation: 'modalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1.5rem', animation: 'float 2s ease-in-out infinite' }}>🎉</div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '2rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.75rem',
          }}>Item Listed!</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '0.5rem' }}>
            <strong style={{ color: '#10b981' }}>"{form.title}"</strong> is now live on the marketplace.
            Borrowers nearby can find it and send you requests.
          </p>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '2rem' }}>
            You'll earn ₹{Number(form.pricePerDay).toLocaleString()} per day with a ₹{Number(form.deposit).toLocaleString()} security deposit held.
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => onNavigate('main')}
              style={{
                padding: '0.85rem 1.75rem', borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 0 28px rgba(16,185,129,0.35)',
                fontFamily: 'Inter, sans-serif',
              }}
            >View Marketplace →</button>
            <button
              onClick={() => { setSuccess(false); setForm({ title: '', category: '', description: '', pricePerDay: '', deposit: '' }); }}
              style={{
                padding: '0.85rem 1.75rem', borderRadius: '12px',
                background: 'rgba(19,19,31,0.9)',
                border: '1px solid rgba(139,92,246,0.25)',
                color: '#94a3b8', fontWeight: 600, fontSize: '0.95rem',
                cursor: 'pointer', fontFamily: 'Inter, sans-serif',
              }}
            >List Another</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <button
          id="lend-back-btn"
          onClick={() => onNavigate('main')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '2rem', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}
        >← Back to Marketplace</button>

        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.8rem', fontWeight: 700,
          color: '#f1f5f9', marginBottom: '0.4rem',
        }}>📤 Lend an Item</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          List something you own. Others can request to borrow it.
        </p>

        {/* Item Name */}
        <label style={labelStyle}>Item Name</label>
        <input
          id="lend-title"
          value={form.title}
          onChange={e => set('title', e.target.value)}
          placeholder="e.g. Sony Camera, Drill Set..."
          style={inputStyle('title')}
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
          onBlur={e => e.target.style.borderColor = errors.title ? 'rgba(244,63,94,0.5)' : 'rgba(16,185,129,0.2)'}
        />
        {errors.title && <p style={{ color: '#f43f5e', fontSize: '0.78rem', marginTop: '-0.9rem', marginBottom: '1rem' }}>{errors.title}</p>}

        {/* Category */}
        <label style={{ ...labelStyle, marginTop: errors.title ? '0' : '0.25rem' }}>Category</label>
        <select
          id="lend-category"
          value={form.category}
          onChange={e => set('category', e.target.value)}
          style={{
            ...inputStyle('category'),
            color: form.category ? '#f1f5f9' : '#64748b',
            cursor: 'pointer', marginBottom: '1.25rem',
          }}
        >
          <option value="" style={{ background: '#13131f', color: '#64748b' }}>Select a category</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c} style={{ background: '#13131f', color: '#f1f5f9' }}>
              {CATEGORY_EMOJI[c]} {c}
            </option>
          ))}
        </select>
        {errors.category && <p style={{ color: '#f43f5e', fontSize: '0.78rem', marginTop: '-0.9rem', marginBottom: '1rem' }}>{errors.category}</p>}

        {/* Description */}
        <label style={labelStyle}>Description</label>
        <textarea
          id="lend-description"
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Describe the item, its condition, accessories included..."
          rows={3}
          style={{
            ...inputStyle('description'),
            resize: 'vertical', marginBottom: '1.25rem',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
          onBlur={e => e.target.style.borderColor = errors.description ? 'rgba(244,63,94,0.5)' : 'rgba(16,185,129,0.2)'}
        />
        {errors.description && <p style={{ color: '#f43f5e', fontSize: '0.78rem', marginTop: '-0.9rem', marginBottom: '1rem' }}>{errors.description}</p>}

        {/* Price & Deposit */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Price / Day (₹)</label>
            <input
              id="lend-pricePerDay"
              type="number"
              min="1"
              value={form.pricePerDay}
              onChange={e => set('pricePerDay', e.target.value)}
              placeholder="e.g. 200"
              style={{ ...inputStyle('pricePerDay'), marginBottom: '0.25rem' }}
              onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
              onBlur={e => e.target.style.borderColor = errors.pricePerDay ? 'rgba(244,63,94,0.5)' : 'rgba(16,185,129,0.2)'}
            />
            {errors.pricePerDay && <p style={{ color: '#f43f5e', fontSize: '0.73rem' }}>{errors.pricePerDay}</p>}
          </div>
          <div>
            <label style={labelStyle}>Security Deposit (₹)</label>
            <input
              id="lend-deposit"
              type="number"
              min="1"
              value={form.deposit}
              onChange={e => set('deposit', e.target.value)}
              placeholder="e.g. 3000"
              style={{ ...inputStyle('deposit'), marginBottom: '0.25rem' }}
              onFocus={e => e.target.style.borderColor = 'rgba(16,185,129,0.6)'}
              onBlur={e => e.target.style.borderColor = errors.deposit ? 'rgba(244,63,94,0.5)' : 'rgba(16,185,129,0.2)'}
            />
            {errors.deposit && <p style={{ color: '#f43f5e', fontSize: '0.73rem' }}>{errors.deposit}</p>}
          </div>
        </div>

        {/* Preview earnings */}
        {form.pricePerDay && form.deposit && !isNaN(form.pricePerDay) && !isNaN(form.deposit) && (
          <div style={{
            marginTop: '1.25rem', padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.2)',
            display: 'flex', gap: '1.5rem',
            animation: 'fadeIn 0.3s ease',
          }}>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>7-day Earn</div>
              <div style={{ color: '#10b981', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem' }}>
                ₹{(+form.pricePerDay * 7).toLocaleString()}
              </div>
            </div>
            <div>
              <div style={{ color: '#64748b', fontSize: '0.73rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Deposit Held</div>
              <div style={{ color: '#a78bfa', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.1rem' }}>
                ₹{(+form.deposit).toLocaleString()}
              </div>
            </div>
          </div>
        )}

        <button
          id="lend-submit-btn"
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width: '100%', padding: '1rem', marginTop: '1.75rem',
            borderRadius: '12px',
            background: submitting ? 'rgba(30,30,50,0.9)' : 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontWeight: 700, fontSize: '1rem',
            border: 'none', cursor: submitting ? 'not-allowed' : 'pointer',
            boxShadow: submitting ? 'none' : '0 0 28px rgba(16,185,129,0.35)',
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.2s',
          }}
        >
          {submitting ? '⏳ Posting your listing...' : '🚀 Post Listing'}
        </button>
      </div>
    </div>
  );
};

export default LendPage;

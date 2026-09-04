import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import ItemModal from '../components/ItemModal';

const CATEGORIES = ['All', 'Electronics', 'Gaming', 'Cameras', 'Tools', 'Music', 'Books', 'Outdoor', 'Other'];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'nearest', label: 'Nearest First' },
];

const ItemCard = ({ item, onClick }) => {
  const [hovered, setHovered] = useState(false);
  const stars = item.rating ? `${item.rating} ★` : 'New';

  return (
    <div
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#13131f',
        border: `1px solid ${hovered ? 'rgba(139,92,246,0.4)' : 'rgba(139,92,246,0.1)'}`,
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.4)' : '0 4px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Image */}
      <div style={{
        height: '140px',
        background: item.imageBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3.5rem',
        position: 'relative',
      }}>
        {item.imageEmoji}
        <div style={{
          position: 'absolute',
          top: '0.6rem', right: '0.6rem',
          padding: '0.2rem 0.6rem',
          borderRadius: '100px',
          background: item.available ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)',
          border: `1px solid ${item.available ? 'rgba(16,185,129,0.5)' : 'rgba(244,63,94,0.5)'}`,
          color: item.available ? '#10b981' : '#f43f5e',
          fontSize: '0.68rem',
          fontWeight: 700,
        }}>
          {item.available ? '● Available' : '● On Loan'}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {/* Category */}
        <span style={{
          display: 'inline-block',
          padding: '0.15rem 0.6rem',
          borderRadius: '100px',
          background: 'rgba(139,92,246,0.12)',
          color: '#a78bfa',
          fontSize: '0.7rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
        }}>{item.category}</span>

        <h3 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          color: '#f1f5f9',
          fontSize: '0.95rem',
          fontWeight: 700,
          marginBottom: '0.35rem',
          lineHeight: 1.3,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>{item.title}</h3>

        {/* Lender & rating */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          marginBottom: '0.75rem',
          color: '#64748b',
          fontSize: '0.78rem',
        }}>
          <span style={{
            width: '18px', height: '18px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.55rem', fontWeight: 700, color: '#fff',
          }}>{item.lender[0]}</span>
          <span>{item.lender}</span>
          <span>·</span>
          <span style={{ color: item.rating ? '#fbbf24' : '#64748b' }}>{stars}</span>
          <span>·</span>
          <span>{item.distance}</span>
        </div>

        {/* Price */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <span style={{
              color: '#10b981',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 800,
            }}>₹{item.pricePerDay.toLocaleString()}</span>
            <span style={{ color: '#475569', fontSize: '0.75rem' }}>/day</span>
          </div>
          <div style={{ color: '#475569', fontSize: '0.72rem' }}>
            + ₹{item.deposit.toLocaleString()} deposit
          </div>
        </div>
      </div>
    </div>
  );
};

const MainPage = ({ onNavigate }) => {
  const { listings } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sort, setSort] = useState('newest');
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const filtered = useMemo(() => {
    let items = listings.filter(item => {
      const matchSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === 'All' || item.category === activeCategory;
      return matchSearch && matchCat;
    });

    switch (sort) {
      case 'price-asc':  items = [...items].sort((a, b) => a.pricePerDay - b.pricePerDay); break;
      case 'price-desc': items = [...items].sort((a, b) => b.pricePerDay - a.pricePerDay); break;
      case 'rating':     items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0)); break;
      case 'newest':     items = [...items].sort((a, b) => b.postedAt - a.postedAt); break;
      default: break;
    }
    return items;
  }, [listings, search, activeCategory, sort]);

  const handleBorrow = (item) => {
    onNavigate('borrow', { prefillItem: item.title });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px' }}>

      {/* Header + Search */}
      <div style={{ padding: '2rem 2rem 0' }}>
        <h1 style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '1.8rem', fontWeight: 700,
          color: '#f1f5f9', marginBottom: '0.25rem',
        }}>Marketplace</h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          {filtered.length} item{filtered.length !== 1 ? 's' : ''} available to borrow
        </p>

        {/* Search Bar */}
        <div style={{ position: 'relative', maxWidth: '480px', marginBottom: '1.25rem' }}>
          <span style={{
            position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
            color: '#64748b', fontSize: '1rem', pointerEvents: 'none',
          }}>🔍</span>
          <input
            id="marketplace-search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search cameras, PS5, drills..."
            style={{
              width: '100%',
              padding: '0.8rem 1rem 0.8rem 2.75rem',
              borderRadius: '12px',
              background: 'rgba(19,19,31,0.9)',
              border: '1px solid rgba(139,92,246,0.2)',
              color: '#f1f5f9',
              fontSize: '0.9rem',
              outline: 'none',
              fontFamily: 'Inter, sans-serif',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
            onBlur={e => e.target.style.borderColor = 'rgba(139,92,246,0.2)'}
          />
        </div>

        {/* Category Pills + Sort */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                id={`filter-${cat.toLowerCase()}`}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '100px',
                  border: activeCategory === cat
                    ? '1px solid rgba(139,92,246,0.6)'
                    : '1px solid rgba(139,92,246,0.15)',
                  background: activeCategory === cat
                    ? 'rgba(139,92,246,0.2)'
                    : 'rgba(19,19,31,0.8)',
                  color: activeCategory === cat ? '#a78bfa' : '#64748b',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'Inter, sans-serif',
                }}
              >{cat}</button>
            ))}
          </div>

          <select
            id="marketplace-sort"
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{
              padding: '0.4rem 0.85rem',
              borderRadius: '10px',
              background: 'rgba(19,19,31,0.9)',
              border: '1px solid rgba(139,92,246,0.15)',
              color: '#94a3b8',
              fontSize: '0.8rem',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {SORT_OPTIONS.map(o => (
              <option key={o.value} value={o.value} style={{ background: '#13131f' }}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          justifyContent: 'center', padding: '5rem 2rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>📦</div>
          <p style={{ fontSize: '1rem', color: '#64748b' }}>No listings match your search.</p>
          <p style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem' }}>
            Try a different category or <button onClick={() => { setSearch(''); setActiveCategory('All'); }} style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', fontWeight: 600 }}>clear filters</button>
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: '1.25rem',
          padding: '0 2rem 8rem',
        }}>
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClick={setSelectedItem} />
          ))}
        </div>
      )}

      {/* FAB */}
      <div style={{
        position: 'fixed', bottom: '2rem', right: '2rem',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
        gap: '0.75rem', zIndex: 100,
      }}>
        {menuOpen && (
          <>
            <button
              id="corner-lend-btn"
              onClick={() => { setMenuOpen(false); onNavigate('lend'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 1.4rem', borderRadius: '100px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(16,185,129,0.4)',
                animation: 'fadeInUp 0.2s ease',
                whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              }}
            >📤 Lend an Item</button>

            <button
              id="corner-borrow-btn"
              onClick={() => { setMenuOpen(false); onNavigate('borrow'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.75rem 1.4rem', borderRadius: '100px',
                background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                color: '#fff', fontWeight: 700, fontSize: '0.95rem',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(139,92,246,0.4)',
                animation: 'fadeInUp 0.25s ease',
                whiteSpace: 'nowrap', fontFamily: 'Inter, sans-serif',
              }}
            >📥 Browse to Borrow</button>
          </>
        )}

        <button
          id="corner-fab-btn"
          onClick={() => setMenuOpen(o => !o)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: menuOpen ? 'rgba(30,30,50,0.95)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: '#fff',
            border: menuOpen ? '1px solid rgba(139,92,246,0.4)' : 'none',
            cursor: 'pointer', fontSize: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 24px rgba(139,92,246,0.45)',
            transition: 'all 0.25s',
            transform: menuOpen ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
          title="Lend or Borrow"
        >+</button>
      </div>

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onBorrow={handleBorrow}
        />
      )}
    </div>
  );
};

export default MainPage;

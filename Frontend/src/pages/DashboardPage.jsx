import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const StatCard = ({ icon, label, value, accent }) => (
  <div style={{
    padding: '1.25rem',
    borderRadius: '16px',
    background: '#13131f',
    border: '1px solid rgba(139,92,246,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  }}>
    <div style={{ fontSize: '1.5rem' }}>{icon}</div>
    <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
    <div style={{ color: accent || '#f1f5f9', fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.4rem', fontWeight: 800 }}>{value}</div>
  </div>
);

const DashboardPage = ({ onNavigate }) => {
  const { listings, myBorrows, escrowBalance } = useApp();
  const [activeTab, setActiveTab] = useState('listings');

  const myListings = listings.filter(l => l.lender === 'You');
  const totalEarningsPotential = myListings.reduce((sum, l) => sum + l.pricePerDay * 7, 0);

  const tabStyle = (tab) => ({
    padding: '0.6rem 1.25rem',
    borderRadius: '10px',
    border: 'none',
    background: activeTab === tab ? 'rgba(139,92,246,0.2)' : 'transparent',
    color: activeTab === tab ? '#a78bfa' : '#64748b',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
    borderBottom: activeTab === tab ? '2px solid #8b5cf6' : '2px solid transparent',
  });

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', paddingTop: '64px' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 2rem' }}>

        <button
          onClick={() => onNavigate('main')}
          style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', marginBottom: '1.5rem', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif' }}
        >← Back to Marketplace</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem',
            fontWeight: 700, color: '#fff', flexShrink: 0,
          }}>S</div>
          <div>
            <h1 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', margin: 0,
            }}>Shahadat Hussain</h1>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>
              CirculateX Member · Trusted Lender
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '0.75rem',
          marginBottom: '2rem',
        }}>
          <StatCard icon="📤" label="My Listings" value={myListings.length} accent="#10b981" />
          <StatCard icon="📥" label="Active Borrows" value={myBorrows.length} accent="#a78bfa" />
          <StatCard icon="🔒" label="Escrow Balance" value={`₹${escrowBalance.toLocaleString()}`} accent="#06b6d4" />
          <StatCard icon="💰" label="7-day Potential" value={`₹${totalEarningsPotential.toLocaleString()}`} accent="#fbbf24" />
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '0.25rem', marginBottom: '1.5rem',
          borderBottom: '1px solid rgba(139,92,246,0.1)',
          paddingBottom: '0.1rem',
        }}>
          <button style={tabStyle('listings')} onClick={() => setActiveTab('listings')}>
            📤 My Listings ({myListings.length})
          </button>
          <button style={tabStyle('borrows')} onClick={() => setActiveTab('borrows')}>
            📥 My Borrows ({myBorrows.length})
          </button>
          <button style={tabStyle('escrow')} onClick={() => setActiveTab('escrow')}>
            🔒 Escrow
          </button>
        </div>

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div>
            {myListings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
                <p>You haven't listed anything yet.</p>
                <button
                  onClick={() => onNavigate('lend')}
                  style={{
                    marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                  }}
                >+ List Your First Item</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myListings.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    background: '#13131f',
                    border: '1px solid rgba(139,92,246,0.1)',
                    borderRadius: '14px', padding: '1rem',
                  }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0,
                      background: item.imageBg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>{item.imageEmoji}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                        {item.title}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem' }}>
                        {item.category} · ₹{item.pricePerDay}/day · ₹{item.deposit.toLocaleString()} deposit
                      </div>
                    </div>
                    <div style={{
                      padding: '0.3rem 0.8rem', borderRadius: '100px',
                      background: item.available ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)',
                      border: `1px solid ${item.available ? 'rgba(16,185,129,0.4)' : 'rgba(244,63,94,0.4)'}`,
                      color: item.available ? '#10b981' : '#f43f5e',
                      fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                    }}>
                      {item.available ? '● Available' : '● On Loan'}
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => onNavigate('lend')}
                  style={{
                    padding: '0.75rem', borderRadius: '12px',
                    background: 'rgba(16,185,129,0.08)',
                    border: '1px dashed rgba(16,185,129,0.3)',
                    color: '#10b981', fontWeight: 600, cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.875rem',
                    transition: 'all 0.2s',
                    marginTop: '0.25rem',
                  }}
                >+ Add Another Listing</button>
              </div>
            )}
          </div>
        )}

        {/* Borrows Tab */}
        {activeTab === 'borrows' && (
          <div>
            {myBorrows.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#475569' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📥</div>
                <p>You haven't borrowed anything yet.</p>
                <button
                  onClick={() => onNavigate('main')}
                  style={{
                    marginTop: '1rem', padding: '0.75rem 1.5rem', borderRadius: '10px',
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.9rem',
                  }}
                >Browse Marketplace</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {myBorrows.map(borrow => (
                  <div key={borrow.id} style={{
                    background: '#13131f',
                    border: '1px solid rgba(139,92,246,0.15)',
                    borderRadius: '14px', padding: '1.25rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '10px', flexShrink: 0,
                        background: borrow.imageBg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                      }}>{borrow.imageEmoji}</div>
                      <div>
                        <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                          {borrow.title}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>From {borrow.lender} · ₹{borrow.pricePerDay}/day</div>
                      </div>
                    </div>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
                    }}>
                      <div style={{
                        padding: '0.75rem', borderRadius: '10px',
                        background: borrow.daysLeft <= 1 ? 'rgba(244,63,94,0.1)' : 'rgba(139,92,246,0.08)',
                        border: `1px solid ${borrow.daysLeft <= 1 ? 'rgba(244,63,94,0.25)' : 'rgba(139,92,246,0.15)'}`,
                      }}>
                        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Days Left</div>
                        <div style={{ color: borrow.daysLeft <= 1 ? '#f43f5e' : '#a78bfa', fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", fontSize: '1.2rem' }}>
                          {borrow.daysLeft} day{borrow.daysLeft !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div style={{
                        padding: '0.75rem', borderRadius: '10px',
                        background: 'rgba(6,182,212,0.08)',
                        border: '1px solid rgba(6,182,212,0.15)',
                      }}>
                        <div style={{ color: '#64748b', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Return By</div>
                        <div style={{ color: '#67e8f9', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: '0.95rem' }}>
                          {borrow.returnDate}
                        </div>
                      </div>
                    </div>
                    <div style={{
                      marginTop: '0.75rem', padding: '0.65rem 0.85rem', borderRadius: '8px',
                      background: 'rgba(16,185,129,0.07)',
                      border: '1px solid rgba(16,185,129,0.12)',
                      color: '#64748b', fontSize: '0.78rem',
                    }}>
                      🔒 Deposit held: <strong style={{ color: '#10b981' }}>₹{borrow.deposit.toLocaleString()}</strong> — refunded on safe return
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Escrow Tab */}
        {activeTab === 'escrow' && (
          <div>
            <div style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: '20px', padding: '2rem', marginBottom: '1.25rem',
            }}>
              <div style={{ color: '#67e8f9', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Total Escrow Balance</div>
              <div style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '2.5rem', fontWeight: 900, color: '#f1f5f9',
              }}>₹{escrowBalance.toLocaleString()}</div>
              <div style={{ color: '#64748b', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                Funds are secured and returned automatically on safe item return.
              </div>
            </div>

            {/* Escrow explanation cards */}
            {[
              { icon: '🔒', title: 'How Escrow Works', desc: 'When you borrow an item, the security deposit is locked in our escrow system — neither you nor the lender can touch it.' },
              { icon: '✅', title: 'Auto-Release on Return', desc: 'Once the lender confirms the item is returned safely, your full deposit is released back to your account within 24 hours.' },
              { icon: '⚡', title: 'Dispute Protection', desc: 'If there\'s a dispute about item condition, our team reviews the case and decides deposit allocation fairly.' },
            ].map((card, i) => (
              <div key={i} style={{
                display: 'flex', gap: '1rem', alignItems: 'flex-start',
                padding: '1.1rem',
                borderRadius: '12px',
                background: '#13131f',
                border: '1px solid rgba(139,92,246,0.08)',
                marginBottom: '0.65rem',
              }}>
                <div style={{ fontSize: '1.5rem', flexShrink: 0 }}>{card.icon}</div>
                <div>
                  <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.3rem' }}>{card.title}</div>
                  <div style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6 }}>{card.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

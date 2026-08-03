import React from 'react';

// ─── Data ────────────────────────────────────────────────────────────────────
const steps = [
  {
    icon: '🔍',
    title: 'Search & Request',
    desc: 'Browse resources listed by students & clubs around your campus.',
  },
  {
    icon: '🤝',
    title: 'Borrow & Use',
    desc: 'Meet on campus, pick up the item, and use it for your project or event.',
  },
  {
    icon: '✅',
    title: 'Return & Review',
    desc: 'Return the resource on time and leave a trust review for the community.',
  },
];

const benefits = [
  { icon: '💸', title: 'Save Money', desc: "Don't buy an Arduino for a one-week project." },
  { icon: '🌱', title: 'Eco-Friendly', desc: 'Reduce e-waste by reusing what already exists.' },
  { icon: '🔒', title: 'Campus Verified', desc: 'Only verified students can join. Trust is built-in.' },
];

// ─── Components ──────────────────────────────────────────────────────────────
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{ background: 'rgba(10,10,20,0.7)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-base"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          CX
        </div>
        <span className="text-white font-bold text-xl tracking-tight">CirculateX</span>
      </div>
      {/* Auth buttons */}
      <div className="flex items-center gap-3">
        <button className="text-gray-300 hover:text-white font-medium text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-white/10">
          Sign In
        </button>
        <button className="font-semibold text-sm px-5 py-2 rounded-lg text-white transition-all duration-200"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          onMouseEnter={e => e.target.style.opacity = '0.85'}
          onMouseLeave={e => e.target.style.opacity = '1'}>
          Register
        </button>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #0a0a14 0%, #0f0a2e 50%, #0a0a14 100%)' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      </div>

      {/* Badge */}
      <div className="relative mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium text-indigo-300 border"
        style={{ borderColor: 'rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)' }}>
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        Campus Resource Circulation Platform
      </div>

      {/* Headline */}
      <h1 className="relative text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-tight max-w-4xl">
        Transfer the product,{' '}
        <span style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          not the ownership.
        </span>
      </h1>

      {/* Sub */}
      <p className="relative text-gray-400 text-xl max-w-xl mb-10 leading-relaxed">
        Borrow expensive campus gear — Arduino boards, cameras, lab tools — from verified students around you. Save money. Build trust.
      </p>

      {/* CTAs */}
      <div className="relative flex flex-col sm:flex-row gap-4">
        <button className="px-8 py-3.5 rounded-xl font-semibold text-white transition-all duration-200 hover:scale-105 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.4)' }}>
          Browse Resources →
        </button>
        <button className="px-8 py-3.5 rounded-xl font-semibold text-gray-300 border border-white/20 hover:border-indigo-500 hover:text-white transition-all duration-200 hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.05)' }}>
          List an Item
        </button>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section className="py-24 px-6" style={{ background: '#0d0d1a' }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
        <h2 className="text-center text-white text-4xl font-bold mb-14">Simple. Secure. Campus-first.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="flex flex-col items-center text-center p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mb-4"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {i + 1}
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="py-24 px-6" style={{ background: '#0a0a14' }}>
      <div className="max-w-5xl mx-auto">
        <p className="text-center text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Why CirculateX</p>
        <h2 className="text-center text-white text-4xl font-bold mb-14">Access over ownership.</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((b, i) => (
            <div key={i} className="p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <div className="text-3xl mb-4">{b.icon}</div>
              <h3 className="text-white font-bold text-lg mb-2">{b.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-10 px-6 border-t" style={{ background: '#0d0d1a', borderColor: 'rgba(255,255,255,0.08)' }}>
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-gray-500 text-sm">
          Made with ❤️ by <span className="text-indigo-400 font-medium">Shahadat</span> &nbsp;·&nbsp; &copy; {new Date().getFullYear()} CirculateX
        </p>
        <div className="flex items-center gap-6">
          <a href="#" className="text-gray-500 hover:text-indigo-400 text-sm transition-colors duration-200">GitHub</a>
          <a href="#" className="text-gray-500 hover:text-indigo-400 text-sm transition-colors duration-200">LinkedIn</a>
          <a href="#" className="text-gray-500 hover:text-indigo-400 text-sm transition-colors duration-200">Contact</a>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      <Navbar />
      <Hero />
      <HowItWorks />
      <Benefits />
      <Footer />
    </div>
  );
}

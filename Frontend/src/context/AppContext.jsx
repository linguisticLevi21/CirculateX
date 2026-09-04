import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext(null);

const MOCK_LISTINGS = [
  {
    id: 'mock-1',
    title: 'Sony A7 IV Full Frame Camera',
    category: 'Cameras',
    description: 'Professional mirrorless camera in mint condition. Includes 28-70mm kit lens, 2 batteries, charger, and a padded carry case. Perfect for weekend shoots or events.',
    pricePerDay: 800,
    deposit: 15000,
    lender: 'Arjun M.',
    rating: 4.9,
    totalLends: 38,
    distance: '1.2 km',
    available: true,
    imageEmoji: '📷',
    imageBg: 'linear-gradient(135deg, #1e1b4b, #312e81)',
    postedAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'mock-2',
    title: 'PlayStation 5 Console',
    category: 'Gaming',
    description: 'PS5 Disc Edition with 2 controllers. Includes 3 games: Spider-Man 2, God of War Ragnarok, and FIFA 25. All sanitized and tested.',
    pricePerDay: 350,
    deposit: 30000,
    lender: 'Rahul K.',
    rating: 4.8,
    totalLends: 22,
    distance: '2.8 km',
    available: true,
    imageEmoji: '🎮',
    imageBg: 'linear-gradient(135deg, #0c4a6e, #075985)',
    postedAt: Date.now() - 86400000 * 7,
  },
  {
    id: 'mock-3',
    title: 'DJI Mavic 3 Pro Drone',
    category: 'Electronics',
    description: 'Flagship DJI drone with Hasselblad camera. Fly time 43 min. Includes 3 batteries, charging hub, ND filter set, and carry bag. Fully charged, ready to fly.',
    pricePerDay: 1200,
    deposit: 40000,
    lender: 'Priya S.',
    rating: 5.0,
    totalLends: 14,
    distance: '0.9 km',
    available: false,
    imageEmoji: '🚁',
    imageBg: 'linear-gradient(135deg, #064e3b, #065f46)',
    postedAt: Date.now() - 86400000 * 2,
  },
  {
    id: 'mock-4',
    title: 'Bosch Professional Drill Set',
    category: 'Tools',
    description: 'Bosch GSB 18V-55 cordless drill set with 40-piece bit set, 2 batteries, and carrying case. Ideal for home renovation projects or furniture assembly.',
    pricePerDay: 120,
    deposit: 4000,
    lender: 'Vikram T.',
    rating: 4.7,
    totalLends: 55,
    distance: '3.1 km',
    available: true,
    imageEmoji: '🔨',
    imageBg: 'linear-gradient(135deg, #78350f, #92400e)',
    postedAt: Date.now() - 86400000 * 10,
  },
  {
    id: 'mock-5',
    title: 'Fender Stratocaster Electric Guitar',
    category: 'Music',
    description: 'American Standard Strat in sunburst finish. Comes with Fender amp, cable, picks, strap, and gig bag. Set up with fresh strings for ideal playability.',
    pricePerDay: 450,
    deposit: 20000,
    lender: 'Kavya R.',
    rating: 4.9,
    totalLends: 18,
    distance: '4.5 km',
    available: true,
    imageEmoji: '🎸',
    imageBg: 'linear-gradient(135deg, #4c1d95, #5b21b6)',
    postedAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'mock-6',
    title: 'MacBook Pro 16" M3 Max',
    category: 'Electronics',
    description: '16GB RAM, 1TB SSD. Pristine condition. Comes with original MagSafe charger. Perfect for video editing, development, or design work on the go.',
    pricePerDay: 1500,
    deposit: 80000,
    lender: 'Aditya N.',
    rating: 4.8,
    totalLends: 9,
    distance: '1.7 km',
    available: true,
    imageEmoji: '💻',
    imageBg: 'linear-gradient(135deg, #1e293b, #0f172a)',
    postedAt: Date.now() - 86400000 * 1,
  },
];

const MY_BORROWS_MOCK = [
  {
    id: 'borrow-1',
    title: 'Canon EOS R5 Camera',
    lender: 'Siddharth V.',
    pricePerDay: 900,
    deposit: 18000,
    daysLeft: 2,
    returnDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-IN'),
    imageEmoji: '📸',
    imageBg: 'linear-gradient(135deg, #1e1b4b, #4c1d95)',
  },
];

export const CATEGORY_EMOJI = {
  Electronics: '⚡',
  Gaming: '🎮',
  Cameras: '📷',
  Tools: '🔧',
  Music: '🎵',
  Books: '📚',
  Outdoor: '🏕️',
  Other: '📦',
};

export const AppProvider = ({ children }) => {
  const [listings, setListings] = useState(() => {
    try {
      const saved = localStorage.getItem('cx_listings');
      return saved ? [...MOCK_LISTINGS, ...JSON.parse(saved)] : MOCK_LISTINGS;
    } catch { return MOCK_LISTINGS; }
  });

  const [myBorrows] = useState(MY_BORROWS_MOCK);
  const [toasts, setToasts] = useState([]);
  const [escrowBalance] = useState(18000);

  const addListing = (listing) => {
    const newListing = {
      ...listing,
      id: `user-${Date.now()}`,
      lender: 'You',
      rating: null,
      totalLends: 0,
      distance: 'Your area',
      available: true,
      imageBg: 'linear-gradient(135deg, #134e4a, #0f766e)',
      imageEmoji: CATEGORY_EMOJI[listing.category] || '📦',
      postedAt: Date.now(),
    };
    setListings(prev => {
      const updated = [newListing, ...prev];
      const userListings = updated.filter(l => l.id.startsWith('user-'));
      localStorage.setItem('cx_listings', JSON.stringify(userListings));
      return updated;
    });
    return newListing;
  };

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <AppContext.Provider value={{ listings, addListing, myBorrows, toasts, addToast, removeToast, escrowBalance }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

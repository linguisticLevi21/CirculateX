import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MainPage from './pages/MainPage';
import BorrowPage from './pages/BorrowPage';
import LendPage from './pages/LendPage';

const App = () => {
  const [page, setPage] = useState('home');

  const navigate = (destination) => {
    setPage(destination);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar onNavigate={navigate} />

      {page === 'home'   && <HomePage   onNavigate={navigate} />}
      {page === 'main'   && <MainPage   onNavigate={navigate} />}
      {page === 'borrow' && <BorrowPage onNavigate={navigate} />}
      {page === 'lend'   && <LendPage   onNavigate={navigate} />}
    </div>
  );
};

export default App;

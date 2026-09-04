import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import MainPage from './pages/MainPage';
import BorrowPage from './pages/BorrowPage';
import LendPage from './pages/LendPage';
import DashboardPage from './pages/DashboardPage';

const AppInner = () => {
  const [page, setPage] = useState('home');
  const [pageParams, setPageParams] = useState({});

  const navigate = (destination, params = {}) => {
    setPage(destination);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f' }}>
      <Navbar onNavigate={navigate} currentPage={page} />

      {page === 'home'      && <HomePage      onNavigate={navigate} />}
      {page === 'main'      && <MainPage      onNavigate={navigate} />}
      {page === 'borrow'    && <BorrowPage    onNavigate={navigate} prefillItem={pageParams.prefillItem} />}
      {page === 'lend'      && <LendPage      onNavigate={navigate} />}
      {page === 'dashboard' && <DashboardPage onNavigate={navigate} />}

      <ToastContainer />
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppInner />
  </AppProvider>
);

export default App;

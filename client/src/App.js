import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { API_URL } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import TermsModal from './components/TermsModal';

import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/Dashboard';
import Checkout from './pages/Checkout';
import Confirmation from './pages/Confirmation';
import DownloadPage from './pages/DownloadPage';

function AppInner() {
  const [showTerms, setShowTerms] = useState(false);
  const [statusBar, setStatusBar] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/settings`).then(r => {
      if (r.data.statusBarActive && r.data.statusBarText) {
        setStatusBar({ text: r.data.statusBarText, link: r.data.statusBarLink });
      }
    }).catch(() => {});
  }, []);

  return (
    <>
      {statusBar && (
        <div className="status-bar">
          {statusBar.text}
          {statusBar.link && <> — <a href={statusBar.link} target="_blank" rel="noreferrer">Learn more</a></>}
        </div>
      )}
      <Navbar onTerms={() => setShowTerms(true)} />
      <CartDrawer />
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <Routes>
        <Route path="/" element={<Home onTerms={() => setShowTerms(true)} />} />
        <Route path="/product/:slug" element={<ProductDetail onTerms={() => setShowTerms(true)} />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/checkout" element={<Checkout onTerms={() => setShowTerms(true)} />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/download/:token" element={<DownloadPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer onTerms={() => setShowTerms(true)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppInner />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

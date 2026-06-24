import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';

export default function DownloadPage() {
  const { token } = useParams();
  const { user, login, loading } = useAuth();
  const [status, setStatus] = useState('loading'); // loading | downloading | error | expired | no_license
  const [productName, setProductName] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => {
    if (loading) return;
    if (!user) { setStatus('login'); return; }
    // Fetch token info first
    fetch(`${API_URL}/api/download/info/${token}`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data.error) { setStatus('error'); setErr(data.error); return; }
        setProductName(data.productName);
        setStatus('downloading');
        // Trigger download
        window.location.href = `${API_URL}/api/download/${token}`;
      })
      .catch(() => { setStatus('error'); setErr('Something went wrong'); });
  }, [user, loading, token]);

  if (status === 'login') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', padding: '2rem' }}>
      <span className="material-icons" style={{ fontSize: 56, color: '#333' }}>lock</span>
      <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.4rem' }}>Login required</div>
      <p style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>You need to be logged in with your Discord account to access this download.</p>
      <button className="btn btn-white" onClick={login}>Log in with Discord</button>
    </div>
  );

  if (status === 'loading') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem' }}>
      <div className="spinner" />
    </div>
  );

  if (status === 'downloading') return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', padding: '2rem' }}>
      <div className="spinner" />
      <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.6rem' }}>{productName}</div>
      <p style={{ color: '#666', fontSize: 14 }}>Downloading...</p>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1.5rem', padding: '2rem' }}>
      <span className="material-icons" style={{ fontSize: 56, color: '#f87171' }}>error_outline</span>
      <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.4rem' }}>
        {status === 'expired' ? 'Link expired' : 'Error'}
      </div>
      <p style={{ color: '#666', fontSize: 14, textAlign: 'center' }}>{err || 'This download link is invalid or has expired.'}</p>
      <a href="/dashboard" className="btn btn-white">Go to My Products</a>
    </div>
  );
}

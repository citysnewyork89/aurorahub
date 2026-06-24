import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Confirmation() {
  const nav = useNavigate();
  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '3rem 2rem', textAlign: 'center' }}>
      <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#0d1f0d', border: '2px solid #166534', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <span className="material-icons" style={{ fontSize: 40, color: '#4ade80' }}>check</span>
      </div>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', marginBottom: '0.6rem' }}>Purchase complete</h1>
      <p style={{ color: '#666', fontSize: 14, marginBottom: '2rem', maxWidth: 420, lineHeight: 1.8 }}>
        Your order has been placed successfully. Check your Discord DMs — we've sent you the download link for your product.
      </p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-white" onClick={() => nav('/dashboard?tab=orders')}>
          <span className="material-icons" style={{ fontSize: 16 }}>receipt_long</span>
          View my orders
        </button>
        <button className="btn btn-outline" onClick={() => nav('/dashboard')}>
          <span className="material-icons" style={{ fontSize: 16 }}>inventory_2</span>
          My Products
        </button>
      </div>
    </div>
  );
}

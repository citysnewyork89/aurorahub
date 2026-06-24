import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout({ onTerms }) {
  const { user, login } = useAuth();
  const { items, total, clear } = useCart();
  const nav = useNavigate();
  const [roblox, setRoblox] = useState('');
  const [email, setEmail] = useState('');
  const [promo, setPromo] = useState('');
  const [promoData, setPromoData] = useState(null);
  const [promoErr, setPromoErr] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [guildErr, setGuildErr] = useState(false);

  if (items.length === 0) { nav('/'); return null; }

  const kofiLink = items[0]?.kofiLink || 'https://ko-fi.com';

  const discount = promoData
    ? promoData.discountType === 'percent'
      ? total * promoData.discountValue / 100
      : promoData.discountValue
    : 0;
  const finalTotal = Math.max(0, total - discount);

  const applyPromo = async () => {
    setPromoErr('');
    try {
      const r = await axios.post(`${API_URL}/api/orders/validate-promo`, { code: promo });
      setPromoData(r.data);
    } catch { setPromoErr('Invalid or expired code'); }
  };

  const handlePay = async () => {
    if (!user) return login();
    if (!roblox || roblox.length < 4) return setErr('Roblox username must be at least 4 characters');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return setErr('Please enter a valid email');
    if (!terms) return setErr('You must accept the purchase terms');
    setErr(''); setLoading(true);
    try {
      await axios.post(`${API_URL}/api/orders/create`, {
        items: items.map(i => i._id),
        robloxUsername: roblox, email,
        promoCode: promoData ? promo : null
      });
      clear();
      window.location.href = kofiLink;
    } catch (e) {
      if (e.response?.data?.error === 'not_in_guild') {
        setGuildErr(true);
      } else {
        setErr(e.response?.data?.error || 'Error creating order');
      }
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2rem' }}>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem', marginBottom: '2rem' }}>Checkout</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Left: items */}
        <div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1rem', marginBottom: '1.2rem', color: '#aaa' }}>ORDER SUMMARY</h2>
          {items.map(item => {
            const price = item.discountPrice || item.price;
            const img = item.images?.[0] ? `${API_URL}${item.images[0]}` : null;
            return (
              <div key={item._id} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #1a1a1a' }}>
                {img
                  ? <img src={img} alt={item.title} style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }} />
                  : <div style={{ width: 60, height: 60, borderRadius: 8, background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><span className="material-icons" style={{ color: '#444' }}>hide_image</span></div>
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{item.title}</div>
                  {item.discountPrice && <div style={{ textDecoration: 'line-through', color: '#555', fontSize: 12 }}>€{item.price.toFixed(2)}</div>}
                  <div style={{ color: '#fff', fontSize: 14 }}>€{price.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#888', marginBottom: 6 }}>
              <span>Subtotal</span><span>€{total.toFixed(2)}</span>
            </div>
            {discount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#4ade80', marginBottom: 6 }}>
              <span>Discount ({promo})</span><span>-€{discount.toFixed(2)}</span>
            </div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginTop: '0.8rem', paddingTop: '0.8rem', borderTop: '1px solid #222' }}>
              <span>Total</span><span>€{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right: form */}
        <div>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '3rem 0' }}>
              <p style={{ color: '#888', marginBottom: '1.5rem' }}>Log in with Discord to continue with your purchase.</p>
              <button className="btn btn-white" onClick={login}>
                Log in with Discord
              </button>
            </div>
          ) : (
            <>
              {guildErr && (
                <div className="msg-error" style={{ marginBottom: '1.2rem' }}>
                  You must be in the aurorahub Discord server to complete a purchase.{' '}
                  <a href="https://discord.gg/8dUzp5WGd9" target="_blank" rel="noreferrer" style={{ color: '#f87171', textDecoration: 'underline' }}>Join our server</a>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: '#111', border: '1px solid #1e1e1e', borderRadius: 8, marginBottom: '1.2rem' }}>
                <img src={user.avatar} alt={user.username} style={{ width: 36, height: 36, borderRadius: '50%' }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{user.username}</div>
                  <div style={{ fontSize: 11, color: '#666' }}>Connected via Discord</div>
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Roblox username</label>
                <input className="form-input" value={roblox} onChange={e => setRoblox(e.target.value)} placeholder="At least 4 characters" />
              </div>
              <div className="form-field">
                <label className="form-label">Email address</label>
                <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" />
              </div>
              <div className="form-field">
                <label className="form-label">Promo code (optional)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={promo} onChange={e => setPromo(e.target.value)} placeholder="Enter code" style={{ flex: 1 }} />
                  <button className="btn btn-outline" onClick={applyPromo} style={{ whiteSpace: 'nowrap' }}>Apply</button>
                </div>
                {promoErr && <p style={{ color: '#f87171', fontSize: 12, marginTop: 4 }}>{promoErr}</p>}
                {promoData && <p style={{ color: '#4ade80', fontSize: 12, marginTop: 4 }}>Code applied!</p>}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, margin: '1rem 0' }}>
                <input type="checkbox" id="terms" checked={terms} onChange={e => setTerms(e.target.checked)} style={{ marginTop: 3 }} />
                <label htmlFor="terms" style={{ fontSize: 13, color: '#888', cursor: 'pointer' }}>
                  I have read and accept the{' '}
                  <button onClick={onTerms} style={{ background: 'none', border: 'none', color: '#aaa', textDecoration: 'underline', fontSize: 13, cursor: 'pointer', padding: 0 }}>Purchase Terms</button>
                </label>
              </div>
              {err && <div className="msg-error" style={{ marginBottom: '1rem' }}>{err}</div>}
              <button className="btn btn-white" style={{ width: '100%', justifyContent: 'center', padding: 15, fontSize: 15 }} onClick={handlePay} disabled={loading}>
                {loading ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Continue to payment'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

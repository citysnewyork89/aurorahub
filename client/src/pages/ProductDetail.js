import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function ProductDetail({ onTerms }) {
  const { slug } = useParams();
  const nav = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/products/${slug}`).then(r => setProduct(r.data)).catch(() => nav('/'));
  }, [slug]);

  if (!product) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner" /></div>;

  const imgs = product.images || [];
  const price = product.discountPrice || product.price;
  const hasDiscount = product.discountPercent > 0 || product.discountPrice;

  const share = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fade-in" style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 2rem' }}>
      <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#666', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, marginBottom: '2rem', cursor: 'pointer' }}>
        <span className="material-icons" style={{ fontSize: 18 }}>arrow_back</span> Back
      </button>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem' }}>
        {/* Carousel */}
        <div>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', background: '#111', aspectRatio: '4/3' }}>
            {imgs.length > 0 ? (
              <>
                <img src={`${API_URL}${imgs[imgIndex]}`} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.7))' }} />
                {imgs.length > 1 && (
                  <>
                    <button onClick={() => setImgIndex(i => (i - 1 + imgs.length) % imgs.length)} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 6, padding: 6, display: 'flex' }}>
                      <span className="material-icons">chevron_left</span>
                    </button>
                    <button onClick={() => setImgIndex(i => (i + 1) % imgs.length)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', color: '#fff', borderRadius: 6, padding: 6, display: 'flex' }}>
                      <span className="material-icons">chevron_right</span>
                    </button>
                    <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
                      {imgs.map((_, i) => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i === imgIndex ? '#fff' : '#666' }} />)}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#444' }}>
                <span className="material-icons" style={{ fontSize: 60 }}>hide_image</span>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {product.tag && <span style={{ background: '#fff', color: '#111', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 4, width: 'fit-content' }}>{product.tag}</span>}
          {product.category && <span style={{ color: '#555', fontSize: 12 }}>{product.category}</span>}
          <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', lineHeight: 1.2 }}>{product.title}</h1>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.8 }}>{product.description}</p>
          <div>
            {hasDiscount && <div style={{ textDecoration: 'line-through', color: '#555', fontSize: 14 }}>€{product.price.toFixed(2)}</div>}
            <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '2.5rem', color: '#fff' }}>€{price.toFixed(2)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-white" style={{ justifyContent: 'center', padding: 14, fontSize: 15 }} onClick={() => { add(product); }}>
              <span className="material-icons" style={{ fontSize: 18 }}>add_shopping_cart</span>
              Add to cart
            </button>
            <button className="btn btn-dark" style={{ justifyContent: 'center', padding: 14, fontSize: 15 }} onClick={() => { add(product); nav('/checkout'); }}>
              Buy now
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="https://discord.gg/8dUzp5WGd9" target="_blank" rel="noreferrer" className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.079.11 18.1.12 18.12a19.916 19.916 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>
              Discord
            </a>
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: 'center' }} onClick={share}>
              <span className="material-icons" style={{ fontSize: 16 }}>{copied ? 'check' : 'share'}</span>
              {copied ? 'Copied!' : 'Share'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../context/AuthContext';

export default function CartDrawer() {
  const { items, remove, total, open, setOpen } = useCart();
  const nav = useNavigate();

  return (
    <>
      {open && <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 499 }} onClick={() => setOpen(false)} />}
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <span style={{ fontWeight: 700, fontFamily: 'Poppins' }}>Cart ({items.length})</span>
          <button className="modal-close" onClick={() => setOpen(false)}><span className="material-icons">close</span></button>
        </div>
        <div className="cart-drawer-body">
          {items.length === 0
            ? <p style={{ color: '#555', fontSize: 13, marginTop: '1rem' }}>Your cart is empty.</p>
            : items.map(item => {
              const img = item.images?.[0] ? `${API_URL}${item.images[0]}` : null;
              return (
                <div className="cart-item" key={item._id}>
                  {img ? <img src={img} alt={item.title} /> : <div className="cart-item-no-img"><span className="material-icons" style={{ color: '#444', fontSize: 20 }}>hide_image</span></div>}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer' }} onClick={() => { nav(`/product/${item.slug}`); setOpen(false); }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>€{(item.discountPrice || item.price).toFixed(2)}</div>
                  </div>
                  <button onClick={() => remove(item._id)} style={{ background: 'none', border: 'none', color: '#555' }}>
                    <span className="material-icons" style={{ fontSize: 18 }}>close</span>
                  </button>
                </div>
              );
            })
          }
        </div>
        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontWeight: 600 }}>
              <span>Total</span><span>€{total.toFixed(2)}</span>
            </div>
            <button className="btn btn-white" style={{ width: '100%', justifyContent: 'center' }} onClick={() => { nav('/checkout'); setOpen(false); }}>
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}

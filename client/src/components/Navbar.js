import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ onTerms }) {
  const { user, login, logout } = useAuth();
  const { items, setOpen } = useCart();
  const nav = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => nav('/')}>
        <img src="https://i.ibb.co/gZ445N90/aurorahublogo.png" alt="aurorahub" />
      </div>
      <div className="navbar-right">
        <button className="nav-link" onClick={() => { window.open('https://discord.gg/8dUzp5WGd9', '_blank'); }}>
          Contact us
        </button>
        <button className="cart-btn" onClick={() => setOpen(o => !o)}>
          <span className="material-icons" style={{ fontSize: 22 }}>shopping_cart</span>
          {items.length > 0 && <span className="cart-count">{items.length}</span>}
        </button>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="avatar-btn" onClick={() => nav('/dashboard')}>
              <img src={user.avatar} alt={user.username} />
              <span style={{ fontSize: 13 }}>{user.username}</span>
            </button>
            <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={logout}>
              Log out
            </button>
          </div>
        ) : (
          <button className="btn btn-white" onClick={login}>
            <span className="material-icons" style={{ fontSize: 16 }}>login</span>
            Log in with Discord
          </button>
        )}
      </div>
    </nav>
  );
}

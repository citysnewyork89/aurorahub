import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../context/AuthContext';

export default function AdminPromos() {
  const [promos, setPromos] = useState([]);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ code: '', discountType: 'percent', discountValue: '', applicableTo: 'all', products: [], expiresAt: '', active: true });
  const [loading, setLoading] = useState(false);

  const load = () => {
    axios.get(`${API_URL}/api/promos`, { withCredentials: true }).then(r => setPromos(r.data));
    axios.get(`${API_URL}/api/admin/products`, { withCredentials: true }).then(r => setProducts(r.data));
  };
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setLoading(true);
    try {
      if (editing) await axios.put(`${API_URL}/api/promos/${editing._id}`, form, { withCredentials: true });
      else await axios.post(`${API_URL}/api/promos`, form, { withCredentials: true });
      load(); setShowForm(false); setEditing(null);
      setForm({ code: '', discountType: 'percent', discountValue: '', applicableTo: 'all', products: [], expiresAt: '', active: true });
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  const toggle = (id, active) => axios.put(`${API_URL}/api/promos/${id}`, { active: !active }, { withCredentials: true }).then(load);
  const del = (id) => { if (window.confirm('Delete?')) axios.delete(`${API_URL}/api/promos/${id}`, { withCredentials: true }).then(load); };

  const isExpired = (p) => p.expiresAt && new Date(p.expiresAt) < new Date();

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem' }}>Promotions</h1>
        <button className="btn btn-white" onClick={() => { setEditing(null); setShowForm(true); }}>+ New code</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {promos.map(p => (
          <div key={p._id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>{p.code}</span>
                {isExpired(p)
                  ? <span style={{ background: '#2a1010', color: '#f87171', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>EXPIRED</span>
                  : p.active
                    ? <span style={{ background: '#0a2a0a', color: '#4ade80', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>ACTIVE</span>
                    : <span style={{ background: '#2a2a0a', color: '#facc15', fontSize: 10, padding: '2px 8px', borderRadius: 4 }}>INACTIVE</span>
                }
              </div>
              <div style={{ color: '#666', fontSize: 12, marginTop: 3 }}>
                {p.discountType === 'percent' ? `${p.discountValue}% off` : `€${p.discountValue} off`}
                {p.applicableTo === 'specific' ? ` · specific products` : ' · all products'}
                {p.expiresAt ? ` · expires ${new Date(p.expiresAt).toLocaleDateString('en-GB')}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => { setEditing(p); setForm({ code: p.code, discountType: p.discountType, discountValue: p.discountValue, applicableTo: p.applicableTo, products: p.products?.map(x => x._id || x) || [], expiresAt: p.expiresAt ? p.expiresAt.slice(0, 16) : '', active: p.active }); setShowForm(true); }}>Edit</button>
              {!isExpired(p) && <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12 }} onClick={() => toggle(p._id, p.active)}>{p.active ? 'Deactivate' : 'Activate'}</button>}
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: 12, color: '#f87171', borderColor: '#3a1010' }} onClick={() => del(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700 }}>{editing ? 'Edit Code' : 'New Promo Code'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><span className="material-icons">close</span></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-field">
                <label className="form-label">Code</label>
                <input className="form-input" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="SUMMER2026" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-field">
                  <label className="form-label">Discount type</label>
                  <select className="form-select" value={form.discountType} onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount (€)</option>
                  </select>
                </div>
                <div className="form-field">
                  <label className="form-label">Discount value</label>
                  <input className="form-input" type="number" value={form.discountValue} onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))} placeholder={form.discountType === 'percent' ? '20' : '5'} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Applicable to</label>
                <select className="form-select" value={form.applicableTo} onChange={e => setForm(f => ({ ...f, applicableTo: e.target.value }))}>
                  <option value="all">All products</option>
                  <option value="specific">Specific products</option>
                </select>
              </div>
              {form.applicableTo === 'specific' && (
                <div className="form-field">
                  <label className="form-label">Select products</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', border: '1px solid #1e1e1e', borderRadius: 8, padding: '0.5rem' }}>
                    {products.map(p => (
                      <label key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
                        <input type="checkbox" checked={form.products.includes(p._id)} onChange={e => setForm(f => ({ ...f, products: e.target.checked ? [...f.products, p._id] : f.products.filter(id => id !== p._id) }))} />
                        {p.title}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="form-field">
                <label className="form-label">Expires at (Spain time)</label>
                <input className="form-input" type="datetime-local" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-white" onClick={submit} disabled={loading}>
                  {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Save & create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../context/AuthContext';

export default function AdminSales() {
  const [data, setData] = useState({ orders: [], totalRevenue: 0, totalSales: 0 });
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const load = (s = '') => axios.get(`${API_URL}/api/admin/sales?search=${s}`, { withCredentials: true }).then(r => setData(r.data));
  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem', marginBottom: '1rem' }}>Sales</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '1.5rem' }}>
          <div style={{ color: '#666', fontSize: 12 }}>TOTAL REVENUE</div>
          <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', marginTop: 6 }}>€{data.totalRevenue?.toFixed(2)}</div>
        </div>
        <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '1.5rem' }}>
          <div style={{ color: '#666', fontSize: 12 }}>TOTAL SALES</div>
          <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', marginTop: 6 }}>{data.totalSales}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: '1rem' }}>
        <input className="form-input" placeholder="Search by ID, Discord, Roblox, email..." value={search} onChange={e => setSearch(e.target.value)} style={{ flex: 1 }} />
        <button className="btn btn-outline" onClick={() => load(search)}>Search</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {data.orders?.map(o => (
          <div key={o._id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{o.orderId}</div>
              <div style={{ color: '#666', fontSize: 12 }}>{o.discordUsername} · {o.robloxUsername} · {new Date(o.createdAt).toLocaleString('en-GB')}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ fontWeight: 700 }}>€{o.total?.toFixed(2)}</span>
              <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => setSelected(o)}>Details</button>
            </div>
          </div>
        ))}
      </div>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700 }}>Sale Details</h2>
              <button className="modal-close" onClick={() => setSelected(null)}><span className="material-icons">close</span></button>
            </div>
            <div className="modal-body" style={{ fontSize: 13 }}>
              {[['Order ID', selected.orderId], ['Date', new Date(selected.createdAt).toLocaleString('en-GB')], ['Discord', selected.discordUsername], ['Roblox', selected.robloxUsername], ['Email', selected.email], ['Ko-fi TX', selected.kofiTransactionId || 'N/A'], ['Promo', selected.promoCode || 'None']].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1a1a1a' }}>
                  <span style={{ color: '#666' }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: '1rem' }}>
                {selected.items?.map(i => (
                  <div key={i._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
                    <span>{i.title}</span><span>€{i.finalPrice?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontWeight: 700, fontSize: 16, marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Total</span><span>€{selected.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth, API_URL } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import AdminProducts from './admin/AdminProducts';
import AdminSales from './admin/AdminSales';
import AdminPromos from './admin/AdminPromos';
import AdminSettings from './admin/AdminSettings';

export default function Dashboard() {
  const { user, isAdmin, loading } = useAuth();
  const nav = useNavigate();
  const [tab, setTab] = useState('licenses');
  const [licenses, setLicenses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loadingData, setLoadingData] = useState(false);
  const [dlLoading, setDlLoading] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!loading && !user) nav('/');
  }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    setLoadingData(true);
    if (tab === 'licenses') {
      axios.get(`${API_URL}/api/orders/licenses`).then(r => setLicenses(r.data)).finally(() => setLoadingData(false));
    } else if (tab === 'orders') {
      axios.get(`${API_URL}/api/orders/mine`).then(r => setOrders(r.data)).finally(() => setLoadingData(false));
    } else setLoadingData(false);
  }, [tab, user]);

  const handleDownload = async (productId) => {
    setDlLoading(productId);
    try {
      const r = await axios.post(`${API_URL}/api/download/token`, { productId });
      window.location.href = `/download/${r.data.token}`;
    } catch { alert('Error generating download link'); }
    finally { setDlLoading(null); }
  };

  const filteredLicenses = licenses.filter(l => !search || l.product?.title?.toLowerCase().includes(search.toLowerCase()));

  if (loading || !user) return <div style={{ display: 'flex', justifyContent: 'center', padding: '5rem' }}><div className="spinner" /></div>;

  const adminTabs = isAdmin ? [
    { key: 'admin-products', label: 'Products' },
    { key: 'admin-sales', label: 'Sales' },
    { key: 'admin-promos', label: 'Promotions' },
    { key: 'admin-settings', label: 'Settings' }
  ] : [];

  return (
    <div className="dashboard fade-in">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ marginBottom: '2rem' }}>
          <img src={user.avatar} alt={user.username} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px solid #222', marginBottom: 8 }} />
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user.username}</div>
          <div style={{ color: '#555', fontSize: 12 }}>Discord account</div>
        </div>
        {[
          { key: 'licenses', label: 'My Products' },
          { key: 'orders', label: 'My Orders' },
          ...adminTabs
        ].map(t => (
          <button key={t.key} className={`sidebar-btn ${tab === t.key ? 'active' : ''}`} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="dash-content">
        {/* My Licenses */}
        {tab === 'licenses' && (
          <div>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem', marginBottom: '0.4rem' }}>My Products</h1>
            <p style={{ color: '#666', fontSize: 13, marginBottom: '1.5rem', lineHeight: 1.7 }}>
              Manage your purchased product licenses from the aurorahub online store. If you have any issues downloading or a license is missing, contact an aurorahub support agent.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ color: '#555', fontSize: 13 }}>Showing {filteredLicenses.length} licenses of {licenses.length}</span>
              <input className="form-input" style={{ width: 220 }} placeholder="Search product..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {loadingData ? <div className="spinner" /> : (
              <div className="products-grid">
                {filteredLicenses.map(l => (
                  <div key={l.product?._id} style={{ position: 'relative' }} onClick={() => handleDownload(l.product?._id)}>
                    <ProductCard product={l.product} showPrice={false} />
                    {dlLoading === l.product?._id && (
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
                        <div className="spinner" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Orders */}
        {tab === 'orders' && (
          <div>
            <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem', marginBottom: '0.4rem' }}>My Orders</h1>
            <p style={{ color: '#666', fontSize: 13, marginBottom: '2rem', lineHeight: 1.7 }}>
              Here you can view purchases made through the aurorahub online store. If an order is missing, please contact an aurorahub agent.
            </p>
            {loadingData ? <div className="spinner" /> : orders.length === 0 ? (
              <p style={{ color: '#555' }}>No orders found.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {orders.map(order => (
                  <div key={order._id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '1.2rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{order.orderId}</div>
                      <div style={{ color: '#666', fontSize: 12, marginTop: 3 }}>{new Date(order.createdAt).toLocaleString('en-GB')}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontWeight: 700, fontSize: 16 }}>€{order.total.toFixed(2)}</span>
                      <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: 12 }} onClick={() => setSelectedOrder(order)}>
                        View details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Admin tabs */}
        {tab === 'admin-products' && isAdmin && <AdminProducts />}
        {tab === 'admin-sales' && isAdmin && <AdminSales />}
        {tab === 'admin-promos' && isAdmin && <AdminPromos />}
        {tab === 'admin-settings' && isAdmin && <AdminSettings />}
      </div>

      {/* Order detail modal */}
      {selectedOrder && (
        <div className="modal-backdrop" onClick={() => setSelectedOrder(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700 }}>Order Details</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}><span className="material-icons">close</span></button>
            </div>
            <div className="modal-body" style={{ fontSize: 13 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                  ['Order ID', selectedOrder.orderId],
                  ['Date', new Date(selectedOrder.createdAt).toLocaleString('en-GB')],
                  ['Discord', selectedOrder.discordUsername],
                  ['Roblox', selectedOrder.robloxUsername],
                  ['Email', selectedOrder.email],
                  ['Ko-fi TX', selectedOrder.kofiTransactionId || 'N/A']
                ].map(([k, v]) => (
                  <div key={k}>
                    <div style={{ color: '#555', fontSize: 11, marginBottom: 2 }}>{k}</div>
                    <div style={{ fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '1rem' }}>
                {selectedOrder.items?.map(item => (
                  <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a1a1a', fontSize: 13 }}>
                    <span>{item.title}</span>
                    <span>€{item.finalPrice?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#888' }}><span>Subtotal</span><span>€{selectedOrder.subtotal?.toFixed(2)}</span></div>
              {selectedOrder.discountAmount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4ade80' }}><span>Discount</span><span>-€{selectedOrder.discountAmount?.toFixed(2)}</span></div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: '0.8rem' }}><span>Total paid</span><span>€{selectedOrder.total?.toFixed(2)}</span></div>
              {selectedOrder.pdfPath && (
                <a href={`${API_URL}${selectedOrder.pdfPath}`} target="_blank" rel="noreferrer" className="btn btn-white" style={{ marginTop: '1.5rem', justifyContent: 'center' }}>
                  <span className="material-icons" style={{ fontSize: 16 }}>download</span>
                  Download receipt PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

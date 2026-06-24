import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../context/AuthContext';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', price: '', discountPercent: '', discountPrice: '', kofiLink: '', category: '', tag: '', visibility: 'public', fileType: 'file', fileLink: '' });
  const [imageFiles, setImageFiles] = useState([]);
  const [productFiles, setProductFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = () => axios.get(`${API_URL}/api/admin/products`, { withCredentials: true }).then(r => setProducts(r.data));
  useEffect(() => { load(); }, []);

  const submit = async () => {
    setLoading(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    imageFiles.forEach(f => fd.append('images', f));
    productFiles.forEach(f => fd.append('files', f));
    try {
      if (editing) await axios.put(`${API_URL}/api/products/${editing._id}`, fd, { withCredentials: true });
      else await axios.post(`${API_URL}/api/products`, fd, { withCredentials: true });
      await load(); setShowForm(false); setEditing(null); resetForm();
    } catch (e) { alert(e.response?.data?.error || 'Error'); }
    setLoading(false);
  };

  const resetForm = () => setForm({ title: '', description: '', price: '', discountPercent: '', discountPrice: '', kofiLink: '', category: '', tag: '', visibility: 'public', fileType: 'file', fileLink: '' });

  const edit = (p) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, price: p.price, discountPercent: p.discountPercent || '', discountPrice: p.discountPrice || '', kofiLink: p.kofiLink || '', category: p.category, tag: p.tag || '', visibility: p.visibility, fileType: p.fileType || 'file', fileLink: p.fileLink || '' });
    setShowForm(true);
  };

  const del = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await axios.delete(`${API_URL}/api/products/${id}`, { withCredentials: true });
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem' }}>Products</h1>
        <button className="btn btn-white" onClick={() => { setEditing(null); resetForm(); setShowForm(true); }}>+ New product</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {products.map(p => (
          <div key={p._id} style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 10, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600 }}>{p.title}</div>
              <div style={{ color: '#666', fontSize: 12 }}>€{p.price} · {p.category} · <span style={{ color: p.visibility === 'public' ? '#4ade80' : '#f87171' }}>{p.visibility}</span></div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }} onClick={() => edit(p)}>Edit</button>
              <a href={`/product/${p.slug}`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12 }}>View</a>
              <button className="btn btn-outline" style={{ padding: '6px 14px', fontSize: 12, color: '#f87171', borderColor: '#3a1010' }} onClick={() => del(p._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="modal-backdrop" onClick={() => setShowForm(false)}>
          <div className="modal-box" style={{ maxWidth: 700 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700 }}>{editing ? 'Edit Product' : 'New Product'}</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}><span className="material-icons">close</span></button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[['title', 'Title', 'text'], ['price', 'Price (€)', 'number'], ['discountPercent', 'Discount %', 'number'], ['discountPrice', 'Discount price (€)', 'number'], ['kofiLink', 'Ko-fi link', 'text'], ['category', 'Category', 'text'], ['tag', 'Tag (e.g. NEW, -20%)', 'text']].map(([key, label, type]) => (
                <div className="form-field" key={key} style={{ gridColumn: key === 'title' ? 'span 2' : undefined }}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
                </div>
              ))}
              <div className="form-field" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Description</label>
                <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Visibility</label>
                <select className="form-select" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: e.target.value }))}>
                  <option value="public">Public</option>
                  <option value="unlisted">Unlisted (link only)</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Delivery type</label>
                <select className="form-select" value={form.fileType} onChange={e => setForm(f => ({ ...f, fileType: e.target.value }))}>
                  <option value="file">File upload</option>
                  <option value="link">Link</option>
                </select>
              </div>
              {form.fileType === 'link' ? (
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product link</label>
                  <input className="form-input" value={form.fileLink} onChange={e => setForm(f => ({ ...f, fileLink: e.target.value }))} />
                </div>
              ) : (
                <div className="form-field" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product file(s)</label>
                  <input type="file" multiple onChange={e => setProductFiles(Array.from(e.target.files))} style={{ color: '#aaa', fontSize: 13 }} />
                </div>
              )}
              <div className="form-field" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Product images</label>
                <input type="file" multiple accept="image/*" onChange={e => setImageFiles(Array.from(e.target.files))} style={{ color: '#aaa', fontSize: 13 }} />
              </div>
              <div style={{ gridColumn: 'span 2', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: '0.5rem' }}>
                <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-white" onClick={submit} disabled={loading}>
                  {loading ? <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> : 'Save & publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

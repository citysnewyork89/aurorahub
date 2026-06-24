import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../context/AuthContext';

function RichEditor({ value, onChange }) {
  const ref = useRef();
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = value || '';
  }, []);
  const exec = (cmd, val = null) => { document.execCommand(cmd, false, val); ref.current.focus(); };
  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
        {[['Bold', 'bold', 'B'], ['Italic', 'italic', 'I'], ['Underline', 'underline', 'U']].map(([t, c, l]) => (
          <button key={c} type="button" onClick={() => exec(c)} title={t} style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{l}</button>
        ))}
        <button type="button" onClick={() => exec('insertUnorderedList')} style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>• List</button>
        <button type="button" onClick={() => exec('insertOrderedList')} style={{ background: '#fff', color: '#111', border: 'none', borderRadius: 4, padding: '4px 10px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>1. List</button>
      </div>
      <div ref={ref} contentEditable suppressContentEditableWarning
        onInput={() => onChange(ref.current.innerHTML)}
        style={{ minHeight: 120, background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 8, padding: '12px 14px', color: '#f5f5f5', fontSize: 14, outline: 'none', lineHeight: 1.7 }}
      />
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [faqForm, setFaqForm] = useState({ title: '', content: '' });
  const [editingFaq, setEditingFaq] = useState(null);
  const [showFaqForm, setShowFaqForm] = useState(false);
  const [saved, setSaved] = useState(false);
  const [statusBar, setStatusBar] = useState({ text: '', link: '' });

  const load = () => {
    axios.get(`${API_URL}/api/admin/settings`, { withCredentials: true }).then(r => {
      setSettings(r.data);
      setStatusBar({ text: r.data.statusBarText || '', link: r.data.statusBarLink || '' });
    });
    axios.get(`${API_URL}/api/admin/faqs`).then(r => setFaqs(r.data));
  };
  useEffect(() => { load(); }, []);

  const saveSettings = async () => {
    await axios.put(`${API_URL}/api/admin/settings`, settings, { withCredentials: true });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const saveStatusBar = async (active) => {
    await axios.put(`${API_URL}/api/admin/settings`, {
      statusBarActive: active,
      statusBarText: statusBar.text,
      statusBarLink: statusBar.link
    }, { withCredentials: true });
    load();
  };

  const saveFaq = async () => {
    if (editingFaq) await axios.put(`${API_URL}/api/admin/faqs/${editingFaq._id}`, faqForm, { withCredentials: true });
    else await axios.post(`${API_URL}/api/admin/faqs`, faqForm, { withCredentials: true });
    setShowFaqForm(false); setEditingFaq(null); setFaqForm({ title: '', content: '' }); load();
  };

  const delFaq = (id) => { if (window.confirm('Delete?')) axios.delete(`${API_URL}/api/admin/faqs/${id}`, { withCredentials: true }).then(load); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <h1 style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '1.8rem' }}>Settings</h1>

      {/* Bot settings */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.2rem' }}>Bot Configuration</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="form-field">
            <label className="form-label">Bot activity text (e.g. "Your Products")</label>
            <input className="form-input" value={settings.botActivity || ''} onChange={e => setSettings(s => ({ ...s, botActivity: e.target.value }))} placeholder="Your Products" />
          </div>
          <div className="form-field">
            <label className="form-label">Embed color (hex, e.g. #000000)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input className="form-input" value={settings.botEmbedColor || '#000000'} onChange={e => setSettings(s => ({ ...s, botEmbedColor: e.target.value }))} placeholder="#000000" />
              <input type="color" value={settings.botEmbedColor || '#000000'} onChange={e => setSettings(s => ({ ...s, botEmbedColor: e.target.value }))} style={{ width: 44, height: 44, borderRadius: 8, border: '1px solid #333', background: 'none', cursor: 'pointer', padding: 2 }} />
            </div>
          </div>
        </div>
        <button className="btn btn-white" onClick={saveSettings} style={{ marginTop: '0.5rem' }}>
          {saved ? '✓ Saved' : 'Save settings'}
        </button>
      </div>

      {/* Status bar */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1.5rem' }}>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.2rem' }}>Status Bar</h2>
        {settings.statusBarActive && (
          <div style={{ background: '#fff', color: '#111', padding: '8px 16px', borderRadius: 6, marginBottom: '1rem', fontSize: 13 }}>
            Preview: {statusBar.text} {statusBar.link && <a href={statusBar.link} style={{ color: '#111', textDecoration: 'underline' }}>Link</a>}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-field">
            <label className="form-label">Status bar text</label>
            <input className="form-input" value={statusBar.text} onChange={e => setStatusBar(s => ({ ...s, text: e.target.value }))} placeholder="Summer sale — 20% off all products!" />
          </div>
          <div className="form-field">
            <label className="form-label">Status bar link (optional)</label>
            <input className="form-input" value={statusBar.link} onChange={e => setStatusBar(s => ({ ...s, link: e.target.value }))} placeholder="https://..." />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-white" onClick={() => saveStatusBar(true)}>Activate</button>
            <button className="btn btn-outline" onClick={() => saveStatusBar(false)}>Deactivate</button>
          </div>
        </div>
      </div>

      {/* FAQs */}
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: 12, padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.1rem' }}>FAQ Questions</h2>
          <button className="btn btn-white" onClick={() => { setEditingFaq(null); setFaqForm({ title: '', content: '' }); setShowFaqForm(true); }}>+ New FAQ</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map(faq => (
            <div key={faq._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#0d0d0d', border: '1px solid #1e1e1e', borderRadius: 8 }}>
              <span style={{ fontSize: 14 }}>{faq.title}</span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12 }} onClick={() => { setEditingFaq(faq); setFaqForm({ title: faq.title, content: faq.content }); setShowFaqForm(true); }}>Edit</button>
                <button className="btn btn-outline" style={{ padding: '5px 12px', fontSize: 12, color: '#f87171', borderColor: '#3a1010' }} onClick={() => delFaq(faq._id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showFaqForm && (
        <div className="modal-backdrop" onClick={() => setShowFaqForm(false)}>
          <div className="modal-box" style={{ maxWidth: 680 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700 }}>{editingFaq ? 'Edit FAQ' : 'New FAQ'}</h2>
              <button className="modal-close" onClick={() => setShowFaqForm(false)}><span className="material-icons">close</span></button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-field">
                <label className="form-label">Title</label>
                <input className="form-input" value={faqForm.title} onChange={e => setFaqForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-field">
                <label className="form-label">Content</label>
                <RichEditor value={faqForm.content} onChange={v => setFaqForm(f => ({ ...f, content: v }))} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-outline" onClick={() => setShowFaqForm(false)}>Cancel</button>
                <button className="btn btn-white" onClick={saveFaq}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function Home({ onTerms }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  useEffect(() => {
    axios.get(`${API_URL}/api/products`).then(r => setProducts(r.data)).catch(() => {});
    axios.get(`${API_URL}/api/products/categories`).then(r => setCategories(r.data)).catch(() => {});
    axios.get(`${API_URL}/api/admin/faqs`).then(r => setFaqs(r.data)).catch(() => {});
  }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !search || p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q);
    const matchCat = category === 'all' || p.category === category;
    return matchSearch && matchCat;
  });

  const visibleFaqs = showAllFaqs ? faqs : faqs.slice(0, 5);

  return (
    <div className="fade-in">
      {/* Hero */}
      <div style={{ padding: '6rem 2rem 3rem', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '3rem', lineHeight: 1.1, marginBottom: '1rem' }}>
          Our Products
        </div>
        <p style={{ color: '#666', fontSize: 16, maxWidth: 540 }}>
          Browse our products, choose what you like, pay securely and receive it instantly through our automated system.
        </p>
      </div>

      {/* Search + filter */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <div style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.4rem', textAlign: 'center', marginBottom: '0.4rem' }}>
          Search our products
        </div>
        <p style={{ color: '#555', textAlign: 'center', fontSize: 14, marginBottom: '1.5rem' }}>
          Type the name of the product you're looking for and our search system will find it for you.
        </p>
        <input
          className="search-bar"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder=""
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.2rem' }}>
          <span style={{ color: '#555', fontSize: 13 }}>Showing {filtered.length} of {products.length} products</span>
          <div style={{ position: 'relative' }}>
            <select className="form-select" style={{ width: 'auto', paddingRight: 32, minWidth: 160 }} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className="material-icons" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: 18, color: '#666' }}>expand_more</span>
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem 4rem' }}>
        {filtered.length === 0
          ? <p style={{ color: '#555', textAlign: 'center', padding: '3rem 0' }}>No products found.</p>
          : <div className="products-grid">
            {filtered.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        }
      </div>

      {/* FAQ section */}
      {faqs.length > 0 && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem 5rem' }}>
          <div style={{ fontFamily: 'Poppins', fontWeight: 900, fontSize: '2rem', marginBottom: '0.4rem' }}>FAQ Questions</div>
          <p style={{ color: '#666', fontSize: 14, marginBottom: '2rem' }}>
            Find answers to your questions before contacting an aurorahub agent.
          </p>
          {visibleFaqs.map((faq, i) => (
            <div className="faq-item" key={faq._id}>
              <button className="faq-header" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span>{faq.title}</span>
                <span className="material-icons" style={{ fontSize: 20, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(90deg)' : 'none' }}>chevron_right</span>
              </button>
              {openFaq === i && (
                <div className="faq-body" dangerouslySetInnerHTML={{ __html: faq.content }} />
              )}
            </div>
          ))}
          {faqs.length > 5 && (
            <button onClick={() => setShowAllFaqs(!showAllFaqs)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, marginTop: '1rem', textDecoration: 'underline', cursor: 'pointer' }}>
              {showAllFaqs ? 'Show less' : 'See more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

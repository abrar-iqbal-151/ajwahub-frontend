import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import '../css/Premium.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Premium() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const user = JSON.parse(localStorage.getItem('ajwaHub_currentUser') || 'null');

  useEffect(() => {
    fetch(`${API}/premium-products`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (product) => {
    if (!user) { setShowLoginModal(true); return; }
    const cart = JSON.parse(localStorage.getItem('ajwaHub_cart') || '[]');
    const existing = cart.find(i => i.id === product._id);
    const updated = existing
      ? cart.map(i => i.id === product._id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { id: product._id, name: product.name, price: product.price, image: product.image, weight: product.weight, quantity: 1 }];
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updated));
    navigate('/payment');
  };

  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  const featured = products.filter(p => p.featured);

  const renderStars = (r) => [...Array(5)].map((_, i) => (
    <span key={i} style={{ color: i < Math.floor(r) ? '#fbbf24' : '#374151', fontSize: '14px' }}>★</span>
  ));

  return (
    <div className="premium-page">
      <Navbar />

      {/* HERO */}
      <div className="premium-hero">
        <div className="premium-hero-content">
          <span className="premium-hero-badge">👑 Exclusive Collection</span>
          <h1>Premium <span>Products</span></h1>
          <p>Handpicked finest dates & dry fruits — crafted for those who demand the best</p>
          <div className="premium-hero-stats">
            <div><h3>100%</h3><p>Pure & Natural</p></div>
            <div><h3>Premium</h3><p>Quality</p></div>
            <div><h3>Fresh</h3><p>Harvested</p></div>
          </div>
        </div>
      </div>

      {/* FEATURED */}
      {featured.length > 0 && (
        <div className="premium-featured-section">
          <div className="premium-section-header">
            <span className="premium-badge">⭐ Featured</span>
            <h2>Top Picks</h2>
          </div>
          <div className="premium-featured-grid">
            {featured.slice(0, 3).map(p => (
              <div key={p._id} className="premium-featured-card" onClick={() => { setSelected(p); setShowModal(true); }}>
                <div className="premium-featured-img">
                  <img src={p.image} alt={p.name} onError={e => e.target.style.display='none'} />
                  <span className="premium-featured-badge">{p.badge}</span>
                </div>
                <div className="premium-featured-info">
                  <h3>{p.name}</h3>
                  <p>{p.description?.substring(0, 80)}...</p>
                  <div className="premium-featured-footer">
                    <div>
                      <span className="premium-price">PKR {p.price?.toLocaleString()}</span>
                      {p.originalPrice > p.price && <span className="premium-original">PKR {p.originalPrice?.toLocaleString()}</span>}
                    </div>
                    <button className="premium-add-btn" onClick={e => { e.stopPropagation(); addToCart(p); }}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ALL PRODUCTS */}
      <div className="premium-all-section">
        <div className="premium-section-header">
          <h2>All Premium Products</h2>
          <div className="premium-filters">
            {['all', 'dates', 'dry'].map(f => (
              <button key={f} className={`premium-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : f === 'dates' ? '🌴 Dates' : '🥜 Dry Fruits'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="premium-loading">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="premium-empty">
            <p>No premium products available yet.</p>
          </div>
        ) : (
          <div className="premium-grid">
            {filtered.map(p => (
              <div key={p._id} className="premium-card" onClick={() => { setSelected(p); setShowModal(true); }}>
                <div className="premium-card-img">
                  <img src={p.image} alt={p.name} onError={e => e.target.style.display='none'} />
                  <span className="premium-card-badge">{p.badge}</span>
                  {!p.stock && <div className="premium-out-overlay">Out of Stock</div>}
                </div>
                <div className="premium-card-body">
                  <h4>{p.name}</h4>
                  <p>{p.description?.substring(0, 60)}...</p>
                  <div className="premium-card-stars">{renderStars(p.rating)}</div>
                  <div className="premium-card-footer">
                    <div>
                      <span className="premium-price">PKR {p.price?.toLocaleString()}</span>
                      {p.originalPrice > p.price && (
                        <span className="premium-discount">
                          {Math.round((1 - p.price / p.originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>
                    <button className="premium-add-btn" disabled={!p.stock}
                      onClick={e => { e.stopPropagation(); addToCart(p); }}>
                      {p.stock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {showModal && selected && (
        <div className="premium-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="premium-modal" onClick={e => e.stopPropagation()}>
            <button className="premium-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <div className="premium-modal-content">
              <div className="premium-modal-img">
                <img src={selected.image} alt={selected.name} onError={e => e.target.style.display='none'} />
                <span className="premium-card-badge">{selected.badge}</span>
              </div>
              <div className="premium-modal-info">
                <h2>{selected.name}</h2>
                <div className="premium-card-stars">{renderStars(selected.rating)} <span style={{ color: '#9ca3af', fontSize: '13px' }}>({selected.rating})</span></div>
                <p>{selected.description}</p>
                <div style={{ display: 'flex', gap: '12px', margin: '12px 0' }}>
                  <span style={{ background: 'rgba(251,146,60,0.1)', color: '#fb923c', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>⚖️ {selected.weight}</span>
                  <span style={{ background: selected.stock ? 'rgba(74,222,128,0.1)' : 'rgba(239,68,68,0.1)', color: selected.stock ? '#4ade80' : '#f87171', padding: '4px 12px', borderRadius: '20px', fontSize: '13px' }}>
                    {selected.stock ? '✅ In Stock' : '❌ Out of Stock'}
                  </span>
                </div>
                <div className="premium-modal-price">
                  <span className="premium-price" style={{ fontSize: '24px' }}>PKR {selected.price?.toLocaleString()}</span>
                  {selected.originalPrice > selected.price && <span className="premium-original">PKR {selected.originalPrice?.toLocaleString()}</span>}
                </div>
                <button className="premium-add-btn" style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '16px' }}
                  disabled={!selected.stock} onClick={() => { setShowModal(false); addToCart(selected); }}>
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="premium-modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="premium-modal" style={{ maxWidth: '380px' }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <h3 style={{ color: '#fb923c', marginBottom: '8px' }}>Login Required</h3>
              <p style={{ color: '#9ca3af', marginBottom: '20px' }}>Please login to add items to cart</p>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="premium-add-btn" style={{ flex: 1 }} onClick={() => navigate('/login')}>Login</button>
                <button className="premium-add-btn" style={{ flex: 1, background: 'rgba(255,255,255,0.08)' }} onClick={() => navigate('/signup')}>Sign Up</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="login-footer">
        <div className="login-footer-inner">
          <div className="login-footer-brand">
            <img src="/LOGO.jpeg" alt="AjwaHub" className="login-footer-logo" />
            <span className="login-footer-name">AjwaHub</span>
          </div>
          <div className="login-footer-links">
            <a href="/about">About Us</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms</a>
            <a href="/contact">Contact</a>
          </div>
        </div>
        <div className="login-footer-bottom">&copy; 2025 AjwaHub. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Premium;

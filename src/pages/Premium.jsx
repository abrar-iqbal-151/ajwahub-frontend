import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaTrash } from 'react-icons/fa';
import Navbar from './Navbar';
import '../css/Premium.css';
import '../css/Products.css';
import Footer from '../components/Footer';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Premium() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState({ premiumFeaturedTitle: '⭐ Featured', premiumFeaturedSubtitle: 'Top Picks', premiumSectionTitle: 'All Premium Products' });
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('ajwaHub_cart') || '[]'));
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const cartQuantity = cart.reduce((t, i) => t + i.quantity, 0);
  const user = JSON.parse(localStorage.getItem('ajwaHub_currentUser') || 'null');
  
  const [productRatings, setProductRatings] = useState({ average: 4.9, total: 120 });
  const [modalHoverStar, setModalHoverStar] = useState(0);
  const [modalRatingStatus, setModalRatingStatus] = useState(null);

  const handleModalRate = async (star) => {
    if (modalRatingStatus === 'success') return;
    setModalRatingStatus('submitting');
    
    try {
      await fetch(`${API}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selected?.id || selected?._id || 'unknown',
          productName: selected?.name || 'Unknown Product',
          rating: star,
          reviewText: ''
        })
      });

      const stored = JSON.parse(localStorage.getItem('ajwa_product_ratings') || '[]');
      stored.push({ id: Date.now(), productId: selected?.id || selected?._id || 'unknown', rating: star, reviewText: '', date: new Date().toISOString() });
      localStorage.setItem('ajwa_product_ratings', JSON.stringify(stored));
      
      const sum = stored.reduce((acc, curr) => acc + curr.rating, 0);
      const baseScore = 4.9 * 120;
      const newScore = ((baseScore + sum) / (120 + stored.length)).toFixed(1);
      setProductRatings({ average: newScore, total: 120 + stored.length });
      
      setModalRatingStatus('success');
      setTimeout(() => setModalRatingStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setModalRatingStatus(null);
    }
  };

  useEffect(() => {
    if (selected) {
      const stored = JSON.parse(localStorage.getItem('ajwa_product_ratings') || '[]');
      if (stored.length > 0) {
        const sum = stored.reduce((acc, curr) => acc + curr.rating, 0);
        const baseScore = 4.9 * 120;
        const newScore = ((baseScore + sum) / (120 + stored.length)).toFixed(1);
        setProductRatings({ average: newScore, total: 120 + stored.length });
      }
    }
  }, [selected]);

  useEffect(() => {
    fetch(`${API}/premium-products`)
      .then(r => r.json())
      .then(d => {
        const processed = (d.products || []).map(p => {
          p.id = p._id; // Normalize id to _id so wishlist matches index schema perfectly!
          if (!p.weightOptions || p.weightOptions.length === 0) {
            const base = p.price;
            p.weightOptions = [
              { label: '1kg Special Box', price: base, savings: 0 },
              { label: '500g Mini Box', price: Math.round(base * 0.55), savings: 0 },
              { label: '2kg Briefcase Box', price: (base * 2) - 500, savings: 500 },
              { label: '3kg Saudi Box', price: (base * 3) - 700, savings: 700 },
              { label: '5kg Family Carton', price: (base * 5) - 1500, savings: 1500 }
            ];
          }
          return p;
        });
        setProducts(processed);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
    fetch(`${API}/settings`)
      .then(r => r.json())
      .then(d => { if (d.settings) setSettings(s => ({ ...s, ...d.settings })); })
      .catch(() => { });

    // Fetch Wishlist Items
    const currentUser = JSON.parse(localStorage.getItem('ajwaHub_currentUser') || 'null');
    if (currentUser?.email) {
      fetch(`${API}/wishlist/${currentUser.email}`)
        .then(r => r.json())
        .then(d => {
          setWishlist((d.products || []).map(p => p.id));
          localStorage.setItem('ajwaHub_wishlist', JSON.stringify(d.products || []));
        })
        .catch(() => {
          const saved = JSON.parse(localStorage.getItem('ajwaHub_wishlist') || '[]');
          setWishlist(saved.map(p => p.id));
        });
    }
  }, []);

  const addToCart = (product, weightData = null) => {
    if (!user) { setShowLoginModal(true); return; }

    const price = weightData ? weightData.price : product.price;
    const weight = weightData ? weightData.label : product.weight;
    const cartId = weightData ? `${product._id}-${weightData.label}` : product._id;

    const existing = cart.find(i => i.id === cartId);
    const updated = existing
      ? cart.map(i => i.id === cartId ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, {
        id: cartId,
        productId: product._id,
        name: product.name,
        price: price,
        image: product.image,
        weight: weight,
        quantity: 1
      }];
    setCart(updated);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updated));
    setShowCartDropdown(true);
  };

  const removeFromCart = (id) => {
    const updated = cart.filter(i => i.id !== id);
    setCart(updated);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updated));
  };

  const toggleWishlist = (productId) => {
    if (!user) { setShowLoginModal(true); return; }
    const product = products.find(p => p.id === productId || p._id === productId);
    const savedWishlist = JSON.parse(localStorage.getItem('ajwaHub_wishlist') || '[]');
    let updatedWishlist, updatedWishlistProducts;
    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(id => id !== productId);
      updatedWishlistProducts = savedWishlist.filter(item => item.id !== productId);
    } else {
      updatedWishlist = [...wishlist, productId];
      updatedWishlistProducts = [...savedWishlist, product];
    }
    setWishlist(updatedWishlist);
    localStorage.setItem('ajwaHub_wishlist', JSON.stringify(updatedWishlistProducts));
    if (user?.email) {
      fetch(`${API}/wishlist/${user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedWishlistProducts })
      }).catch(() => { });
    }
  };

  const filtered = products.filter(p =>
    (!filter || p.category === filter) &&
    p.name?.toLowerCase().includes(search.toLowerCase())
  );
  const featured = products.filter(p => p.featured);

  const renderStars = (r) => [...Array(5)].map((_, i) => (
    <span key={i} style={{ color: i < Math.floor(r) ? '#fbbf24' : '#374151', fontSize: '14px' }}>★</span>
  ));

  return (
    <div className="premium-page">
      {/* 3D Background */}
      <div className="desc-bg-3d">
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" />
        <div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" />
        <div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_, i) => <div key={i} className="desc-bg-line" style={{ animationDelay: `${i * 0.4}s` }} />)}
        </div>
      </div>
      <Navbar />

      {/* HERO */}
      <div className="premium-hero">
        <div className="premium-hero-content">
          <span className="premium-hero-badge">👑 Exclusive Collection</span>
          <h1>Premium <span>Products</span></h1>
          <div className="premium-hero-stats">
            <div><h3>100%</h3><p>Pure & Natural</p></div>
            <div><h3>Premium</h3><p>Quality</p></div>
            <div><h3>Fresh</h3><p>Harvested</p></div>
          </div>
        </div>
      </div>



      {/* ALL PRODUCTS */}
      <div className="premium-all-section">

        <div className="products-toolbar">
          <div className="products-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="products-filters">
            <select value={filter} onChange={e => setFilter(e.target.value)}>
              <option value="">All</option>
              <option value="fruits">Fruits</option>
              <option value="dry_dates">Dry Dates</option>
            </select>

          </div>
          <div className="cart-btn-wrap">
            <div className="cart-count-frame" onClick={() => setShowCartDropdown(!showCartDropdown)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="cart-svg-icon">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className="cart-count">{cartQuantity}</span>
            </div>
            {showCartDropdown && cart.length > 0 && (
              <div className="cart-dropdown">
                <div className="cart-dropdown-header">
                  <h4>Cart Items</h4>
                  <button className="close-dropdown" onClick={() => setShowCartDropdown(false)}>✕</button>
                </div>
                <div className="cart-items">
                  {cart.map(item => (
                    <div key={item.id} className="cart-item">
                      <img src={item.image} alt={item.name} className="cart-item-image" />
                      <div className="cart-item-info">
                        <h5>{item.name}</h5>
                        <p>PKR {item.price?.toLocaleString()} x {item.quantity}</p>
                      </div>
                      <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}><FaTrash /></button>
                    </div>
                  ))}
                </div>
                <div className="cart-dropdown-footer">
                  <button className="checkout-btn" onClick={() => { setShowCartDropdown(false); navigate('/payment'); }}>Checkout</button>
                </div>
              </div>
            )}
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
                  <img src={p.image} alt={p.name} onError={e => e.target.style.display = 'none'} />
                  <span className="premium-card-badge">{p.badge}</span>
                  {!p.stock && <div className="premium-out-overlay">Out of Stock</div>}
                  
                  <button
                    className={`wishlist-icon ${wishlist.includes(p.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist(p.id);
                    }}
                    title="Add to Wishlist"
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(0,0,0,0.65)',
                      border: '1px solid rgba(197, 160, 89, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      zIndex: '10',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    {wishlist.includes(p.id) ? (
                      <FaHeart color="#dc2626" size={16} />
                    ) : (
                      <FaRegHeart color="#c5a059" size={16} />
                    )}
                  </button>
                </div>
                <div className="premium-card-body">
                  <div className="premium-card-header">
                    <h4>{p.name?.substring(0, 15)}</h4>
                    {p.arabicName && <h4 className="premium-arabic">{p.arabicName}</h4>}
                  </div>

                  <button className="premium-view-btn" onClick={(e) => {
                    e.stopPropagation();
                    setSelected(p);
                    setSelectedWeight(p.weightOptions?.[0] || null);
                    setShowModal(true);
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {showModal && selected && (
        <div className="product-details-overlay" onClick={() => setShowModal(false)}>
          <div className="product-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(false)}>✕</button>
            <div className="product-details-content">
              <div className="pd-left">
                <div className="pd-image-wrapper">
                  <img src={selected.image} alt={selected.name} onError={e => e.target.style.display = 'none'} />
                </div>
              </div>
              <div className="pd-right">
                <div className="pd-header-row">
                  <h2 className="pd-title">{selected.name}</h2>
                  {selected.arabicName && <h2 className="pd-arabic">{selected.arabicName}</h2>}
                </div>

                <div className="pd-price">
                  PKR {(selectedWeight ? selectedWeight.price : selected.price)?.toLocaleString()}
                </div>

                <div className="pd-storage-note">
                  {selected.description}
                </div>

                <div className="pd-rating-stock-row" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="pd-rating" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ color: '#fbbf24', fontSize: '1.3rem', letterSpacing: '2px', display: 'flex', cursor: 'pointer' }} title="Click to rate this product">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          style={{ 
                            color: star <= (modalHoverStar || Math.round(productRatings.average)) ? '#fbbf24' : '#e5e7eb',
                            transition: 'color 0.2s, transform 0.2s',
                            transform: star <= modalHoverStar ? 'scale(1.15)' : 'scale(1)'
                          }}
                          onMouseEnter={() => setModalHoverStar(star)}
                          onMouseLeave={() => setModalHoverStar(0)}
                          onClick={() => handleModalRate(star)}
                        >★</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '5px', fontWeight: '500' }}>
                        {productRatings.average} ({productRatings.total}+ Reviews)
                      </span>
                      {modalRatingStatus === 'success' && (
                        <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '5px', fontWeight: '700', animation: 'fadeIn 0.3s ease' }}>⭐ Rated!</span>
                      )}
                      {modalRatingStatus === 'submitting' && (
                        <span style={{ color: '#c5a059', fontSize: '0.75rem', marginLeft: '5px' }}>Saving...</span>
                      )}
                    </div>
                  </div>
                  <div className="pd-stock-status" style={{ margin: 0 }}>
                    <span className="stock-dot"></span> {selected.stock ? 'In Stock' : 'Out of Stock'}
                  </div>
                </div>

                {selected.weightOptions && selected.weightOptions.length > 0 && (
                  <div className="pd-weight-selection">
                    <p className="weight-label">Weight: <span>{selectedWeight?.label || selected.weight}</span></p>
                    <div className="weight-options">
                      {selected.weightOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          className={`weight-opt ${selectedWeight?.label === opt.label ? 'active' : ''}`}
                          onClick={() => setSelectedWeight(opt)}
                        >
                          {opt.label} {opt.savings > 0 && <span>(Save PKR {opt.savings})</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  className="pd-add-to-cart-btn"
                  disabled={!selected.stock}
                  onClick={() => { setShowModal(false); addToCart(selected, selectedWeight); }}
                >
                  Add to Cart
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

      <Footer />
    </div>
  );
}

export default Premium;



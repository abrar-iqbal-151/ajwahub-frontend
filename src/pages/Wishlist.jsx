import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import '../css/Wishlist.css';
import '../css/Products.css';
import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';
import Footer from '../components/Footer';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Wishlist() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [cartDeleteConfirm, setCartDeleteConfirm] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
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
          productId: selectedProduct?.id || 'unknown',
          productName: selectedProduct?.name || 'Unknown Product',
          rating: star,
          reviewText: ''
        })
      });

      const stored = JSON.parse(localStorage.getItem('ajwa_product_ratings') || '[]');
      stored.push({ id: Date.now(), productId: selectedProduct?.id || 'unknown', rating: star, reviewText: '', date: new Date().toISOString() });
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
    if (selectedProduct) {
      const stored = JSON.parse(localStorage.getItem('ajwa_product_ratings') || '[]');
      if (stored.length > 0) {
        const sum = stored.reduce((acc, curr) => acc + curr.rating, 0);
        const baseScore = 4.9 * 120;
        const newScore = ((baseScore + sum) / (120 + stored.length)).toFixed(1);
        setProductRatings({ average: newScore, total: 120 + stored.length });
      }
    }
  }, [selectedProduct]);

  const getPriceForWeight = (basePrice, weight) => {
    if (!weight) return basePrice;
    const w = weight.toLowerCase().replace(/\s+/g, '');
    if (w.includes('500g')) {
      if (basePrice === 4300) return 2300;
      return Math.round(basePrice * 0.535);
    }
    if (w.includes('2kg')) {
      if (basePrice === 4300) return 8400;
      return basePrice * 2 - 200;
    }
    if (w.includes('3kg')) {
      if (basePrice === 4300) return 12200;
      return basePrice * 3 - 700;
    }
    if (w.includes('5kg')) {
      if (basePrice === 4300) return 21000;
      return basePrice * 5 - 500;
    }
    return basePrice;
  };

  const getDisplayPrice = (product, weightLabel) => {
    if (!weightLabel) return null;
    const opt = (product.weights || []).find(w => w.label === weightLabel);
    if (opt && opt.savings) {
      const cleanSavings = opt.savings.replace(/,/g, '');
      const match = cleanSavings.match(/\d+/);
      if (match) {
        return parseInt(match[0], 10);
      }
    }
    return getPriceForWeight(product.price, weightLabel);
  };

  const arabicMap = {
    'Ajwa': 'عجوة', 'Amber': 'عنبر', 'Safawi': 'صفاوي', 'Mabroom': 'مبروم',
    'Sukari': 'سكري', 'Sagai': 'صقعي', 'Kalmi': 'كالمي', 'Medjool': 'مجدول'
  };

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      fetch(`${API}/wishlist/${u.email}`)
        .then(r => r.json())
        .then(d => {
          setWishlistItems(d.products || []);
          localStorage.setItem('ajwaHub_wishlist', JSON.stringify(d.products || []));
        })
        .catch(() => {
          const saved = JSON.parse(localStorage.getItem('ajwaHub_wishlist') || '[]');
          setWishlistItems(saved);
        });
    }
    const savedCart = JSON.parse(localStorage.getItem('ajwaHub_cart') || '[]');
    setCart(savedCart);
    setCartQuantity(savedCart.reduce((t, i) => t + i.quantity, 0));
  }, []);

  useEffect(() => {
    setCartQuantity(cart.reduce((t, i) => t + i.quantity, 0));
  }, [cart]);

  const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    const updatedCart = existing
      ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      : [...cart, { ...product, quantity: 1 }];
    setCart(updatedCart);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updatedCart));
    setShowCartDropdown(true);
  };

  const removeFromCart = (productId) => {
    setCartDeleteConfirm(null);
    const updatedCart = cart.filter(i => i.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updatedCart));
  };

  const removeFromWishlist = (productId) => {
    setDeleteConfirm(null);
    const updatedWishlist = wishlistItems.filter(p => p.id !== productId);
    setWishlistItems(updatedWishlist);
    localStorage.setItem('ajwaHub_wishlist', JSON.stringify(updatedWishlist));
    if (user?.email) {
      fetch(`${API}/wishlist/${user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedWishlist })
      }).catch(() => { });
    }
  };

  const filteredProducts = wishlistItems.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStock = !stockFilter ||
      (stockFilter === 'in-stock' && product.stock) ||
      (stockFilter === 'out-of-stock' && !product.stock);
    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleProductClick = (product) => {
    setSelectedWeight(null);
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const closeProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
    setSelectedWeight(null);
  };

  return (
    <div className="products-page">
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

      <div className="products-container">
        <div className="wishlist-hero">
          <div className="wishlist-hero-content-box">
            <div className="wishlist-hero-content">
              <span className="wishlist-hero-badge">
                <span className="pulse-dot"></span> Your Personal Collection
              </span>
              <h1>My <span>Wishlist</span></h1>
              <p>Curating your most-loved premium dates and handpicked dry fruits in one elegant space.</p>
            </div>

            <div className="wishlist-hero-stats">
              <div className="w-stat">
                <h3>{wishlistItems.length}</h3>
                <p>Saved Items</p>
              </div>
              <div className="w-stat-divider"></div>
              <div className="w-stat">
                <h3>{cartQuantity}</h3>
                <p>In Cart</p>
              </div>
            </div>
          </div>
        </div>





        {/* TOOLBAR */}
        <div className="products-toolbar">
          <div className="products-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search wishlist..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="products-filters">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All Categories</option>
              <option value="dates">Dates</option>
              <option value="dry">Dry Fruits</option>
            </select>
          </div>
          <div className="products-filters">
            <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
              <option value="">All Stock</option>
              <option value="in-stock">In Stock</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
          </div>

          {/* CART DROPDOWN */}
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
                        <p>PKR {item.price.toLocaleString()} x {item.quantity}</p>
                      </div>
                      <button 
                        className="remove-item-btn" 
                        onClick={() => setCartDeleteConfirm(item.id)}
                        title="Remove item"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </button>
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

        {filteredProducts.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-wishlist-icon">
              <FaRegHeart />
            </div>
            <h2 className="empty-wishlist-title">Your Wishlist is Empty</h2>
            <p className="empty-wishlist-text">Discover amazing products and add them to your wishlist</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/products')}>🛍️ Start Shopping</button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image" onClick={() => handleProductClick(product)}>
                  <img src={product.image} alt={product.name} onError={(e) => { e.target.src = '/dates.png'; }} />
                  <div className="product-badges">
                    <div className={`stock-badge ${product.stock ? 'in-stock' : 'out-stock'}`}>
                      {product.stock ? '● In Stock' : '○ Out of Stock'}
                    </div>
                  </div>
                  <button
                    className="wishlist-icon active"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(product.id); }}
                    title="Remove from Wishlist"
                  >
                    <FaHeart color="#dc2626" size={18} />
                  </button>
                </div>
                <div className="product-info">
                  <h3>{product.name.split(' ')[0]}</h3>
                  <div className="product-arabic-name">
                    {Object.keys(arabicMap).find(k => product.name.includes(k)) ? arabicMap[Object.keys(arabicMap).find(k => product.name.includes(k))] : 'عجوة'}
                  </div>
                  <button
                    className="boutique-btn"
                    onClick={(e) => { e.stopPropagation(); handleProductClick(product); }}
                    disabled={!product.stock}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showProductDetails && selectedProduct && (
          <div className="product-details-overlay" onClick={closeProductDetails}>
            <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeProductDetails}>✕</button>
              <div className="product-details-content">
                <div className="pd-left">
                  <div className="pd-image-wrapper">
                    <img src={selectedProduct.detailImage || selectedProduct.image} alt={selectedProduct.name} onError={(e) => { e.target.src = '/dates.png'; }} />
                  </div>
                </div>
                <div className="pd-right">
                  <div className="pd-header-row">
                    <h2 className="pd-title">{selectedProduct.name}</h2>
                    {selectedProduct.arabicName && <h2 className="pd-arabic">{selectedProduct.arabicName}</h2>}
                  </div>
                  {selectedWeight ? (
                    <div className="pd-price">Rs.{getDisplayPrice(selectedProduct, selectedWeight).toLocaleString()}.00</div>
                  ) : (
                    <div className="pd-price" style={{ opacity: 0, height: '32px' }}>&nbsp;</div>
                  )}
                  <div className="pd-storage-note">
                    {selectedProduct.storageNote || 'Storage Note: To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....'}
                  </div>
                  <div className="pd-rating-stock-row" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                    <div className="pd-rating" style={{ display: 'flex', alignItems: 'center', gap: '5px', userSelect: 'none' }}>
                      <div style={{ color: '#fbbf24', fontSize: '1.3rem', letterSpacing: '2px', display: 'flex', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }} title="Click to rate this product">
                        {[1, 2, 3, 4, 5].map(star => (
                          <span 
                            key={star} 
                            style={{ 
                              color: star <= (modalHoverStar || Math.round(productRatings.average)) ? '#fbbf24' : '#e5e7eb',
                              transition: 'color 0.2s, transform 0.2s',
                              transform: star <= modalHoverStar ? 'scale(1.15)' : 'scale(1)',
                              display: 'inline-block'
                            }}
                            onMouseEnter={() => setModalHoverStar(star)}
                            onMouseLeave={() => setModalHoverStar(0)}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleModalRate(star); }}
                          >★</span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: '130px' }}>
                        <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '5px', fontWeight: '500', whiteSpace: 'nowrap' }}>
                          {productRatings.average} ({productRatings.total}+ Reviews)
                        </span>
                        <div style={{ height: '18px', display: 'flex', alignItems: 'center' }}>
                          {modalRatingStatus === 'success' && (
                            <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '5px', fontWeight: '700', animation: 'fadeIn 0.3s ease' }}>⭐ Rated!</span>
                          )}
                          {modalRatingStatus === 'submitting' && (
                            <span style={{ color: '#c5a059', fontSize: '0.75rem', marginLeft: '5px' }}>Saving...</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="pd-stock-status" style={{ margin: 0 }}>
                      <span className="stock-dot"></span> In Stock
                    </div>
                  </div>

                  <div className="pd-weight-selection">
                    <p className="weight-label">Weight: <span>{selectedWeight || 'Select an option'}</span></p>
                    <div className="weight-options">
                      {(() => {
                        const dbWeights = selectedProduct.weights && selectedProduct.weights.length > 0
                          ? selectedProduct.weights
                          : [
                              { label: '1kg Special Box', savings: '' },
                              { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
                              { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
                              { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
                            ];
                        const has500g = dbWeights.some(w => w.label.toLowerCase().replace(/\s+/g, '').includes('500g'));
                        const finalWeights = has500g
                          ? dbWeights
                          : [{ label: '500g Mini Box', savings: '' }, ...dbWeights];

                        return finalWeights.map((w, idx) => (
                          <button
                            key={idx}
                            className={`weight-opt ${selectedWeight === w.label ? 'active' : ''}`}
                            onClick={() => setSelectedWeight(w.label)}
                          >
                            {w.label} {w.savings && <span>{w.savings}</span>}
                          </button>
                        ));
                      })()}
                    </div>
                  </div>

                  <button 
                    className="pd-add-to-cart-btn" 
                    onClick={() => {
                      if (!selectedWeight) {
                        alert('Please select a box size first.');
                        return;
                      }
                      addToCart({ 
                        ...selectedProduct, 
                        price: getDisplayPrice(selectedProduct, selectedWeight), 
                        weight: selectedWeight 
                      });
                    }}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <ConfirmDialog
          message="Are you sure you want to remove this item from your wishlist?"
          onConfirm={() => removeFromWishlist(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {cartDeleteConfirm && (
        <ConfirmDialog
          message="Are you sure you want to remove this item from your cart?"
          onConfirm={() => removeFromCart(cartDeleteConfirm)}
          onCancel={() => setCartDeleteConfirm(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default Wishlist;



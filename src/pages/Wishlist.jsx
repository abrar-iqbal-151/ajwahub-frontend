import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Wishlist.css';
import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';

const API = 'http://localhost:5000/api';

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
      }).catch(() => {});
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

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<span key={i} className={`star ${i <= Math.floor(rating) ? 'filled' : 'empty'}`}>{i <= Math.floor(rating) ? '★' : '☆'}</span>);
    }
    return stars;
  };

  return (
    <div className="products-page">
      <Navbar />

      <div className="products-container">
        <div className="wishlist-header">
          <h1 className="wishlist-title">My Wishlist</h1>
          <p className="wishlist-subtitle">Your favorite products in one place</p>
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
                      <button className="remove-item-btn" onClick={() => setCartDeleteConfirm(item.id)}>🗑️</button>
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
            <div className="empty-wishlist-icon"></div>
            <h2 className="empty-wishlist-title">Your Wishlist is Empty</h2>
            <p className="empty-wishlist-text">Discover amazing products and add them to your wishlist</p>
            <button className="continue-shopping-btn" onClick={() => navigate('/products')}>🛍️ Start Shopping</button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => (
              <div key={product.id} className="product-card">
                <div className="product-image" onClick={() => { setSelectedProduct(product); setShowProductDetails(true); }}>
                  <img src={product.image} alt={product.name} onError={(e) => { e.target.src = '/dates.png'; }} />
                  <div className={`stock-overlay ${product.stock ? 'in-stock' : 'out-stock'}`}>
                    {product.stock ? 'In Stock' : 'Out of Stock'}
                  </div>
                  <button
                    className="wishlist-icon active"
                    onClick={(e) => { e.stopPropagation(); setDeleteConfirm(product.id); }}
                    title="Remove from Wishlist"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                  </button>
                </div>
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <div className="price-section">
                    <span className="price">PKR {product.price.toLocaleString()}</span>
                    <span className="weight">{product.weight}</span>
                  </div>
                  <button className="small-add-to-cart-btn" onClick={() => addToCart(product)} disabled={!product.stock}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showProductDetails && selectedProduct && (
          <div className="product-details-overlay" onClick={() => setShowProductDetails(false)}>
            <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={() => setShowProductDetails(false)}>✕</button>
              <div className="product-details-content">
                <div className="product-details-image">
                  <img src={selectedProduct.image} alt={selectedProduct.name} onError={(e) => { e.target.src = '/dates.png'; }} />
                </div>
                <div className="product-details-info">
                  <h2>{selectedProduct.name}</h2>
                  <p className="product-description">{selectedProduct.description}</p>
                  <p className="product-weight">Weight: {selectedProduct.weight}</p>
                  <div className="rating">
                    {renderStars(selectedProduct.rating)}
                    <span className="rating-value">({selectedProduct.rating})</span>
                  </div>
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
          <div className="login-footer-social">
            <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href="#" aria-label="TikTok"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
          </div>
        </div>
        <div className="login-footer-bottom">
          &copy; 2025 AjwaHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Wishlist;

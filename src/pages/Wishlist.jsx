import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Wishlist.css';
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
      {/* 3D Background */}
      <div className="desc-bg-3d">
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" />
        <div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" />
        <div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_,i) => <div key={i} className="desc-bg-line" style={{animationDelay: `${i*0.4}s`}} />)}
        </div>
      </div>
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

      <Footer />
    </div>
  );
}

export default Wishlist;



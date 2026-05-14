import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Products.css';
import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';
import Footer from '../components/Footer';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Products() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [cart, setCart] = useState([]);
  const [cartQuantity, setCartQuantity] = useState(0);
  const [showCartDropdown, setShowCartDropdown] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) setUser(JSON.parse(userData));
    fetch(`${API}/shop-products`).then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_currentUser');
    setUser(null);
    navigate('/description');
  };

  const toggleProfileMenu = () => {};
  const isActive = (path) => location.pathname === path;

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    let updatedCart;
    
    if (existingItem) {
      updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(updatedCart);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updatedCart));
    setCartQuantity(updatedCart.reduce((total, item) => total + item.quantity, 0));
    setShowCartDropdown(true);
  };

  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const removeFromCart = (productId) => {
    setDeleteConfirm(null);
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updatedCart));
    setCartQuantity(updatedCart.reduce((total, item) => total + item.quantity, 0));
  };

  const toggleWishlist = (productId) => {
    const product = products.find(p => p.id === productId);
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
    const currentUser = JSON.parse(localStorage.getItem('ajwaHub_currentUser') || 'null');
    if (currentUser?.email) {
      fetch(`${API}/wishlist/${currentUser.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ products: updatedWishlistProducts })
      }).catch(() => {});
    }
  };

  const handleProductClick = (product) => {
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const closeProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
        <div className="products-toolbar">
          <div className="products-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search products..."
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
                      <button className="remove-item-btn" onClick={() => setDeleteConfirm(item.id)}>🗑️</button>
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

        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image" onClick={() => handleProductClick(product)}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  onError={(e) => {
                    e.target.src = '/dates.png';
                  }}
                />
                <div className={`stock-overlay ${product.stock ? 'in-stock' : 'out-stock'}`}>
                  {product.stock ? 'In Stock' : 'Out of Stock'}
                </div>
                <button 
                  className={`wishlist-icon ${wishlist.includes(product.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  title="Add to Wishlist"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

                <button 
                  className="small-add-to-cart-btn"
                  onClick={() => addToCart(product)}
                  disabled={!product.stock}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {showProductDetails && selectedProduct && (
          <div className="product-details-overlay" onClick={closeProductDetails}>
            <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
              <button className="close-btn" onClick={closeProductDetails}>✕</button>
              
              <div className="product-details-content">
                <div className="product-details-image">
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name} 
                    onError={(e) => {
                      e.target.src = '/dates.png';
                    }}
                  />
                </div>

                <div className="product-details-info">
                  <h2>{selectedProduct.name}</h2>
                  <p className="product-description">{selectedProduct.description}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <ConfirmDialog
          message="Are you sure you want to remove this item from your cart?"
          onConfirm={() => removeFromCart(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default Products;




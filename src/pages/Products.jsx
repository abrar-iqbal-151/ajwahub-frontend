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
  const [selectedWeight, setSelectedWeight] = useState('1kg Special Box');

  const getPriceForWeight = (basePrice, weight) => {
    if (weight.includes('500g')) return Math.round(basePrice * 0.55);
    if (weight.includes('2kg')) return basePrice * 2 - 500;
    if (weight.includes('3kg')) return basePrice * 3 - 700;
    if (weight.includes('5kg')) return basePrice * 5 - 1500;
    return basePrice;
  };

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) setUser(JSON.parse(userData));
    fetch(`${API}/shop-products`).then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => { });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_currentUser');
    setUser(null);
    navigate('/description');
  };

  const toggleProfileMenu = () => { };
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
      }).catch(() => { });
    }
  };

  const handleProductClick = (product) => {
    setSelectedWeight('1kg Special Box');
    setSelectedProduct(product);
    setShowProductDetails(true);
  };

  const closeProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
    setSelectedWeight('1kg Special Box');
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const arabicMap = {
    'Ajwa': 'عجوة',
    'Amber': 'عنبر',
    'Safawi': 'صفاوي',
    'Mabroom': 'مبروم',
    'Sukari': 'سكري',
    'Sagai': 'صقعي',
    'Kalmi': 'كالمي',
    'Medjool': 'مجدول'
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
        <header className="products-header">
          <div className="ph-content">
            <span className="ph-badge">Boutique Selection</span>
            <h1 className="ph-title">The Premium Collection</h1>
            <h2 className="ph-arabic">مجموعة مختارة بعناية</h2>
            <div className="ph-divider">
              <span className="ph-line"></span>
              <span className="ph-dot"></span>
              <span className="ph-line"></span>
            </div>
            <p className="ph-desc">Experience the finest handpicked dates and natural superfoods, delivered from our farms to your doorstep with love and purity.</p>
          </div>
          <div className="ph-spotlight"></div>
        </header>

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
                <div className="product-badges">
                  <div className={`stock-badge ${product.stock ? 'in-stock' : 'out-stock'}`}>
                    {product.stock ? '● In Stock' : '○ Out of Stock'}
                  </div>

                </div>

                <button
                  className={`wishlist-icon ${wishlist.includes(product.id) ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWishlist(product.id);
                  }}
                  title="Add to Wishlist"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.includes(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                </button>
              </div>

              <div className="product-info">
                <h3>{product.name.split(' ')[0]}</h3>
                <div className="product-arabic-name">
                  {Object.keys(arabicMap).find(k => product.name.includes(k)) ? arabicMap[Object.keys(arabicMap).find(k => product.name.includes(k))] : 'عجوة'}
                </div>



                <button
                  className="boutique-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProductClick(product);
                  }}
                  disabled={!product.stock}
                >
                  View Details
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
                <div className="pd-left">
                  <div className="pd-image-wrapper">
                    <img
                      src={selectedProduct.detailImage || selectedProduct.image}
                      alt={selectedProduct.name}
                      onError={(e) => { e.target.src = '/dates.png'; }}
                    />
                  </div>
                </div>

                <div className="pd-right">
                  <div className="pd-header-row">
                    <h2 className="pd-title">{selectedProduct.name}</h2>
                    {selectedProduct.arabicName && <h2 className="pd-arabic">{selectedProduct.arabicName}</h2>}
                  </div>
                  <div className="pd-price">Rs.{getPriceForWeight(selectedProduct.price, selectedWeight).toLocaleString()}.00</div>

                  <div className="pd-storage-note">
                    {selectedProduct.storageNote || 'Storage Note: To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....'}
                  </div>

                  <div className="pd-stock-status">
                    <span className="stock-dot"></span> In Stock
                  </div>

                  <div className="pd-weight-selection">
                    <p className="weight-label">Weight: <span>{selectedWeight}</span></p>
                    <div className="weight-options">
                      {(selectedProduct.weights && selectedProduct.weights.length > 0 ? selectedProduct.weights : [
                        { label: '1kg Special Box', savings: '' },
                        { label: '500g Mini Box', savings: '' },
                        { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
                        { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
                        { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
                      ]).map((w, idx) => (
                        <button
                          key={idx}
                          className={`weight-opt ${selectedWeight === w.label ? 'active' : ''}`}
                          onClick={() => setSelectedWeight(w.label)}
                        >
                          {w.label} {w.savings && <span>{w.savings}</span>}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button className="pd-add-to-cart-btn" onClick={() => addToCart({ ...selectedProduct, price: getPriceForWeight(selectedProduct.price, selectedWeight), weight: selectedWeight })}>
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




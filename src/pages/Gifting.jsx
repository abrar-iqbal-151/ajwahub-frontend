import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Gifting.css';
import Footer from './Footer';
import Navbar from './Navbar';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const STATIC_GIFT_BOXES = [
  { _id: '1', name: 'Classic Date Box', description: 'A beautiful box of premium Ajwa dates, perfect for any occasion.', image: '/Gift 1.png', price: 1500, maxItems: 2, tag: 'Bestseller' },
  { _id: '2', name: 'Dry Fruits Delight', description: 'Handpicked dry fruits collection — almonds, walnuts & pistachios.', image: '/Gift 2.png', price: 2000, maxItems: 3, tag: 'Popular' },
  { _id: '3', name: 'Eid Special Box', description: 'Celebrate Eid with our premium dates and dry fruits gift box.', image: '/Gift 3.png', price: 2500, maxItems: 4, tag: '🎁 Special' },
  { _id: '4', name: 'Premium Collection', description: 'Our finest selection of Ajwa dates and exotic dry fruits.', image: '/Gift 4.png', price: 3500, maxItems: 5, tag: 'Premium' },
  { _id: '5', name: 'Luxury Gift Set', description: 'An exquisite luxury gift set for the most special occasions.', image: '/Gift 5.png', price: 4500, maxItems: 6, tag: 'Luxury' },
  { _id: '6', name: 'Health Booster Box', description: 'Nutritious dates and dry fruits for a healthy lifestyle.', image: '/Gift 6.png', price: 1800, maxItems: 3, tag: 'Healthy' },
  { _id: '7', name: 'Elite Date Package', description: 'Elite package with the rarest and finest dates from Madinah.', image: '/Gift 7.png', price: 5000, maxItems: 4, tag: 'Elite' },
  { _id: '8', name: 'Wedding Gift Box', description: 'Perfect wedding gift with premium dates and dry fruits.', image: '/Gift 8.png', price: 3000, maxItems: 5, tag: 'New' },
];

const tagColors = {
  'Bestseller': '#f59e0b', 'Popular': '#3b82f6', 'New': '#10b981',
  'Premium': '#8b5cf6', 'Healthy': '#22c55e', 'Luxury': '#ec4899',
  'Elite': '#f97316', '🎁 Special': '#dc2626',
};

function Gifting() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [products, setProducts] = useState([]);
  const [giftBoxes, setGiftBoxes] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchItem, setSearchItem] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) setUser(JSON.parse(userData));
    fetch(`${API}/shop-products`).then(r => r.json()).then(d => setProducts(d.products || [])).catch(() => {});
    fetch(`${API}/gift-boxes`)
      .then(r => r.json())
      .then(d => setGiftBoxes(d.boxes?.length ? d.boxes : STATIC_GIFT_BOXES))
      .catch(() => setGiftBoxes(STATIC_GIFT_BOXES));
  }, []);

  const handleLogout = () => { localStorage.removeItem('ajwaHub_currentUser'); setUser(null); navigate('/description'); };

  const openBox = (box) => { setSelectedBox(box); setSelectedItems([]); setSearchItem(''); };
  const addItem = (product) => { if (selectedItems.length >= selectedBox.maxItems) return; setSelectedItems([...selectedItems, product]); };
  const removeItem = (index) => setSelectedItems(selectedItems.filter((_, i) => i !== index));

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchItem.toLowerCase()));
  const totalPrice = selectedBox ? selectedBox.price + selectedItems.reduce((s, p) => s + p.price, 0) : 0;

  const handleOrder = async () => {
    const cartItems = selectedItems.map(p => ({ ...p, quantity: 1 }));
    localStorage.setItem('ajwaHub_cart', JSON.stringify(cartItems));
    const currentUser = JSON.parse(localStorage.getItem('ajwaHub_currentUser') || 'null');
    try {
      await fetch(`${API}/gift-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userEmail: currentUser?.email || 'guest',
          userName: currentUser?.name || 'Guest',
          boxName: selectedBox.name,
          boxPrice: selectedBox.price,
          items: selectedItems,
          totalPrice
        })
      });
    } catch {}
    setSelectedBox(null);
    navigate('/payment');
  };

  return (
    <div className="gifting-page">
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

      {/* HERO */}
      <div className="gifting-hero">
        <div className="gifting-hero-content">
          <span className="gifting-hero-badge">🎁 Premium Gift Collection</span>
          <h1>Gift the <span>Finest</span> Dates & Dry Fruits</h1>
          <p>Handcrafted gift boxes for every occasion — birthdays, weddings, Eid & more</p>
        </div>
        <div className="gifting-hero-stats">
          <div className="hero-stat"><h3>8+</h3><p>Gift Boxes</p></div>
          <div className="hero-stat"><h3>100%</h3><p>Premium Quality</p></div>
          <div className="hero-stat"><h3>🎀</h3><p>Gift Wrapped</p></div>
        </div>
      </div>

      <div className="gifting-container">
        <div className="gifting-grid">
          {giftBoxes.map(box => (
            <div key={box._id} className="gift-card" onClick={() => openBox(box)}>
              <div className="gift-card-img">
                <img src={box.image} alt={box.name} onError={e => e.target.style.display = 'none'} />
                <span className="gift-tag" style={{ background: tagColors[box.tag] || '#dc2626' }}>{box.tag}</span>
                <div className="gift-slots">
                  {[...Array(box.maxItems)].map((_, i) => <div key={i} className="slot" />)}
                </div>
              </div>
              <div className="gift-card-body">
                <h3>{box.name}</h3>
                <p>{box.description}</p>
                <div className="gift-card-footer">
                  <span className="gift-price">PKR {box.price.toLocaleString()}</span>
                  <span className="gift-capacity">🎁 {box.maxItems} item{box.maxItems > 1 ? 's' : ''}</span>
                </div>
                <button className="gift-btn">Customize Box →</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CUSTOMIZE MODAL */}
      {selectedBox && (
        <div className="gift-modal-overlay" onClick={() => setSelectedBox(null)}>
          <div className="gift-customize-modal" onClick={e => e.stopPropagation()}>
            <button className="gift-modal-close" onClick={() => setSelectedBox(null)}>✕</button>

            <div className="gcm-left">
              <img src={selectedBox.image} alt={selectedBox.name} onError={e => e.target.style.display = 'none'} />
              <div className="gcm-box-info">
                <span className="gift-tag" style={{ background: tagColors[selectedBox.tag] || '#dc2626' }}>{selectedBox.tag}</span>
                <h3>{selectedBox.name}</h3>
                <p>{selectedBox.description}</p>
              </div>

              {/* SELECTED ITEMS */}
              <div className="gcm-slots">
                <p className="gcm-slots-title">Selected Items ({selectedItems.length}/{selectedBox.maxItems})</p>
                <div className="gcm-slots-list">
                  {[...Array(selectedBox.maxItems)].map((_, i) => (
                    <div key={i} className={`gcm-slot ${selectedItems[i] ? 'filled' : 'empty'}`}>
                      {selectedItems[i] ? (
                        <>
                          <img src={selectedItems[i].image} alt={selectedItems[i].name} onError={e => e.target.style.display = 'none'} />
                          <span>{selectedItems[i].name}</span>
                          <button onClick={() => removeItem(i)}>✕</button>
                        </>
                      ) : (
                        <span className="gcm-slot-empty">+ Add Item</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="gcm-total">
                <span>Box Price: PKR {selectedBox.price.toLocaleString()}</span>
                <span>Items: PKR {selectedItems.reduce((s, p) => s + p.price, 0).toLocaleString()}</span>
                <strong>Total: PKR {totalPrice.toLocaleString()}</strong>
              </div>

              <button
                className="gift-btn"
                disabled={selectedItems.length === 0}
                onClick={handleOrder}
                style={{ opacity: selectedItems.length === 0 ? 0.5 : 1 }}
              >
                🎁 Order Gift Box →
              </button>
            </div>

            <div className="gcm-right">
              <h4>Choose Products</h4>
              <div className="gcm-search">
                <span>🔍</span>
                <input placeholder="Search products..." value={searchItem} onChange={e => setSearchItem(e.target.value)} />
              </div>
              <div className="gcm-products">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className={`gcm-product ${selectedItems.length >= selectedBox.maxItems ? 'disabled' : ''}`}
                    onClick={() => addItem(product)}
                  >
                    <img src={product.image} alt={product.name} onError={e => e.target.style.display = 'none'} />
                    <div>
                      <h5>{product.name}</h5>
                      <span>PKR {product.price.toLocaleString()}</span>
                    </div>
                    <button className="gcm-add-btn" disabled={selectedItems.length >= selectedBox.maxItems}>+</button>
                  </div>
                ))}
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

export default Gifting;




import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Gifting.css';
import Footer from './Footer';
import Navbar from './Navbar';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const STATIC_GIFT_BOXES = [
  { _id: '1', name: 'Classic Date Box',     arabic: 'صندوق التمر الكلاسيكي',   description: 'A beautiful box of premium Ajwa dates, perfect for any occasion.', image: '/Gift 1.png', price: 1500, maxItems: 1, tag: 'Bestseller' },
  { _id: '2', name: 'Dry Fruits Delight',   arabic: 'تشكيلة الفواكه المجففة',  description: 'Handpicked dry fruits collection — almonds, walnuts & pistachios.', image: '/Gift 2.png', price: 2000, maxItems: 2, tag: 'Popular' },
  { _id: '3', name: 'Eid Special Box',       arabic: 'صندوق عيد مبارك',         description: 'Celebrate Eid with our premium dates and dry fruits gift box.', image: '/Gift 3.png', price: 2500, maxItems: 3, tag: '🎁 Special' },
  { _id: '4', name: 'Premium Collection',    arabic: 'المجموعة المميزة',        description: 'Our finest selection of Ajwa dates and exotic dry fruits.', image: '/Gift 4.png', price: 3500, maxItems: 4, tag: 'Premium' },
  { _id: '5', name: 'Luxury Gift Set',       arabic: 'طقم الهدايا الفاخر',     description: 'An exquisite luxury gift set for the most special occasions.', image: '/Gift 5.png', price: 4500, maxItems: 5, tag: 'Luxury' },
  { _id: '6', name: 'Health Booster Box',    arabic: 'صندوق الصحة والعافية',   description: 'Nutritious dates and dry fruits for a healthy lifestyle.', image: '/Gift 6.png', price: 1800, maxItems: 6, tag: 'Healthy' },
  { _id: '7', name: 'Elite Date Package',    arabic: 'الحزمة النخبوية من التمر', description: 'Elite package with the rarest and finest dates from Madinah.', image: '/Gift 7.png', price: 5000, maxItems: 7, tag: 'Elite' },
  { _id: '8', name: 'Wedding Gift Box',      arabic: 'صندوق هدايا الزفاف',    description: 'Perfect wedding gift with premium dates and dry fruits.', image: '/Gift 8.png', price: 3000, maxItems: 8, tag: 'New' },
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
  const itemsTotal = selectedItems.reduce((s, p) => s + p.price, 0);
  const totalPrice = selectedBox && selectedItems.length > 0 ? selectedBox.price + itemsTotal : 0;


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

      {/* HERO — Golden Frame */}
      <div className="gifting-hero">
        <div className="gifting-hero-content-box">
          <div className="gifting-hero-content">
            <span className="gifting-hero-badge">🎁 Premium Gift Collection</span>
            <h1>Gift the <span>Finest</span> Dates &amp; Dry Fruits</h1>
            <p>Handcrafted gift boxes for every occasion — birthdays, weddings, Eid &amp; more</p>
          </div>
          <div className="gifting-hero-stats">
            <div className="hero-stat"><h3>8+</h3><p>Gift Boxes</p></div>
            <div className="hero-stat"><h3>100%</h3><p>Premium Quality</p></div>
            <div className="hero-stat"><h3>🎀</h3><p>Gift Wrapped</p></div>
          </div>
        </div>
      </div>

      <div className="gifting-container">
        <div className="gifting-grid">
          {giftBoxes.map(box => (
            <div key={box._id} className="gift-card" onClick={() => openBox(box)}>
              <div className="gift-card-img">
                <img src={box.image} alt={box.name} onError={e => e.target.style.display = 'none'} />

                <div className="gift-slots">
                  {[...Array(box.maxItems)].map((_, i) => <div key={i} className="slot" />)}
                </div>
              </div>
              <div className="gift-card-body">
                <h3>{box.name}</h3>
                <p className="gift-card-arabic">{box.arabic}</p>
                <div className="gift-item-count">
                  <span>🎁 {box.maxItems} {box.maxItems === 1 ? 'Item' : 'Items'}</span>
                </div>
                <button className="gift-btn" onClick={e => { e.stopPropagation(); openBox(box); }}>View Details →</button>
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
              {/* Box image with overlay badge */}
              <div className="gcm-img-wrap">
                <img src={selectedBox.innerImage || selectedBox.image} alt={selectedBox.name} onError={e => e.target.style.display = 'none'} />

              </div>

              {/* Box name */}
              <div className="gcm-box-info">
                <h3>{selectedBox.name}</h3>
                <p>{selectedBox.description}</p>
              </div>

              {/* Slot list */}
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

              {/* Pricing Summary */}
              <div className="gcm-total">
                <div className="gcm-price-row">
                  <span>Box Base</span>
                  <span className="gcm-price-val">PKR {selectedBox.price.toLocaleString()}</span>
                </div>
                <div className="gcm-price-row">
                  <span>Items</span>
                  <span className="gcm-price-val">PKR {itemsTotal > 0 ? itemsTotal.toLocaleString() : '—'}</span>
                </div>
                <div className="gcm-price-divider" />
                <div className="gcm-price-total">
                  <span>Total</span>
                  <strong>PKR {totalPrice > 0 ? totalPrice.toLocaleString() : '0'}</strong>
                </div>
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

      <Footer />
    </div>
  );
}

export default Gifting;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaMapMarkerAlt, FaCreditCard, FaCheckCircle } from 'react-icons/fa';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripeCheckout from './StripeCheckout';
import '../css/Payment.css';
import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';
import Footer from '../components/Footer';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [step, setStep] = useState('review');
  const [selectedPayment, setSelectedPayment] = useState('stripe');
  const [paymentScreenshot, setPaymentScreenshot] = useState(null);
  const [stripeSuccess, setStripeSuccess] = useState(false);
  const [stripePIId, setStripePIId] = useState('');
  const [shippingAddress, setShippingAddress] = useState({ fullName: '', phone: '', address: '', city: '', zipCode: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [paymentForm] = useState({ cardNumber: '', cardHolder: '', expiryDate: '', cvv: '' }); // kept for legacy order reference
  const [orderId, setOrderId] = useState('');
  const [orderStatus, setOrderStatus] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paySettings, setPaySettings] = useState({ easypaisaNumber: '03202017120', jazzcashNumber: '03202017120', easypaisaName: 'AjwaHub', jazzcashName: 'AjwaHub', extraPayments: [], shippingCost: 200, taxRate: 17, discountRate: 0 });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API}/api/settings`).then(r => r.json()).then(d => { if (d.settings) setPaySettings(d.settings); }).catch(() => { });
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      if (u.email) {
        fetch(`${API}/api/users/addresses/${u.email}`)
          .then(r => r.json())
          .then(d => {
            const addrs = d.addresses || [];
            setSavedAddresses(addrs);
            const def = addrs.find(a => a.isDefault);
            if (def) {
              const cityParts = def.city?.split(',') || [];
              setShippingAddress({
                fullName: def.name || '',
                phone: def.phone || '',
                address: def.address || '',
                city: cityParts[0]?.trim() || '',
                state: cityParts[1]?.trim() || '',
                zipCode: def.postalCode || ''
              });
              setSelectedAddressId(def.id);
            }
          }).catch(() => { });
      }
    }
    const savedCart = JSON.parse(localStorage.getItem('ajwaHub_cart') || '[]');
    setCartItems(savedCart);
  }, [location.pathname]);

  const handleRemoveItem = (itemId) => {
    setDeleteConfirm(null);
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updatedCart));
  };

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) { handleRemoveItem(itemId); return; }
    const updatedCart = cartItems.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item);
    setCartItems(updatedCart);
    localStorage.setItem('ajwaHub_cart', JSON.stringify(updatedCart));
  };

  const subtotal = Math.round(cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1)), 0));
  const discount = Math.round(cartItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 1) * (item.discount || paySettings.discountRate || 0) / 100), 0));
  const shipping = paySettings.shippingCost ?? 200;
  const tax = Math.round(shipping * (paySettings.taxRate ?? 17) / 100);
  const total = Math.round(subtotal - discount + shipping + tax);

  const validateField = (name, value) => {
    switch (name) {
      case 'fullName':
        if (!value.trim()) return 'Full name is required';
        if (value.trim().length < 3) return 'At least 3 characters required';
        if (/[0-9]/.test(value)) return 'Name cannot contain numbers';
        if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Name cannot contain special characters';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required';
        if (!/^[0-9]+$/.test(value)) return 'Only numbers are allowed';
        if (value.length < 10) return 'Must be 10 digits';
        return '';
      case 'address':
        if (!value.trim()) return 'Street address is required';
        if (value.trim().length < 10) return 'Please enter complete address (house no, street, area)';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required';
        if (/[0-9]/.test(value)) return 'City name cannot contain numbers';
        if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Please enter city name only';
        if (value.trim().length < 3) return 'Please enter a valid city name';
        return '';
      case 'state':
        if (!value.trim()) return 'Province is required';
        if (/[0-9]/.test(value)) return 'Province name cannot contain numbers';
        if (/[!@#$%^&*()_+=\[\]{};':"\\|,.<>\/?]/.test(value)) return 'Please enter province name only';
        return '';
      case 'zipCode':
        if (!value.trim()) return 'Zip code is required';
        if (!/^[0-9]+$/.test(value)) return 'Only numbers are allowed';
        if (value.length < 5) return 'Please enter a valid zip code';
        return '';
      default: return '';
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === 'fullName') filtered = value.replace(/[^a-zA-Z\s]/g, '');
    if (name === 'phone' || name === 'zipCode') filtered = value.replace(/[^0-9]/g, '');
    if (name === 'city' || name === 'state') filtered = value.replace(/[^a-zA-Z\s]/g, '');
    setShippingAddress(prev => ({ ...prev, [name]: filtered }));
    if (touched[name]) setFieldErrors(prev => ({ ...prev, [name]: validateField(name, filtered) }));
  };

  const handleBlur = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, shippingAddress[name]) }));
  };

  const pakistanCities = [
    'Abbottabad', 'Attock', 'Awaran', 'Badin', 'Bahawalnagar', 'Bahawalpur', 'Bannu', 'Batagram',
    'Bhakkar', 'Bhalwal', 'Bhimber', 'Burewala', 'Chakwal', 'Chaman', 'Charsadda', 'Chiniot',
    'Chishtian', 'Dadu', 'Dera Ghazi Khan', 'Dera Ismail Khan', 'Faisalabad', 'Ghotki',
    'Gujranwala', 'Gujrat', 'Gwadar', 'Hafizabad', 'Haripur', 'Hyderabad', 'Islamabad',
    'Jacobabad', 'Jhelum', 'Jhang', 'Kamalia', 'Kamoke', 'Karachi', 'Kasur', 'Khanewal',
    'Kharian', 'Khushab', 'Khuzdar', 'Kohat', 'Kot Addu', 'Lahore', 'Larkana', 'Layyah',
    'Lodhran', 'Mandi Bahauddin', 'Mansehra', 'Mardan', 'Mianwali', 'Mirpur', 'Mirpur Khas',
    'Multan', 'Muridke', 'Muzaffarabad', 'Muzaffargarh', 'Narowal', 'Nawabshah', 'Nowshera',
    'Okara', 'Pakpattan', 'Peshawar', 'Quetta', 'Rahim Yar Khan', 'Rawalpindi', 'Sadiqabad',
    'Sahiwal', 'Sargodha', 'Sheikhupura', 'Sialkot', 'Sibi', 'Sukkur', 'Swabi', 'Swat',
    'Tando Adam', 'Tando Allahyar', 'Taxila', 'Toba Tek Singh', 'Turbat', 'Umerkot',
    'Vehari', 'Wah Cantonment', 'Wazirabad', 'Zhob'
  ].sort();

  const isShippingValid = () =>
    shippingAddress.fullName.trim() && shippingAddress.phone.trim() && shippingAddress.phone.length >= 10 &&
    shippingAddress.address.trim() && shippingAddress.city.trim() && shippingAddress.zipCode.trim();

  const validateShipping = () => {
    if (!isShippingValid()) { setError('Please fill all shipping fields correctly.'); return false; }
    setError(''); return true;
  };

  const proceedToPayment = () => { if (validateShipping()) setStep('payment'); };

  const validatePayment = () => {
    if (selectedPayment === 'stripe') return true; // Stripe handles its own validation
    if (selectedPayment === 'card' && !paymentScreenshot) { setError('Please upload payment screenshot'); return false; }
    if (selectedPayment === 'easypaisa' && !paymentScreenshot) { setError('Please upload payment screenshot'); return false; }
    if (selectedPayment === 'jazzcash' && !paymentScreenshot) { setError('Please upload payment screenshot'); return false; }
    setError(''); return true;
  };

  const processPayment = async () => {
    if (cartItems.length === 0) { setError('Your cart is empty.'); return; }
    if (!isShippingValid()) { setError('Please fill in your shipping details first.'); setStep('shipping'); return; }
    if (!validatePayment()) return;
    // Stripe payments are handled by StripeCheckout's submit — skip here
    if (selectedPayment === 'stripe') return;
    setProcessing(true); setError('');
    let screenshotPath = null;
    if (paymentScreenshot) {
      try {
        const formData = new FormData();
        formData.append('file', paymentScreenshot);
        const upRes = await fetch(`${API}/api/upload`, { method: 'POST', body: formData });
        const upData = await upRes.json();
        if (upRes.ok) screenshotPath = upData.path;
      } catch { }
    }
    await placeOrder({ status: 'Pending Approval', screenshotPath });
  };

  const placeOrder = async ({ status = 'Pending Approval', screenshotPath = null, stripePaymentId = null } = {}) => {
    const newOrderId = 'ORD' + Date.now();
    setOrderId(newOrderId);
    const order = { orderId: newOrderId, items: cartItems, subtotal, discount, shipping, tax, total, paymentMethod: selectedPayment, status, paymentScreenshot: screenshotPath, stripePaymentId, shippingAddress, timestamp: new Date().toISOString(), userEmail: user?.email };
    const orders = JSON.parse(localStorage.getItem('ajwaHub_orders') || '[]');
    orders.push(order);
    localStorage.setItem('ajwaHub_orders', JSON.stringify(orders));
    try { await fetch(`${API}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...order, trackingStatus: 'warehouse' }) }); } catch { }
    localStorage.removeItem('ajwaHub_cart');
    setCartItems([]);
    setOrderStatus(status);
    setStep('confirmation');
    setProcessing(false);
    setTimeout(() => { navigate('/tracking'); }, 3000);
  };

  const handleStripeSuccess = async (paymentIntentId) => {
    setStripePIId(paymentIntentId);
    setStripeSuccess(true);
    await placeOrder({ status: 'Paid', stripePaymentId: paymentIntentId });
  };

  const handleStripeError = (msg) => {
    setError(msg);
  };

  if (step === 'confirmation') {
    return (
      <div className="payment-page">
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
        <nav className="navbar">
          <div className="nav-logo" onClick={() => navigate('/home')}>
            <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
            <span className="nav-logo-text">
              <span className="logo-ajwa">Ajwa</span>
              <span className="logo-hub">Hub</span>
            </span>
          </div>
        </nav>
        <div className="confirmation-container">
          <div className="confirmation-card">
            <div className="success-icon">✅</div>
            <h1>Order Confirmed!</h1>
            <p className="order-id">Order ID: <strong>{orderId}</strong></p>
            <p className="order-status">Status: <strong>{orderStatus}</strong></p>
            {orderStatus === 'Paid' ? <p className="status-message">✓ Payment processed successfully</p> : <p className="status-message">🕰️ Payment screenshot uploaded. Awaiting admin approval.</p>}
            <p className="redirect-message">Redirecting to tracking page in 3 seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
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
      <div className="payment-container">
        <div className="progress-steps">
          {[
            { key: 'review', label: 'Review', icon: <FaShoppingCart /> },
            { key: 'shipping', label: 'Shipping', icon: <FaMapMarkerAlt /> },
            { key: 'payment', label: 'Payment', icon: <FaCreditCard /> },
            { key: 'confirmation', label: 'Done', icon: <FaCheckCircle /> }
          ].map((s, i) => {
            const steps = ['review', 'shipping', 'payment', 'confirmation'];
            return (
              <div key={s.key} className={`ps-step ${step === s.key ? 'active' : ''} ${steps.indexOf(step) > i ? 'completed' : ''}`} onClick={() => { if (s.key !== 'confirmation') { setError(''); setStep(s.key); } }} style={{ cursor: s.key === 'confirmation' ? 'default' : 'pointer' }}>
                <span className="ps-icon">{s.icon}</span>
                <span className="ps-label">{s.label}</span>
              </div>
            );
          })}
        </div>

        {step === 'review' && (
          <div className="checkout-step">
            <h2>📦 Order Review</h2>
            <div className={`review-content ${cartItems.length === 0 ? 'empty' : ''}`}>
              <div className="items-list">
                {cartItems.length === 0 ? (
                  <div className="empty-cart-state">
                    <div className="empty-cart-icon">🛒</div>
                    <h3>Your cart is empty</h3>
                    <p>Add some products to get started</p>
                    <button className="empty-cart-btn" onClick={() => navigate('/products')}>🛍️ Browse Products</button>
                  </div>
                ) : (
                  cartItems.map(item => (
                    <div key={item.id} className="review-item">
                      <button className="top-delete-btn" onClick={() => setDeleteConfirm(item.id)}><FaTrash /></button>
                      <img src={item.image} alt={item.name} className="item-image" />
                      <div className="item-info"><h4>{item.name}</h4><p>{item.weight}</p></div>
                      <div className="quantity-controls">
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                        <span className="quantity">{item.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                      </div>
                      <span className="item-price">PKR {Math.round((item.price || 0) * (item.quantity || 1) * (1 - (item.discount || 0) / 100)).toLocaleString()}</span>
                    </div>
                  ))
                )}
              </div>
              {cartItems.length > 0 && (
                <div className="order-summary">
                  <>
                    <div className="summary-row"><span>Subtotal</span><span>PKR {subtotal}</span></div>
                    <div className="summary-row"><span>Discount</span><span className="discount">-PKR {discount}</span></div>
                    <div className="summary-row"><span>Shipping</span><span>PKR {shipping}</span></div>
                    <div className="summary-row"><span>Tax ({paySettings.taxRate ?? 17}%)</span><span>PKR {tax}</span></div>
                    <div className="summary-divider"></div>
                    <div className="summary-row total"><span>Total</span><span>PKR {total}</span></div>
                  </>
                </div>
              )}
            </div>
            <div className="button-group">
              <button className={`next-btn ${cartItems.length === 0 ? 'disabled' : ''}`} disabled={cartItems.length === 0} onClick={() => { if (cartItems.length === 0) { setError('Your cart is empty. Please add items first.'); return; } setError(''); setStep('shipping'); }}>
                {cartItems.length === 0 ? '🛒 Cart is Empty' : 'Continue to Shipping →'}
              </button>
            </div>
            {error && <div className="error-message" style={{ marginTop: '1rem' }}>{error}</div>}
          </div>
        )}

        {step === 'shipping' && (
          <div className="checkout-step">
            <h2>📍 Shipping Address</h2>

            {savedAddresses.length > 0 && (
              <div className="saved-addresses-section">
                <p className="ship-label">📋 Saved Addresses — Click to use</p>
                <div className="saved-addresses-list">
                  {savedAddresses.map(addr => (
                    <div key={addr.id} className={`saved-addr-card ${selectedAddressId === addr.id ? 'selected' : ''}`}
                      onClick={() => {
                        const cityParts = addr.city?.split(',') || [];
                        setShippingAddress({ fullName: addr.name || '', phone: addr.phone || '', address: addr.address || '', city: cityParts[0]?.trim() || '', state: cityParts[1]?.trim() || '', zipCode: addr.postalCode || '' });
                        setSelectedAddressId(addr.id);
                      }}>
                      {addr.isDefault && <span className="addr-default-badge">⭐ Default</span>}
                      <strong>{addr.name}</strong>
                      <span>{addr.address}, {addr.city}</span>
                      <span>📞 {addr.phone}</span>
                      {selectedAddressId === addr.id && <span className="addr-selected-badge">✔ Selected</span>}
                    </div>
                  ))}
                  <div className={`saved-addr-card ${selectedAddressId === 'new' ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedAddressId('new');
                      setShippingAddress({ fullName: '', phone: '', address: '', city: '', state: '', zipCode: '' });
                      setTouched({});
                    }}>
                    <span style={{ fontSize: '20px' }}>✏️</span>
                    <strong>Enter New Address</strong>
                    <span>Type a different delivery address</span>
                  </div>
                </div>
              </div>
            )}

            <div className="ship-grid">
              {[
                { name: 'fullName', label: 'Full Name', placeholder: 'e.g. Ahmed Khan', icon: '👤', half: true },
              ].map(({ name, label, placeholder, icon, half }) => (
                <div key={name} className={`ship-field ${half ? '' : 'full'}`}>
                  <label className="ship-label">{icon} {label}</label>
                  <input type="text" name={name} placeholder={placeholder} value={shippingAddress[name]} onChange={handleShippingChange} onBlur={() => handleBlur(name)}
                    className={`ship-input ${touched[name] && fieldErrors[name] ? 'err' : touched[name] && !fieldErrors[name] ? 'ok' : ''}`} />
                  {touched[name] && fieldErrors[name] && <span className="ship-error">⚠ {fieldErrors[name]}</span>}
                  {touched[name] && !fieldErrors[name] && shippingAddress[name] && <span className="ship-ok">✅ Valid</span>}
                </div>
              ))}

              {/* PHONE WITH +92 */}
              <div className="ship-field">
                <label className="ship-label">📞 Phone Number</label>
                <div className="ship-phone-wrap">
                  <span className="ship-phone-code">🇵🇰 +92</span>
                  <input
                    type="text" name="phone" placeholder="3XX XXXXXXX"
                    value={shippingAddress.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
                      setShippingAddress(prev => ({ ...prev, phone: val }));
                      if (touched.phone) setFieldErrors(prev => ({ ...prev, phone: validateField('phone', val) }));
                    }}
                    onBlur={() => handleBlur('phone')}
                    className={`ship-input ${touched.phone && fieldErrors.phone ? 'err' : touched.phone && !fieldErrors.phone ? 'ok' : ''}`}
                    maxLength={10}
                  />
                </div>
                {touched.phone && fieldErrors.phone && <span className="ship-error">⚠ {fieldErrors.phone}</span>}
                {touched.phone && !fieldErrors.phone && shippingAddress.phone && <span className="ship-ok">✅ Valid</span>}
              </div>
              {/* CITY DROPDOWN */}
              <div className="ship-field">
                <label className="ship-label">🏙️ City</label>
                <select
                  name="city"
                  value={shippingAddress.city}
                  onChange={e => { setShippingAddress(prev => ({ ...prev, city: e.target.value })); setTouched(prev => ({ ...prev, city: true })); setFieldErrors(prev => ({ ...prev, city: e.target.value ? '' : 'City is required' })); }}
                  className={`ship-input ${touched.city && fieldErrors.city ? 'err' : touched.city && shippingAddress.city ? 'ok' : ''}`}
                >
                  <option value="">-- Select City --</option>
                  {pakistanCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                {touched.city && fieldErrors.city && <span className="ship-error">⚠ {fieldErrors.city}</span>}
                {touched.city && !fieldErrors.city && shippingAddress.city && <span className="ship-ok">✅ Valid</span>}
              </div>

              {/* ADDRESS */}
              <div className="ship-field full">
                <label className="ship-label">🏠 Street Address</label>
                <input type="text" name="address" placeholder="House #, Street, Area" value={shippingAddress.address} onChange={handleShippingChange} onBlur={() => handleBlur('address')}
                  className={`ship-input ${touched.address && fieldErrors.address ? 'err' : touched.address && !fieldErrors.address ? 'ok' : ''}`} />
                {touched.address && fieldErrors.address && <span className="ship-error">⚠ {fieldErrors.address}</span>}
                {touched.address && !fieldErrors.address && shippingAddress.address && <span className="ship-ok">✅ Valid</span>}
              </div>

              {/* ZIP CODE */}
              <div className="ship-field">
                <label className="ship-label">📮 Zip Code</label>
                <input type="text" name="zipCode" placeholder="e.g. 75500" value={shippingAddress.zipCode} onChange={handleShippingChange} onBlur={() => handleBlur('zipCode')}
                  className={`ship-input ${touched.zipCode && fieldErrors.zipCode ? 'err' : touched.zipCode && !fieldErrors.zipCode ? 'ok' : ''}`}
                  maxLength={6} />
                {touched.zipCode && fieldErrors.zipCode && <span className="ship-error">⚠ {fieldErrors.zipCode}</span>}
                {touched.zipCode && !fieldErrors.zipCode && shippingAddress.zipCode && <span className="ship-ok">✅ Valid</span>}
              </div>
            </div>
            <div className="button-group">
              <button className="back-btn" onClick={() => setStep('review')}>← Back</button>
              <button className={`next-btn ${!isShippingValid() ? 'disabled' : ''}`} onClick={proceedToPayment} disabled={!isShippingValid()}>Continue to Payment →</button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="checkout-step">
            <h2>💳 Payment Method</h2>
            {error && <div className="error-message">{error}</div>}
            <div className="pay-layout">
              <div className="pay-cart">
                <h4 className="pay-section-title">🛒 Order Summary</h4>
                <div className="pay-items">
                  {cartItems.map(item => (
                    <div key={item.id} className="pay-item">
                      <img src={item.image} alt={item.name} onError={e => e.target.style.display = 'none'} />
                      <div className="pay-item-info"><span>{item.name}</span><small>x{item.quantity}</small></div>
                      <span className="pay-item-price">PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pay-summary">
                  {cartItems.length > 0 && (
                    <>
                      <div className="pay-row"><span>Subtotal</span><span>PKR {subtotal.toLocaleString()}</span></div>
                      <div className="pay-row"><span>Shipping</span><span>PKR {shipping}</span></div>
                      <div className="pay-row"><span>Tax ({paySettings.taxRate ?? 17}%)</span><span>PKR {tax.toLocaleString()}</span></div>
                      <div className="pay-row total"><span>Total</span><span>PKR {total.toLocaleString()}</span></div>
                    </>
                  )}
                </div>
              </div>

              <div className="pay-methods">
                <h4 className="pay-section-title">💳 Select Payment</h4>
                {/* ── STRIPE CARD ── */}
                <label className={`pay-option ${selectedPayment === 'stripe' ? 'active' : ''}`}>
                  <input type="radio" name="payment" value="stripe" checked={selectedPayment === 'stripe'} onChange={e => setSelectedPayment(e.target.value)} />
                  <span className="pay-opt-icon">💳</span>
                  <div><h5>Pay by Card</h5></div>
                </label>
                {selectedPayment === 'stripe' && (
                  <div className="pay-mobile-box">
                    <Elements stripe={stripePromise}>
                      <StripeCheckout
                        total={total}
                        userEmail={user?.email}
                        orderId={`ORD${Date.now()}`}
                        onSuccess={handleStripeSuccess}
                        onError={handleStripeError}
                        API={API}
                      />
                    </Elements>
                  </div>
                )}


                <div className="pay-divider"><span>OR LOCAL PAYMENT</span></div>
                <label className={`pay-option ${selectedPayment === 'cash' ? 'active' : ''}`}>
                  <input type="radio" name="payment" value="cash" checked={selectedPayment === 'cash'} onChange={e => setSelectedPayment(e.target.value)} />
                  <span className="pay-opt-icon">💵</span>
                  <div><h5>Cash on Delivery</h5><p>Pay when you receive</p></div>
                </label>
                {selectedPayment === 'cash' && (
                  <div className="pay-mobile-box">
                    <div className="pay-mobile-row"><span>💵</span><strong>Pay cash when order arrives at your door</strong></div>
                    <div className="pay-mobile-row"><span>Amount:</span><strong>PKR {total.toLocaleString()}</strong></div>
                    <p style={{ fontSize: '11px', color: '#6b7280', margin: 0, textAlign: 'center' }}>🚚 Please keep the exact amount ready for the delivery person</p>
                  </div>
                )}
                <label className={`pay-option ${selectedPayment === 'easypaisa' ? 'active' : ''}`}>
                  <input type="radio" name="payment" value="easypaisa" checked={selectedPayment === 'easypaisa'} onChange={e => setSelectedPayment(e.target.value)} />
                  <span className="pay-opt-icon">📱</span>
                  <div><h5>Easypaisa</h5><p>Mobile wallet payment</p></div>
                </label>
                <label className={`pay-option ${selectedPayment === 'jazzcash' ? 'active' : ''}`}>
                  <input type="radio" name="payment" value="jazzcash" checked={selectedPayment === 'jazzcash'} onChange={e => setSelectedPayment(e.target.value)} />
                  <span className="pay-opt-icon">🎵</span>
                  <div><h5>JazzCash</h5><p>Mobile wallet payment</p></div>
                </label>
                {(paySettings.extraPayments || []).map((m, i) => (
                  <label key={i} className={`pay-option ${selectedPayment === `extra_${i}` ? 'active' : ''}`}>
                    <input type="radio" name="payment" value={`extra_${i}`} checked={selectedPayment === `extra_${i}`} onChange={e => setSelectedPayment(e.target.value)} />
                    <span className="pay-opt-icon">{m.icon}</span>
                    <div><h5>{m.name}</h5><p>{m.number}</p></div>
                  </label>
                ))}
                {(selectedPayment === 'easypaisa' || selectedPayment === 'jazzcash') && (
                  <div className="pay-mobile-box">
                    <div className="pay-mobile-row"><span>Name:</span><strong>{selectedPayment === 'easypaisa' ? paySettings.easypaisaName : paySettings.jazzcashName}</strong></div>
                    <div className="pay-mobile-row"><span>Account:</span><strong>{selectedPayment === 'easypaisa' ? paySettings.easypaisaNumber : paySettings.jazzcashNumber}</strong><button onClick={() => navigator.clipboard.writeText(selectedPayment === 'easypaisa' ? paySettings.easypaisaNumber : paySettings.jazzcashNumber)}>📋</button></div>
                    <div className="pay-mobile-row"><span>Amount:</span><strong>PKR {total.toLocaleString()}</strong></div>
                    <div className="pay-deeplink-btns">
                      <a
                        href={selectedPayment === 'easypaisa'
                          ? `easypaisa://send?to=${paySettings.easypaisaNumber}&amount=${total}`
                          : `jazzcash://send?to=${paySettings.jazzcashNumber}&amount=${total}`}
                        className="pay-app-btn"
                        onClick={e => {
                          setTimeout(() => {
                            window.location.href = selectedPayment === 'easypaisa'
                              ? `https://easypaisa.com.pk/paybill?msisdn=${paySettings.easypaisaNumber}&amount=${total}`
                              : `https://jazzcash.com.pk/send-money?to=${paySettings.jazzcashNumber}&amount=${total}`;
                          }, 1500);
                        }}
                      >
                        📱 Open {selectedPayment === 'easypaisa' ? 'Easypaisa' : 'JazzCash'} App
                      </a>
                    </div>
                    <label className="pay-upload-label">📤 Upload Screenshot<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPaymentScreenshot(e.target.files[0])} /></label>
                    {paymentScreenshot && <div className="pay-uploaded">✓ {paymentScreenshot.name}</div>}
                  </div>
                )}
                {selectedPayment?.startsWith('extra_') && (() => {
                  const idx = parseInt(selectedPayment.split('_')[1]);
                  const m = (paySettings.extraPayments || [])[idx];
                  return m ? (
                    <div className="pay-mobile-box">
                      <div className="pay-mobile-row"><span>Method:</span><strong>{m.name}</strong></div>
                      <div className="pay-mobile-row"><span>Account:</span><strong>{m.number}</strong><button onClick={() => navigator.clipboard.writeText(m.number)}>📋</button></div>
                      <div className="pay-mobile-row"><span>Amount:</span><strong>PKR {total.toLocaleString()}</strong></div>
                      <label className="pay-upload-label">📤 Upload Screenshot<input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setPaymentScreenshot(e.target.files[0])} /></label>
                      {paymentScreenshot && <div className="pay-uploaded">✓ {paymentScreenshot.name}</div>}
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
            <div className="button-group">
              <button className="back-btn" onClick={() => setStep('shipping')}>← Back</button>
              {selectedPayment !== 'stripe' && (
                <button className={`pay-btn ${processing || cartItems.length === 0 ? 'processing' : ''}`} onClick={processPayment} disabled={processing || cartItems.length === 0}>
                  {processing ? <><span className="spinner"></span>Processing...</> : cartItems.length === 0 ? '🛒 Cart is Empty' : 'Pay Now'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {deleteConfirm && (
        <ConfirmDialog
          message="Are you sure you want to remove this item from your cart?"
          onConfirm={() => handleRemoveItem(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      <Footer />
    </div>
  );
}

export default Payment;



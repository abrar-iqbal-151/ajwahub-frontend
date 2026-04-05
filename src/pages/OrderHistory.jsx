import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/OrderHistory.css';

import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';

const API = 'http://localhost:5000/api';

const statusColors = {
  'Paid': '#4ade80', 'Approved': '#4ade80', 'Pending Approval': '#fbbf24', 'Cancelled': '#f87171', 'Delivered': '#3b82f6'
};
const trackingColors = {
  'warehouse': '#fbbf24', 'shipping': '#60a5fa', 'delivered': '#4ade80'
};
const trackingLabels = {
  'warehouse': 'Warehouse', 'shipping': 'Shipping', 'delivered': 'Delivered'
};

function OrderHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (!userData) { navigate('/login'); return; }
    const u = JSON.parse(userData);
    setUser(u);
    fetch(`${API}/orders/user/${u.email}`)
      .then(r => r.json())
      .then(d => setOrders((d.orders || []).filter(o => o.trackingStatus === 'delivered' || o.status === 'Cancelled')))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { localStorage.removeItem('ajwaHub_currentUser'); setUser(null); navigate('/description'); };
  const isActive = (path) => location.pathname === path;

  const filtered = orders.filter(o =>
    !search || o.orderId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="oh-page">
      <Navbar />

      <div className="oh-container">
        <div className="oh-header">
          <span className="oh-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            My Orders
          </span>
          <h1>Order <span>History</span></h1>
          <p>Track and review all your past orders</p>
        </div>

        <div className="oh-toolbar">
          <input className="oh-search" placeholder="Search by Order ID..." value={search} onChange={e => setSearch(e.target.value)} />
          <span className="oh-count">{filtered.length} Orders</span>
        </div>

        {loading && <div className="oh-loading">Loading...</div>}

        {!loading && filtered.length === 0 && (
          <div className="oh-empty">
            <div>
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <h3>No Orders Yet</h3>
            <p>Your delivered and cancelled orders will appear here</p>
            <button onClick={() => navigate('/products')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop Now
            </button>
          </div>
        )}

        <div className="oh-list">
          {filtered.map(order => (
            <div key={order._id} className="oh-card">
              {/* HEADER */}
              <div className="oh-card-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div className="oh-card-left">
                  <span className="oh-order-id">#{order.orderId?.slice(-8)}</span>
                  <span className="oh-date">{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="oh-card-right">
                  <span className="oh-total">PKR {order.total?.toLocaleString()}</span>
                  <span className="oh-status" style={{ background: `${statusColors[order.status]}18`, color: statusColors[order.status], border: `1px solid ${statusColors[order.status]}40` }}>
                    {order.status}
                  </span>
                  <span className="oh-tracking" style={{ background: `${trackingColors[order.trackingStatus]}18`, color: trackingColors[order.trackingStatus], border: `1px solid ${trackingColors[order.trackingStatus]}40` }}>
                    {trackingLabels[order.trackingStatus] || '🏢 Warehouse'}
                  </span>
                  <span className="oh-arrow">
                    {expanded === order._id
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="18 15 12 9 6 15"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>}
                  </span>
                </div>
              </div>

              {/* EXPANDED */}
              {expanded === order._id && (
                <div className="oh-body">

                  {/* ROW 1 — Items + Address */}
                  <div className="oh-body-grid">

                    {/* ITEMS */}
                    <div className="oh-section">
                      <p className="oh-section-title">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        Order Items
                      </p>
                      {order.items?.map((item, i) => (
                        <div key={i} className="oh-item">
                          <img src={item.image} alt={item.name} onError={e => e.target.style.display='none'} />
                          <div className="oh-item-info">
                            <span>{item.name}</span>
                            <small>{item.weight}</small>
                          </div>
                          <span className="oh-item-qty">x{item.quantity}</span>
                          <span className="oh-item-price">PKR {((item.price||0)*(item.quantity||1)).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="oh-summary">
                        <div><span>Subtotal</span><span>PKR {order.subtotal?.toLocaleString()}</span></div>
                        <div><span>Shipping</span><span>PKR {order.shipping?.toLocaleString()}</span></div>
                        <div><span>Tax</span><span>PKR {order.tax?.toLocaleString()}</span></div>
                        <div className="oh-total-row"><span>Total</span><span>PKR {order.total?.toLocaleString()}</span></div>
                      </div>
                    </div>

                    {/* ADDRESS */}
                    <div className="oh-section">
                      <p className="oh-section-title">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                        Delivery Address
                      </p>
                      <div className="oh-info-cards">
                        <div className="oh-info-card"><span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><div><small>Name</small><strong>{order.shippingAddress?.fullName}</strong></div></div>
                        <div className="oh-info-card"><span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span><div><small>Phone</small><strong>{order.shippingAddress?.phone}</strong></div></div>
                        <div className="oh-info-card oh-info-card-full"><span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span><div><small>Address</small><strong>{order.shippingAddress?.address}</strong></div></div>
                        <div className="oh-info-card oh-info-card-full"><span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span><div><small>City</small><strong>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.zipCode}</strong></div></div>
                      </div>
                    </div>
                  </div>

                  {/* ROW 2 — Payment + Screenshot + Shipping */}
                  <div className="oh-body-grid">

                    {/* PAYMENT INFO */}
                    <div className="oh-section">
                      <p className="oh-section-title">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                        Payment Details
                      </p>
                      <div className="oh-info-cards">
                        <div className="oh-info-card">
                          <span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span>
                          <div><small>Method</small><strong style={{ textTransform: 'capitalize' }}>{order.paymentMethod}</strong></div>
                        </div>
                        <div className="oh-info-card">
                          <span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg></span>
                          <div><small>Status</small><strong style={{ color: statusColors[order.status] }}>{order.status}</strong></div>
                        </div>
                        <div className="oh-info-card">
                          <span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg></span>
                          <div><small>Amount Paid</small><strong style={{ color: '#4ade80' }}>PKR {order.total?.toLocaleString()}</strong></div>
                        </div>
                        <div className="oh-info-card">
                          <span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></span>
                          <div><small>Order Date</small><strong>{new Date(order.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>
                        </div>
                      </div>

                      {(order.shippingCompany || order.shippingId || order.shippingMessage) && (
                        <>
                          <p className="oh-section-title" style={{ marginTop: '16px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                            Shipping Info
                          </p>
                          <div className="oh-info-cards">
                            {order.shippingCompany && <div className="oh-info-card"><span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span><div><small>Courier</small><strong>{order.shippingCompany}</strong></div></div>}
                            {order.shippingId && <div className="oh-info-card"><span className="oh-info-icon"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></span><div><small>Tracking ID</small><strong style={{ color: '#60a5fa' }}>{order.shippingId}</strong></div></div>}
                          </div>
                          {order.shippingMessage && <div className="oh-ship-msg" style={{ marginTop: '10px' }}>{order.shippingMessage}</div>}
                        </>
                      )}
                    </div>

                    {/* SCREENSHOT */}
                    {order.paymentScreenshot ? (
                      <div className="oh-section">
                        <p className="oh-section-title">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          Payment Screenshot
                        </p>
                        <a href={order.paymentScreenshot} target="_blank" rel="noopener noreferrer" className="oh-screenshot-wrap">
                          <img src={order.paymentScreenshot} alt="Payment" className="oh-screenshot-img" onError={e => e.target.style.display='none'} />
                          <div className="oh-screenshot-overlay">
                            <span>View Full</span>
                          </div>
                        </a>
                        <p className="oh-screenshot-hint">Click image to open full size</p>
                      </div>
                    ) : (
                      <div className="oh-section">
                        <p className="oh-section-title">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          Payment Screenshot
                        </p>
                        <div style={{ textAlign: 'center', padding: '30px 20px', color: '#6b7280', fontSize: '13px' }}>
                          <div style={{ marginBottom: '8px', opacity: 0.4 }}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg></div>
                          No screenshot uploaded
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="oh-actions">
                    <button onClick={() => navigate('/tracking')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      Track Order
                    </button>
                    <button onClick={() => navigate('/products')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                      Shop Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

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
        <div className="login-footer-bottom">&copy; 2025 AjwaHub. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default OrderHistory;

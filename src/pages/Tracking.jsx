import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Tracking.css';

import Navbar from './Navbar';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const STEPS = [
  { key: 'pending',   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>, label: 'Payment Pending', desc: 'Waiting for admin to verify payment' },
  { key: 'warehouse', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>, label: 'Warehouse', desc: 'Order received & being prepared' },
  { key: 'shipping',  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>, label: 'Shipping', desc: 'Dispatched and in transit' },
  { key: 'delivered', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>, label: 'Delivered', desc: 'Order completed successfully' },
];

const statusOrder = { pending: 0, warehouse: 1, shipping: 2, delivered: 3 };

function Tracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) {
      const u = JSON.parse(userData);
      setUser(u);
      fetch(`${API}/api/orders/user/${u.email}`)
        .then(r => r.json())
        .then(d => { const o = (d.orders || []).filter(ord => ord.trackingStatus !== 'delivered' && ord.status !== 'Cancelled'); setOrders(o); if (o.length) setSelected(o[0]._id); })
        .catch(() => {
          const saved = JSON.parse(localStorage.getItem('ajwaHub_orders') || '[]');
          setOrders(saved);
          if (saved.length) setSelected(saved[0]._id || saved[0].orderId);
        });
    }
  }, [location.pathname]);

  const handleLogout = () => { localStorage.removeItem('ajwaHub_currentUser'); setUser(null); navigate('/description'); };
  const isActive = (path) => location.pathname === path;

  const activeOrder = orders.find(o => (o._id || o.orderId) === selected);
  const getTrackingStep = (order) => {
    if (!order) return 0;
    if (order.status === 'Pending Approval') return 0;
    if (order.trackingStatus === 'warehouse') return 1;
    if (order.trackingStatus === 'shipping') return 2;
    if (order.trackingStatus === 'delivered') return 3;
    return 1;
  };
  const currentStep = getTrackingStep(activeOrder);

  return (
    <div className="trk-page">
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

      <div className="trk-container">
        <div className="trk-header">
          <span className="trk-badge">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            Live Tracking
          </span>
          <h1>Order <span>Tracking</span></h1>
          <p>Track your orders in real time</p>
        </div>

        {orders.length === 0 ? (
          <div className="trk-empty">
            <div className="trk-empty-icon">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
            </div>
            <h3>No Active Orders</h3>
            <p>All your orders have been delivered, or you haven't placed any yet</p>
            <button onClick={() => navigate('/products')}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              Shop Now
            </button>
          </div>
        ) : (
          <div className="trk-layout">

            {/* LEFT — Order List */}
            <div className="trk-orders">
              <p className="trk-orders-title">Your Orders</p>
              {orders.map(o => {
                const id = o._id || o.orderId;
                const step = statusOrder[o.trackingStatus] ?? 0;
                const isActive = selected === id;
                return (
                  <div key={id} className={`trk-order-card ${isActive ? 'active' : ''}`} onClick={() => setSelected(id)}>
                    <div className="trk-oc-top">
                      <span className="trk-oc-id">#{o.orderId?.slice(-8)}</span>
                      <span className="trk-oc-total">PKR {o.total?.toLocaleString()}</span>
                    </div>
                    <div className="trk-oc-bottom">
                      <span className="trk-oc-method">{o.paymentMethod === 'card' ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>} {o.paymentMethod}</span>
                      <span className={`trk-oc-status ${o.status === 'Pending Approval' ? 'warehouse' : o.trackingStatus}`}>
                        {o.status === 'Pending Approval' ? 'Pending' : STEPS[getTrackingStep(o)]?.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RIGHT — Tracking Detail */}
            {activeOrder && (
              <div className="trk-detail">

                {/* Order Info */}
                <div className="trk-info-bar">
                  <div><small>Order ID</small><strong>#{activeOrder.orderId?.slice(-8)}</strong></div>
                  <div><small>Total</small><strong>PKR {activeOrder.total?.toLocaleString()}</strong></div>
                  <div><small>Payment</small><strong style={{ color: activeOrder.status === 'Approved' || activeOrder.status === 'Delivered' ? '#4ade80' : activeOrder.status === 'Pending Approval' ? '#fbbf24' : activeOrder.status === 'Cancelled' ? '#ef4444' : '#fbbf24' }}>{activeOrder.status === 'Pending Approval' ? 'Pending Approval' : activeOrder.status === 'Approved' ? 'Approved' : activeOrder.status === 'Delivered' ? 'Delivered' : activeOrder.status}</strong></div>
                  <div><small>Method</small><strong>{activeOrder.paymentMethod === 'card' ? 'Card' : activeOrder.paymentMethod === 'easypaisa' ? 'Easypaisa' : activeOrder.paymentMethod === 'jazzcash' ? 'JazzCash' : activeOrder.paymentMethod === 'cash' ? 'Cash on Delivery' : activeOrder.paymentMethod}</strong></div>
                  <div><small>Date</small><strong>{new Date(activeOrder.createdAt || Date.now()).toLocaleDateString()}</strong></div>
                  {activeOrder.shippingId && <div><small>Shipping ID</small><strong style={{ color: '#60a5fa' }}>{activeOrder.shippingId}</strong></div>}
                  {activeOrder.shippingCompany && <div><small>Courier</small><strong>{activeOrder.shippingCompany}</strong></div>}
                </div>

                {/* Shipping Address */}
                <div className="trk-address-box">
                  <p className="trk-items-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    Delivery Address
                  </p>
                  <div className="trk-addr-grid">
                    <div className="trk-addr-item"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span><div><small>Name</small><strong>{activeOrder.shippingAddress?.fullName}</strong></div></div>
                    <div className="trk-addr-item"><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span><div><small>Phone</small><strong>{activeOrder.shippingAddress?.phone}</strong></div></div>
                    <div className="trk-addr-item" style={{ gridColumn: '1/-1' }}><span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span><div><small>Address</small><strong>{activeOrder.shippingAddress?.address}, {activeOrder.shippingAddress?.city}, {activeOrder.shippingAddress?.state} {activeOrder.shippingAddress?.zipCode}</strong></div></div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="trk-timeline">
                  {STEPS.map((step, i) => {
                    const done = i < currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step.key} className={`trk-step ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                        <div className="trk-step-left">
                          <div className="trk-step-dot">
                            {done ? '✓' : step.icon}
                          </div>
                          {i < STEPS.length - 1 && <div className={`trk-step-line ${done ? 'done' : ''}`} />}
                        </div>
                        <div className="trk-step-content">
                          <h4>{step.label}</h4>
                          <p>{step.desc}</p>
                      {active && (
                        <>
                          <span className="trk-step-badge">
                            {step.key === 'pending' ? 'Awaiting Verification' : step.key === 'warehouse' ? 'Processing' : step.key === 'shipping' ? 'On the way' : 'Done!'}
                          </span>
                          {/* Shipping info — only on shipping step */}
                          {step.key === 'shipping' && (activeOrder.shippingCompany || activeOrder.shippingId || activeOrder.shippingMessage) && (
                            <div className="trk-ship-info">
                              {activeOrder.shippingCompany && (
                                <div className="trk-ship-row">
                                  <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></span>
                                  <div><small>Courier</small><strong>{activeOrder.shippingCompany}</strong></div>
                                </div>
                              )}
                              {activeOrder.shippingId && (
                                <div className="trk-ship-row">
                                  <span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
                                  <div><small>Tracking ID</small><strong>{activeOrder.shippingId}</strong></div>
                                </div>
                              )}
                              {activeOrder.shippingMessage && (
                                <div className="trk-ship-msg">
                                  {activeOrder.shippingMessage}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Items */}
                <div className="trk-items">
                  <p className="trk-items-title">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight:6,verticalAlign:'middle'}}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Items in this order
                  </p>
                  {activeOrder.items?.map((item, i) => (
                    <div key={i} className="trk-item">
                      <img src={item.image} alt={item.name} onError={e => e.target.style.display='none'} />
                      <div className="trk-item-info">
                        <span>{item.name}</span>
                        <small>{item.weight}</small>
                      </div>
                      <span className="trk-item-qty">x{item.quantity}</span>
                      <span className="trk-item-price">PKR {((item.price||0)*(item.quantity||1)).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

              </div>
            )}
          </div>
        )}
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

export default Tracking;




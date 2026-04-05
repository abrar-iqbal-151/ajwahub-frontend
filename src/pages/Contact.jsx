import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Contact.css';
import Navbar from './Navbar';

function Contact() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [info, setInfo] = useState({ location: 'Madinah, Saudi Arabia', phone: '+92 300 0000000', email: 'support@ajwahub.com', hours: 'Mon–Sat, 9am – 6pm' });

  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) setUser(JSON.parse(userData));
    fetch(`${API}/api/settings`).then(r => r.json()).then(d => { if (d.settings) setInfo(d.settings); }).catch(() => {});
  }, []);

  const handleLogout = () => { localStorage.removeItem('ajwaHub_currentUser'); setUser(null); navigate('/description'); };

  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setShowLoginModal(true); return; }
    try {
      await fetch(`${API}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } catch {}
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="contact-page">
      <Navbar />

      <div className="contact-wrapper">

        {/* LEFT INFO */}
        <div className="contact-info">
          <span className="contact-badge">📬 Get In Touch</span>
          <h1>Let's <span>Talk</span></h1>
          <p>Have a question, feedback, or want to place a bulk order? We're here to help.</p>

          <div className="contact-cards">
            <div className="contact-card">
              <div className="cc-icon">📍</div>
              <div><h4>Location</h4><p>{info.location}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">📞</div>
              <div><h4>Phone</h4><p>{info.phone}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">✉️</div>
              <div><h4>Email</h4><p>{info.email}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">🕐</div>
              <div><h4>Hours</h4><p>{info.hours}</p></div>
            </div>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="contact-form-box">
          <h2>Send a Message</h2>
          <p>We'll get back to you within 24 hours.</p>

          {sent && (
            <div className="contact-success">
              ✅ Message sent! We'll be in touch soon.
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="cf-row">
              <div className="cf-group">
                <label>Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="cf-group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="cf-group">
              <label>Subject</label>
              <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="cf-group">
              <label>Message</label>
              <textarea rows={5} placeholder="Write your message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="cf-submit">
              <span>Send Message</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      </div>

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Login Required</h3>
              <p className="modal-text">Please login or sign up to send a message</p>
            </div>
            <div className="modal-actions">
              <button className="btn-full btn-modal-primary" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-full btn-modal-secondary" onClick={() => navigate('/signup')}>Sign Up</button>
              <button className="btn-modal-cancel" onClick={() => setShowLoginModal(false)}>Cancel</button>
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
        <div className="login-footer-bottom">&copy; 2025 AjwaHub. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Contact;


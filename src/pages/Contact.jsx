import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import '../css/Contact.css';

function Contact() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    } catch (err) {
      // Fallback local display
      setSent(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
      setTimeout(() => setSent(false), 5000);
    }
    setLoading(false);
  };

  const selectSubjectShortcut = (subj) => {
    setForm(prev => ({ ...prev, subject: subj }));
  };

  return (
    <div className="contact-page">
      <Navbar />

      <div className="contact-wrapper">
        {/* LEFT COLUMN: E-commerce Boutique Details & Live AI Chat link */}
        <div className="contact-info-col">
          <div className="contact-badge-new">
            <span className="pulse-dot"></span>
            Boutique Support Hub
          </div>
          <h1 className="contact-main-title">
            Let's Craft Something <span>Beautiful</span>
          </h1>
          <p className="contact-sub-text">
            Have questions about our Premium Ajwa Selection, customized Gifting solutions, or bulk corporate orders? Drop us a line.
          </p>

          {/* Quick AI Assist Card */}
          <div className="ai-chat-card-shortcut" onClick={() => navigate('/ai')}>
            <div className="ai-card-glow"></div>
            <div className="ai-card-content">
              <span className="ai-sparkle-icon">✨</span>
              <div>
                <h4>Need Instant Answers?</h4>
                <p>Chat with AjwaHub AI Assistant for instant recommendations & order updates.</p>
              </div>
            </div>
            <span className="ai-card-arrow">→</span>
          </div>

          {/* Boutique Contact Cards */}
          <div className="modern-contact-cards">
            <div className="modern-cc-item">
              <div className="mcc-icon">📍</div>
              <div className="mcc-info">
                <span>Flagship Location</span>
                <p>Garden East, Karachi Pakistan</p>
              </div>
            </div>
            
            <div className="modern-cc-item">
              <div className="mcc-icon">📞</div>
              <div className="mcc-info">
                <span>Direct Support Line</span>
                <p><a href="tel:+923202017120">+92 3-202-017-120</a></p>
              </div>
            </div>

            <div className="modern-cc-item">
              <div className="mcc-icon">✉️</div>
              <div className="mcc-info">
                <span>Executive Email Address</span>
                <p><a href="mailto:abrarking141@gmail.com">abrarking141@gmail.com</a></p>
              </div>
            </div>

            <div className="modern-cc-item">
              <div className="mcc-icon">⏰</div>
              <div className="mcc-info">
                <span>Boutique Operating Hours</span>
                <p>Mon–Sat, 10am – 6pm PST</p>
              </div>
            </div>
          </div>

          {/* Social Connect links */}
          <div className="social-connect-wrap">
            <h5>Connect Instantly</h5>
            <div className="social-links-row">
              <a href="https://wa.me/923202017120" target="_blank" rel="noopener noreferrer" className="social-btn whatsapp-btn">
                <span>💬</span> WhatsApp Support
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-btn insta-btn">
                <span>📸</span> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Modern Glassmorphic Form Container */}
        <div className="contact-form-col">
          <div className="glass-form-card">
            <div className="glass-form-header">
              <h2>Send an Inquiry</h2>
              <p>Fill out the details below and our team will get back to you within 2 hours.</p>
            </div>

            {sent && (
              <div className="success-banner-modern">
                <span className="success-banner-icon">✅</span>
                <div>
                  <h4>Inquiry Transmitted!</h4>
                  <p>Thank you. Our boutique agent will contact you shortly.</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="modern-contact-form">
              <div className="mcf-row-split">
                <div className="mcf-field-group">
                  <label>Full Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Ahmed Khan" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="mcf-field-group">
                  <label>Email Address</label>
                  <input 
                    type="email" 
                    placeholder="e.g. ahmed@gmail.com" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    required 
                  />
                </div>
              </div>

              <div className="mcf-row-split">
                <div className="mcf-field-group">
                  <label>Phone Number (Optional)</label>
                  <div className="phone-input-split">
                    <span className="phone-prefix">🇵🇰 +92</span>
                    <input 
                      type="tel" 
                      placeholder="3XX XXXXXXX" 
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value })} 
                    />
                  </div>
                </div>

                <div className="mcf-field-group">
                  <label>What's this regarding?</label>
                  <select 
                    value={form.subject} 
                    onChange={e => setForm({ ...form, subject: e.target.value })} 
                    required
                  >
                    <option value="">-- Choose Category --</option>
                    <option value="Bulk Order Selection">Bulk / Corporate Order</option>
                    <option value="Delivery Schedule Enquiry">Delivery Query</option>
                    <option value="Product Premium Quality Inquiry">Premium Quality Inquiry</option>
                    <option value="Custom Gift Box Request">Custom Gift Box Request</option>
                    <option value="Other Feedback">Other Feedback</option>
                  </select>
                </div>
              </div>

              {/* Fast FAQ Subject Shortcut Tags */}
              <div className="faq-tags-group">
                <span>Quick Topics:</span>
                <div className="faq-tags-flex">
                  <button type="button" className="faq-tag-btn" onClick={() => selectSubjectShortcut("Bulk Order Selection")}>📦 Bulk Order</button>
                  <button type="button" className="faq-tag-btn" onClick={() => selectSubjectShortcut("Delivery Schedule Enquiry")}>🚚 Delivery query</button>
                  <button type="button" className="faq-tag-btn" onClick={() => selectSubjectShortcut("Custom Gift Box Request")}>🎁 Custom Gift</button>
                </div>
              </div>

              <div className="mcf-field-group">
                <label>Detailed Message</label>
                <textarea 
                  rows={4} 
                  placeholder="Tell us what you are looking for..." 
                  value={form.message} 
                  onChange={e => setForm({ ...form, message: e.target.value })} 
                  required 
                />
              </div>

              <button type="submit" className="mcf-submit-btn" disabled={loading}>
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Transmit Message</span>
                    <svg className="submit-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      <Footer />

      {/* 3D Background */}
      <div className="desc-bg-3d" style={{ position: 'fixed', inset: '0', zIndex: -1, pointerEvents: 'none', overflow: 'hidden' }}>
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" />
        <div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" />
        <div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="desc-bg-line" style={{ animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Contact;

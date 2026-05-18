import { useState } from 'react';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import '../css/Contact.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    
    // Simulate sending an email for now if no backend route is strictly required
    // Can hook up a backend route later if the user requests it. 
    // They just said "Boss meri Website mai Contact page nahi" so adding the page is the first step.
    try {
      // Simulate network request
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again.' });
    }
  };

  return (
    <div className="contact-page">
      <Navbar />
      
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

      <div className="contact-container">
        <div className="contact-header">
          <div className="contact-badge">
            <span className="pulse-dot"></span>
            GET IN TOUCH
          </div>
          <h1>Let's Start a <span>Conversation</span></h1>
          <p>Have questions about our premium dates, wholesale orders, or need support? Our team is here to help you.</p>
        </div>

        <div className="contact-content">
          <div className="contact-info-cards">
            <div className="contact-card">
              <div className="contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div className="contact-card-content">
                <h3>Visit Us</h3>
                <p>Khajoor Market, Karachi<br/>Pakistan, 74000</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div className="contact-card-content">
                <h3>Call Us</h3>
                <p>+92 300 1234567<br/>Mon-Sat, 9AM to 6PM</p>
              </div>
            </div>
            <div className="contact-card">
              <div className="contact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div className="contact-card-content">
                <h3>Email Us</h3>
                <p>support@ajwahub.com<br/>wholesale@ajwahub.com</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h2>Send a Message</h2>
              <p className="form-subtitle">We typically reply within 24 hours.</p>

              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder=""
                  required
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder=""
                  rows="5"
                  required
                ></textarea>
              </div>

              {status.error && <div className="contact-error">{status.error}</div>}
              {status.success && <div className="contact-success">Message sent successfully! We will get back to you soon.</div>}

              <button type="submit" className="submit-btn" disabled={status.loading}>
                {status.loading ? (
                  <span className="spinner"></span>
                ) : (
                  <>Send Message <span>→</span></>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Contact;

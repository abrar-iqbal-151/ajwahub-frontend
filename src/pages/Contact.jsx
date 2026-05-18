import { useState } from 'react';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import '../css/Contact.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Contact() {
  const [activeForm, setActiveForm] = useState('message');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState({ loading: false, success: false, error: null });

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [selectedProductOption, setSelectedProductOption] = useState('');
  const [ratingStatus, setRatingStatus] = useState({ loading: false, success: false });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: true, success: false, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus({ loading: false, success: true, error: null });
      setFormData({ name: '', email: '', subject: '', message: '' });
      setTimeout(() => setStatus(prev => ({ ...prev, success: false })), 5000);
    } catch (err) {
      setStatus({ loading: false, success: false, error: 'Failed to send message. Please try again.' });
    }
  };

  const handleRatingSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a star rating.');
    
    setRatingStatus({ loading: true, success: false });
    setTimeout(() => {
      if (activeForm === 'product') {
        const storedRatings = JSON.parse(localStorage.getItem('ajwa_product_ratings') || '[]');
        storedRatings.push({ 
          id: Date.now(),
          productId: selectedProductOption,
          rating: rating, 
          reviewText: reviewText, 
          date: new Date().toISOString() 
        });
        localStorage.setItem('ajwa_product_ratings', JSON.stringify(storedRatings));
      }

      setRatingStatus({ loading: false, success: true });
      setRating(0);
      setReviewText('');
      if (activeForm === 'product') setSelectedProductOption('');
      setTimeout(() => setRatingStatus({ loading: false, success: false }), 5000);
    }, 1500);
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

          <div className="contact-right-side">
            <div className="contact-tabs">
              <button 
                className={`contact-tab-btn ${activeForm === 'message' ? 'active' : ''}`}
                onClick={() => setActiveForm('message')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span>Message</span>
              </button>
              <button 
                className={`contact-tab-btn ${activeForm === 'product' ? 'active' : ''}`}
                onClick={() => setActiveForm('product')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>Product Rating</span>
              </button>
              <button 
                className={`contact-tab-btn ${activeForm === 'website' ? 'active' : ''}`}
                onClick={() => setActiveForm('website')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                <span>Website Review</span>
              </button>
            </div>

            <div className="contact-form-wrapper">

            {activeForm === 'message' && (
              <form className="contact-form" onSubmit={handleSubmit}>
                <h2>Send a Message</h2>
                <p className="form-subtitle">We typically reply within 24 hours.</p>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-group">
                  <label>Subject</label>
                  <input type="text" name="subject" value={formData.subject} onChange={handleChange} required />
                </div>

                <div className="form-group">
                  <label>Message</label>
                  <textarea name="message" value={formData.message} onChange={handleChange} rows="5" required></textarea>
                </div>

                {status.error && <div className="contact-error">{status.error}</div>}
                {status.success && <div className="contact-success">Message sent successfully! We will get back to you soon.</div>}

                <button type="submit" className="submit-btn" disabled={status.loading}>
                  {status.loading ? <span className="spinner"></span> : <>Send Message <span>→</span></>}
                </button>
              </form>
            )}

            {activeForm === 'product' && (
              <form className="rating-form" onSubmit={handleRatingSubmit}>
                <h2>Rate our Products</h2>
                <p className="form-subtitle">Let us know how much you loved our premium quality dates overall.</p>

                <div className="star-selection" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star}
                      className={`rating-star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>

                <div className="form-group">
                  <label>Your Review</label>
                  <textarea rows="4" placeholder="Tell us about the taste and quality..." value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
                </div>

                {ratingStatus.success && <div className="contact-success">⭐ Thank you for rating our product!</div>}

                <button type="submit" className="submit-btn" disabled={ratingStatus.loading || rating === 0}>
                  {ratingStatus.loading ? <span className="spinner"></span> : 'Submit Rating'}
                </button>
              </form>
            )}

            {activeForm === 'website' && (
              <form className="rating-form" onSubmit={handleRatingSubmit}>
                <h2>Website Feedback</h2>
                <p className="form-subtitle">How was your shopping experience on AjwaHub?</p>

                <div className="star-selection" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg 
                      key={star}
                      className={`rating-star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                  ))}
                </div>

                <div className="form-group">
                  <label>Suggestions or Feedback</label>
                  <textarea rows="4" placeholder="What can we improve?" value={reviewText} onChange={(e) => setReviewText(e.target.value)} required />
                </div>

                {ratingStatus.success && <div className="contact-success">⭐ Thank you! Your feedback helps us improve.</div>}

                <button type="submit" className="submit-btn" disabled={ratingStatus.loading || rating === 0}>
                  {ratingStatus.loading ? <span className="spinner"></span> : 'Submit Feedback'}
                </button>
              </form>
            )}

            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default Contact;

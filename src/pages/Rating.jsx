import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import '../css/Rating.css';

function Rating() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [status, setStatus] = useState({ loading: false, success: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a star rating.');
    
    setStatus({ loading: true, success: false });
    // Simulate API call
    setTimeout(() => {
      setStatus({ loading: false, success: true });
      setRating(0);
      setReview('');
      setTimeout(() => setStatus({ loading: false, success: false }), 5000);
    }, 1500);
  };

  return (
    <div className="rating-page">
      <Navbar />
      
      <div className="rating-bg-3d">
        <div className="rating-bg-glow" />
        <div className="rating-bg-grid" />
      </div>

      <div className="rating-container">
        <div className="rating-form-wrapper">
          <div className="rating-header">
            <h2>Rate Your Experience</h2>
            <p>Your feedback helps us provide the best premium dates and service.</p>
          </div>

          <form onSubmit={handleSubmit} className="rating-form">
            <div className="star-selection">
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
              <label>Tell us more (Optional)</label>
              <textarea 
                rows="4" 
                placeholder="What did you like about AjwaHub?"
                value={review}
                onChange={(e) => setReview(e.target.value)}
              />
            </div>

            {status.success && (
              <div className="rating-success">
                ⭐ Thank you! Your premium review has been submitted successfully.
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={status.loading || rating === 0}>
              {status.loading ? <span className="spinner"></span> : 'Submit Rating'}
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Rating;

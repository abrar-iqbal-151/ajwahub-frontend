import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Home.css';
import Navbar from './Navbar';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    return u ? JSON.parse(u) : null;
  });
  const [currentSlide, setCurrentSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);
  const [homeContent, setHomeContent] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (u) setUser(JSON.parse(u));
  }, [location.key]);

  useEffect(() => {
    fetch(`${API}/home-content`).then(r => r.json()).then(d => setHomeContent(d.content)).catch(() => {});
    fetch(`${API}/content/reviews`).then(r => r.json()).then(d => setReviews(d.reviews || [])).catch(() => {});
  }, []);

  const images = homeContent?.sliderImages || ['/home mock 1.png', '/home mock 2.png', '/home mock 3.png'];

  useEffect(() => {
    const interval = setInterval(() => setCurrentSlide(p => (p + 1) % images.length), 2500);
    return () => clearInterval(interval);
  }, [images.length]);

  useEffect(() => {
    if (reviews.length === 0) return;
    const interval = setInterval(() => setReviewSlide(p => (p + 1) % reviews.length), 2000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const [sectionSlides, setSectionSlides] = useState({});

  // Auto slide for each section on mobile
  useEffect(() => {
    if (!homeContent?.sections) return;
    const intervals = homeContent.sections.map(section => {
      return setInterval(() => {
        setSectionSlides(prev => ({
          ...prev,
          [section.key]: ((prev[section.key] || 0) + 1) % section.items.length
        }));
      }, 2500);
    });
    return () => intervals.forEach(clearInterval);
  }, [homeContent?.sections]);

  const defaultStats = [
    { number: '50K+', label: 'Happy Customers' },
    { number: '100%', label: 'Authentic Products' },
    { number: '24/7', label: 'Customer Support' },
    { number: '4.9★', label: 'Average Rating' }
  ];

  return (
    <div className="home-page">
      <Navbar />

      {/* SLIDER */}
      <div className="image-slider">
        <div className="slider-container">
          <div className="slides-wrapper" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
            {images.map((image, i) => (
              <div key={i} className="slide">
                <img src={image} alt={`Slide ${i + 1}`} className="slide-image" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PACK IMAGES */}
      <div className="pack-images">
        <div className="section-header">
          <h2 className="pack-section-title">🌴 Our Premium Date Collections</h2>
        </div>
        <div className="pack-grid">
          <div className="pack-card featured" onClick={() => navigate('/products')}><img src="/Pack 1.jpg" alt="Premium Ajwa Dates" className="pack-image" /><h3 className="pack-title">Premium Ajwa Dates</h3></div>
          <div className="pack-card" onClick={() => navigate('/products')}><img src="/pack 2.jpg" alt="Dates" className="pack-image" /><h3 className="pack-title">Dates</h3></div>
          <div className="pack-card" onClick={() => navigate('/products')}><img src="/pack 3.jpg" alt="Royal Medjool Dates" className="pack-image" /><h3 className="pack-title">Royal Medjool Dates</h3></div>
          <div className="pack-card" onClick={() => navigate('/products')}><img src="/pack 4.jpg" alt="Dry Fruits" className="pack-image" /><h3 className="pack-title">Dry Fruits</h3></div>
        </div>
      </div>

      {/* DYNAMIC SECTIONS */}
      {homeContent?.sections?.map(section => (
        <div key={section.key} className="premium-products-section">
          <div className="section-header">
            <h2 className="section-title">{section.title}</h2>
          </div>

          {/* DESKTOP GRID */}
          <div className="premium-products-grid desktop-only">
            {section.items.map((item, i) => (
              <div key={i} className="premium-product-card">
                {item.video
                  ? (
                    <div className="premium-video-wrap">
                      <video src={item.video} className="premium-product-image" playsInline muted loop
                        onMouseEnter={e => e.target.play()}
                        onMouseLeave={e => { e.target.pause(); e.target.currentTime = 0; }}
                      />
                      <div className="premium-play-icon">▶</div>
                    </div>
                  )
                  : <img src={item.image} alt={item.name} className="premium-product-image" />}
                <h4 className="premium-product-name">{item.name}</h4>
              </div>
            ))}
          </div>

          {/* MOBILE SLIDER */}
          <div className="mobile-only">
            <div className="mob-section-slider">
              <div className="mob-section-slides" style={{ transform: `translateX(-${(sectionSlides[section.key] || 0) * 100}%)` }}>
                {section.items.map((item, i) => (
                  <div key={i} className="mob-section-slide">
                    {item.video
                      ? (
                        <div className="premium-video-wrap" style={{ borderRadius: '1.2rem', marginBottom: 0 }}>
                          <video src={item.video} className="mob-slide-media" playsInline muted loop
                            onTouchStart={e => e.target.play()}
                          />
                          <div className="premium-play-icon">▶</div>
                        </div>
                      )
                      : <img src={item.image} alt={item.name} className="mob-slide-media" />}
                    <h4 className="premium-product-name" style={{ marginTop: '8px' }}>{item.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* DISCOUNT BANNER */}
      <div className="discount-section">
        <div className="discount-banner">
          <h2>{homeContent?.discountTitle || '🎉 50% OFF'}</h2>
          <p>{homeContent?.discountText || '✨ Limited Time Offer on Premium Products! ✨'}</p>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-section">
        <div className="stats-container">
          {(homeContent?.stats || defaultStats).map((stat, i) => (
            <div key={i} className="stat-card">
              <h3 className="stat-number">{stat.number}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* REVIEWS */}
      <div className="reviews-section">
        <div className="section-header"><h2 className="section-title">⭐ Customer Reviews</h2></div>
        <div className="reviews-slider-wrap">
          <div className="reviews-slider-inner" style={{ transform: `translateX(-${reviewSlide * 100}%)` }}>
            {reviews.map((r, i) => (
              <div key={i} className="review-slide-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <div className="reviewer-avatar">{r.name.charAt(0).toUpperCase()}</div>
                    <div><h4 className="reviewer-name">{r.name}</h4></div>
                  </div>
                  <div className="review-rating">
                    {[...Array(5)].map((_, j) => (
                      <span key={j} style={{ color: j < Math.floor(r.rating) ? '#fbbf24' : '#555', fontSize: '18px' }}>★</span>
                    ))}
                    <span style={{ color: '#9ca3af', fontSize: '13px', marginLeft: '4px' }}>({r.rating})</span>
                  </div>
                </div>
                <p className="review-text">"{r.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div className="features-section">
        <div className="section-header"><h2 className="section-title">✨ Why Choose AjwaHub?</h2></div>
        <div className="features-grid">
          {[
            { icon: '🌿', title: '100% Natural', desc: 'No artificial additives or preservatives' },
            { icon: '🏆', title: 'Premium Quality', desc: 'Handpicked and quality tested' },
            { icon: '🚚', title: 'Fast Delivery', desc: 'Free shipping on orders above PKR 2000' },
            { icon: '💯', title: 'Money Back Guarantee', desc: '30-day return policy, no questions asked' }
          ].map((f, i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
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
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
            </a>
            <a href="#" aria-label="TikTok">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          </div>
        </div>
        <div className="login-footer-bottom">
          &copy; 2025 AjwaHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default Home;

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Home.css';
import Navbar from './Navbar';
import Footer from '../components/Footer';

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
  const [paymentIcons, setPaymentIcons] = useState([]);

  useEffect(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (u) setUser(JSON.parse(u));
  }, [location.key]);

  useEffect(() => {
    fetch(`${API}/home-content`).then(r => r.json()).then(d => setHomeContent(d.content)).catch(() => { });
    fetch(`${API}/content/reviews`).then(r => r.json()).then(d => setReviews(d.reviews || [])).catch(() => { });
    fetch(`${API}/content/payment-icons`).then(r => r.json()).then(d => setPaymentIcons(d.icons || [])).catch(() => { });
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
        <div key={section.key} className={`premium-products-section section-${section.key}`}>

          <div className="section-header">
            <h2 className="section-title">{section.title}</h2>
          </div>

          {/* DESKTOP GRID */}
          <div className="premium-products-grid desktop-only">
            {section.items.map((item, i) => (
              <div key={i} className="premium-product-card" onClick={() => navigate(section.title?.toUpperCase() === 'PREMIUM COLLECTION' ? '/premium' : section.title?.toUpperCase() === 'SPECIAL GIFT BOXES' ? '/gifting' : section.title?.toUpperCase() === 'FITNESS & WELLNESS' ? '/gymai' : '/products')} style={{ cursor: 'pointer' }}>
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
                  <div key={i} className="mob-section-slide" onClick={() => navigate(section.title?.toUpperCase() === 'PREMIUM COLLECTION' ? '/premium' : section.title?.toUpperCase() === 'SPECIAL GIFT BOXES' ? '/gifting' : section.title?.toUpperCase() === 'FITNESS & WELLNESS' ? '/gymai' : '/products')} style={{ cursor: 'pointer', padding: '0 8px' }}>
                    <div className="premium-product-card" style={{ margin: 0, height: '100%' }}>
                      {item.video
                        ? (
                          <div className="premium-video-wrap" style={{ borderRadius: '1.8rem 0.3rem 1.8rem 0.3rem', marginBottom: '12px' }}>
                            <video src={item.video} className="mob-slide-media" playsInline muted loop
                              onTouchStart={e => e.target.play()}
                              style={{ borderRadius: '1.8rem 0.3rem 1.8rem 0.3rem', height: '180px' }}
                            />
                            <div className="premium-play-icon">▶</div>
                          </div>
                        )
                        : <img src={item.image} alt={item.name} className="mob-slide-media" style={{ borderRadius: '1.8rem 0.3rem 1.8rem 0.3rem', height: '180px', marginBottom: '12px' }} />}
                      <h4 className="premium-product-name">{item.name}</h4>
                    </div>
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
          <div className="reviews-slider-inner" style={{ transform: `translateX(calc(-${reviewSlide} * var(--slide-width, 100%)))` }}>
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

      <Footer />
    </div>
  );
}

export default Home;

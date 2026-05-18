import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Description.css';
import '../css/AiSection.css';

import Footer from '../components/Footer';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Description() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('ajwaHub_theme') || 'light');
  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('ajwaHub_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [productSlide, setProductSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);

  const [heroes, setHeroes] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [feature, setFeature] = useState(null);
  const [deliveryMap, setDeliveryMap] = useState(null);
  const [about, setAbout] = useState(null);
  const [aboutSlide, setAboutSlide] = useState(0);
  const [paymentIcons, setPaymentIcons] = useState([]);
  const [aiSection, setAiSection] = useState(null);

  const [selectedWeight, setSelectedWeight] = useState('1kg Special Box');
  const [productRatings, setProductRatings] = useState({ average: 4.9, total: 120 });
  const [modalHoverStar, setModalHoverStar] = useState(0);
  const [modalRatingStatus, setModalRatingStatus] = useState(null);

  const handleModalRate = async (star) => {
    if (modalRatingStatus === 'success') return;
    setModalRatingStatus('submitting');
    
    try {
      await fetch(`${API}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: selectedProduct?.id || 'unknown',
          productName: selectedProduct?.name || 'Unknown Product',
          rating: star,
          reviewText: ''
        })
      });

      const stored = JSON.parse(localStorage.getItem('ajwa_product_ratings') || '[]');
      stored.push({ id: Date.now(), productId: selectedProduct?.id || 'unknown', rating: star, reviewText: '', date: new Date().toISOString() });
      localStorage.setItem('ajwa_product_ratings', JSON.stringify(stored));
      
      const sum = stored.reduce((acc, curr) => acc + curr.rating, 0);
      const baseScore = 4.9 * 120;
      const newScore = ((baseScore + sum) / (120 + stored.length)).toFixed(1);
      setProductRatings({ average: newScore, total: 120 + stored.length });
      
      setModalRatingStatus('success');
      setTimeout(() => setModalRatingStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setModalRatingStatus(null);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      const stored = JSON.parse(localStorage.getItem('ajwa_product_ratings') || '[]');
      if (stored.length > 0) {
        const sum = stored.reduce((acc, curr) => acc + curr.rating, 0);
        const baseScore = 4.9 * 120;
        const newScore = ((baseScore + sum) / (120 + stored.length)).toFixed(1);
        setProductRatings({ average: newScore, total: 120 + stored.length });
      }
    }
  }, [selectedProduct]);

  const getPriceForWeight = (basePrice, weight) => {
    if (weight.includes('500g')) return Math.round(basePrice * 0.55);
    if (weight.includes('2kg')) return basePrice * 2 - 500;
    if (weight.includes('3kg')) return basePrice * 3 - 700;
    if (weight.includes('5kg')) return basePrice * 5 - 1500;
    return basePrice;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setAboutSlide(prev => (prev + 1) % (about?.images?.length || 4));
    }, 2500);
    return () => clearInterval(timer);
  }, [about]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/content/heroes`).then(r => r.json()),
      fetch(`${API}/content/products`).then(r => r.json()),
      fetch(`${API}/content/reviews`).then(r => r.json()),
      fetch(`${API}/content/feature`).then(r => r.json()),
      fetch(`${API}/content/delivery-map`).then(r => r.json()),
      fetch(`${API}/content/about`).then(r => r.json()),
      fetch(`${API}/content/payment-icons`).then(r => r.json()),
      fetch(`${API}/content/ai-section`).then(r => r.json()),
    ]).then(([h, p, r, f, d, a, pi, ai]) => {

      setHeroes(h.heroes || []);
      setProducts(p.products || []);
      setReviews(r.reviews || []);
      setFeature(f.feature || null);
      setDeliveryMap(d.deliveryMap || null);
      setAbout(a.about || null);
      setPaymentIcons(pi.icons || []);
      setAiSection(ai.aiSection || null);
    }).catch(() => { });

  }, []);

  const handleProductClick = (product) => {
    setSelectedWeight('1kg Special Box');
    setSelectedProduct(product);
    setShowProductDetails(true);
  };
  const closeProductDetails = () => {
    setShowProductDetails(false);
    setSelectedProduct(null);
    setSelectedWeight('1kg Special Box');
  };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'star filled' : 'star'}>★</span>
    ));

  const hero1 = heroes.find(h => h.key === 'hero1');
  const hero2 = heroes.find(h => h.key === 'hero2');

  return (
    <div className="description-page">
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
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
            <span className="nav-logo-text">AjwaHub</span>
          </div>
          <div className="nav-buttons">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
        </div>
      </nav>

      <main className="container">
        {hero1 && (
          <section className="hero">
            <video className="hero-video" autoPlay muted loop playsInline>
              <source src={hero1.video} type="video/mp4" />
            </video>
            <div className="hero-gradient" />
            <div className="hero-content">
              <h1 className="hero-title">{hero1.title}</h1>
              <p className="hero-text">{hero1.text}</p>
            </div>
          </section>
        )}
        {hero1 && (
          <div className="hero-offer-strip">
            <span className="hero-offer-flash">⚡</span>
            <span className="hero-offer-text">LIMITED TIME OFFER</span>
            <span className="hero-offer-badge">50% OFF</span>
            <span className="hero-offer-text">ON ALL PREMIUM DATES</span>
            <span className="hero-offer-flash">⚡</span>
          </div>
        )}

        {hero2 && (
          <section className="hero hero--right">
            <video className="hero-video" autoPlay muted loop playsInline>
              <source src={hero2.video} type="video/mp4" />
            </video>
            <div className="hero-gradient hero-gradient--right" />
            <div className="hero-content hero-content--right">
              <h1 className="hero-title">{hero2.title}</h1>
              <p className="hero-text">{hero2.text}</p>
            </div>
          </section>
        )}
        {hero2 && (
          <div className="hero-offer-strip">
            <span className="hero-offer-flash">🔥</span>
            <span className="hero-offer-text">EXCLUSIVE DEAL</span>
            <span className="hero-offer-badge">50% OFF</span>
            <span className="hero-offer-text">FREE DELIVERY ABOVE PKR 2000</span>
            <span className="hero-offer-flash">🔥</span>
          </div>
        )}
      </main>

      {/* FEATURE SECTION */}
      <section className="desc-feature-section">
        <h3 className="section-title" style={{ gridColumn: '1/-1', textAlign: 'center', marginBottom: '0' }}>Our Premium AjwaHub</h3>
        <div className="desc-feature-img-wrap">
          <div className="desc-float-single">
            {feature && feature.images && feature.images.length > 0 ? (
              feature.images.map((img, i) => (
                <div key={i} className={`desc-float-item desc-float-item${i + 1}`}>
                  <img src={img} alt={`P${i + 1}`} onError={e => e.target.src = '/dates.png'} />
                </div>
              ))
            ) : (
              <>
                <div className="desc-float-item desc-float-item1"><img src="/Product 1.png" alt="P1" onError={e => e.target.src = '/dates.png'} /></div>
                <div className="desc-float-item desc-float-item2"><img src="/Product 2.png" alt="P2" onError={e => e.target.src = '/dates.png'} /></div>
                <div className="desc-float-item desc-float-item3"><img src="/Product 3.png" alt="P3" onError={e => e.target.src = '/dates.png'} /></div>
                <div className="desc-float-item desc-float-item4"><img src="/Product 4.png" alt="P4" onError={e => e.target.src = '/dates.png'} /></div>
              </>
            )}
          </div>
        </div>
        <div className="desc-feature-content">
          <h2 className="desc-feature-title">{feature ? feature.title.split(' ').slice(0, 2).join(' ') : 'Why Choose'} <span>{feature ? feature.title.split(' ').slice(2).join(' ') : 'AjwaHub?'}</span></h2>
          <p className="desc-feature-text">{feature ? feature.description : 'We bring you the finest handpicked dates and dry fruits straight from the source. Every product is carefully selected for freshness, taste, and nutritional value.'}</p>
          <div className="desc-feature-list">
            {feature && feature.features ? feature.features.map((item, i) => (
              <div key={i} className="desc-feature-item"><span>{item.icon}</span><p>{item.text}</p></div>
            )) : (
              <>
                <div className="desc-feature-item"><span>✅</span><p>100% Natural & Pure</p></div>
                <div className="desc-feature-item"><span>📦</span><p>Premium Packaging</p></div>
                <div className="desc-feature-item"><span>🚚</span><p>Fast Delivery Across Pakistan</p></div>
                <div className="desc-feature-item"><span>⭐</span><p>Trusted by 50,000+ Customers</p></div>
              </>
            )}
          </div>
          <button className="desc-feature-btn" onClick={() => navigate('/signup')}>Shop Now →</button>
        </div>
      </section>
      
      {/* AI SECTION */}
      {aiSection && (
        <section className="desc-ai-section">
          <div className="desc-ai-content">
            <div className="desc-ai-badge">{aiSection.badge}</div>
            <h2 className="desc-ai-title">{aiSection.title.split(' ').slice(0, -2).join(' ')} <span>{aiSection.title.split(' ').slice(-2).join(' ')}</span></h2>
            <p className="desc-ai-text">{aiSection.description}</p>
            <div className="desc-ai-list">
              {aiSection.features.map((f, i) => (
                <div key={i} className="desc-ai-item">
                  <span className="desc-ai-icon-glow">{f.icon}</span>
                  <div className="desc-ai-item-text">
                    <h4>{f.title}</h4>
                    <p>{f.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="desc-ai-btn" onClick={() => setShowLoginModal(true)}>Explore AjwaHub AI →</button>
          </div>

          <div className="desc-ai-img-wrap">
            <div className="desc-ai-video-frame">
              <video 
                src={aiSection.video} 
                className="desc-ai-video" 
                autoPlay 
                muted 
                loop 
                playsInline
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.classList.add('video-placeholder');
                }}
              />
              <div className="desc-ai-video-overlay">
                <div className="scan-line" />
                <div className="ai-status-pulse" />
              </div>
              <div className="desc-ai-frame-glow" />
            </div>
          </div>
        </section>
      )}






      {products.length > 0 && (
        <section className="products-section">
          <div className="products-inner">
            <div className="section-header">
              <h3 className="section-title">The Premium Collection</h3>
              <h2 style={{ fontFamily: "'Amiri', serif", color: "#c5a059", fontSize: "2rem", marginBottom: "15px" }}>مجموعة مختارة بعناية</h2>
              <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6", fontSize: "1.1rem" }}>
                Experience the finest handpicked dates and natural superfoods, delivered from our farms to your doorstep with love and purity.
              </p>
              <div className="section-divider" />
            </div>

            {/* Desktop carousel */}
            <div className="products-carousel desc-desktop-only">
              <button className="carousel-arrow carousel-arrow-left" onClick={() => setProductSlide(Math.max(0, productSlide - 5))}>❮</button>
              <div className="products-grid">
                {products.slice(productSlide, productSlide + 5).map((product) => (
                  <div key={product.id} className="product-card">
                    <div className="product-image" onClick={() => handleProductClick(product)}>
                      <img src={product.image} alt={product.name} onError={e => { e.target.src = '/dates.png'; }} />
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <div className="discount-tag">{product.discount}</div>
                      <button className="small-add-to-cart-btn" onClick={() => setShowLoginModal(true)} disabled={!product.stock}>Add to Cart</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-arrow carousel-arrow-right" onClick={() => setProductSlide(Math.min(products.length - 5, productSlide + 5))}>❯</button>
            </div>
            {/* Mobile grid */}
            <div className="desc-mobile-grid">
              {products.map((product) => (
                <div key={product.id} className="desc-mob-card" onClick={() => handleProductClick(product)}>
                  <div className="desc-mob-img">
                    <img src={product.image} alt={product.name} onError={e => { e.target.src = '/dates.png'; }} />
                    {product.discount && <span className="desc-mob-badge">{product.discount}</span>}
                  </div>
                  <div className="desc-mob-info">
                    <h4>{product.name}</h4>
                    <button className="desc-mob-btn" onClick={e => { e.stopPropagation(); setShowLoginModal(true); }} disabled={!product.stock}>Add to Cart</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GIFTING SECTION */}
      <section className="desc-gifting-section">
        <div className="desc-gifting-img-wrap">
          <div className="desc-gifting-frame">
            <img src="/Gift 2.png" alt="AjwaHub Premium Gifting Box" className="desc-gifting-img" />
            <div className="desc-gifting-video-overlay">
              <div className="gifting-scan-line" />
              <div className="gifting-status-pulse" />
            </div>
            <div className="desc-gifting-frame-glow" />
          </div>
          {/* Layered Floating Mini-Card for Extra Premium Look */}
          <div className="gifting-floating-card">
            <span className="floating-card-icon">🎁</span>
            <div className="floating-card-details">
              <h4>Special Edition</h4>
              <p>Royal Gift Boxes</p>
            </div>
          </div>
        </div>

        <div className="desc-gifting-content">
          <div className="desc-gifting-badge">💝 ELEGANT GIFTING</div>
          <h2 className="desc-gifting-title">
            Share Health & Purity With <span>Our Gift Collections</span>
          </h2>
          <p className="desc-gifting-text">
            Give the gift of premium wellness and taste. Our handpicked organic dates, signature honey infusions, and exotic dry fruits are elegantly packed in custom luxury briefcases and artisan boxes. Designed perfectly for family celebrations, corporate events, and special moments of sharing.
          </p>
          <div className="desc-gifting-features">
            <div className="desc-gifting-feat-item">
              <span className="desc-gifting-icon-glow">✨</span>
              <div className="desc-gifting-item-text">
                <h4>Customized Luxury Packaging</h4>
                <p>Sophisticated premium boxes, briefcases, and custom wooden cases with personalized gift tags.</p>
              </div>
            </div>
            <div className="desc-gifting-feat-item">
              <span className="desc-gifting-icon-glow">🏆</span>
              <div className="desc-gifting-item-text">
                <h4>100% Handpicked Quality</h4>
                <p>Sourced directly from selected farms, sorted, and packed to pristine hygiene standards.</p>
              </div>
            </div>
          </div>
          <button className="desc-gifting-btn" onClick={() => setShowLoginModal(true)}>
            Explore Gifting Collections →
          </button>
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="reviews-carousel-section">
          <div className="reviews-carousel-inner">
            <div className="section-header">
              <h3 className="section-title">⭐ Customer Reviews</h3>
              <div className="section-divider" />
            </div>
            {/* Desktop carousel */}
            <div className="reviews-carousel desc-desktop-only">
              <button className="carousel-arrow carousel-arrow-left" onClick={() => setReviewSlide(Math.max(0, reviewSlide - 3))}>❮</button>
              <div className="reviews-carousel-grid">
                {reviews.slice(reviewSlide, reviewSlide + 3).map((review, i) => (
                  <div key={i} className="review-carousel-card">
                    <div className="review-stars">{renderStars(review.rating)}</div>
                    <p className="review-text">"{review.text}"</p>
                    <h4 className="review-author">{review.name}</h4>
                  </div>
                ))}
              </div>
              <button className="carousel-arrow carousel-arrow-right" onClick={() => setReviewSlide(Math.min(reviews.length - 3, reviewSlide + 3))}>❯</button>
            </div>
            {/* Mobile scroll */}
            <div className="desc-mob-reviews">
              {reviews.map((review, i) => (
                <div key={i} className="desc-mob-review-card">
                  <div className="desc-mob-stars">{renderStars(review.rating)}</div>
                  <p>"{review.text}"</p>
                  <h4>{review.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DELIVERY MAP SECTION */}
      {deliveryMap && (
        <section className="desc-map-section">
          <div className="desc-map-header">
            <h3 className="desc-map-title">
              {deliveryMap.title.split(' ').slice(0, 2).join(' ')} <span className="desc-map-highlight">{deliveryMap.title.split(' ').slice(2).join(' ')}</span>
            </h3>
          </div>

          <img
            src={deliveryMap.mapImage}
            alt="Pakistan Delivery Map"
            className="desc-map-image"
            loading="eager"
            onError={e => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.5);"><p style="font-size: 3rem; margin-bottom: 16px;">🗺️</p><p style="font-size: 1.2rem; font-weight: 600;">Map Image Not Found</p><p style="font-size: 0.9rem; margin-top: 8px;">Please upload a map image from Admin Panel</p></div>';
            }}
          />
        </section>
      )}

      {/* ABOUT SECTION */}
      <section className="desc-about-section">
        <div className="desc-about-content">
          <div className="desc-about-left">
            <h3 className="desc-about-title">{about?.title || 'How Our Dates Are Grown'}</h3>
            {(about?.paragraphs || [
              'Our premium dates are cultivated by skilled farmers who have perfected the art of date farming over generations. The journey begins with carefully selected date palm trees planted in nutrient-rich soil.',
              'Farmers meticulously water the palms using traditional irrigation methods, ensuring each tree receives the perfect amount of moisture. The dates are hand-pollinated during the flowering season to guarantee the best quality fruit.',
              'As the dates ripen under the warm sun, they develop their natural sweetness and rich flavor. Each date is carefully harvested by hand at peak ripeness, then sorted and packaged to preserve its freshness and nutritional value.',
              "From farm to your table, we ensure every date meets our strict quality standards, bringing you the authentic taste of nature's finest superfood."
            ]).map((para, i) => (
              <p key={i} className="desc-about-text">{para}</p>
            ))}
          </div>
          <div className="desc-about-right">
            <div className="desc-about-slider">
              {(about?.images || ['/dates-farming.jpg', '/Product 1.png', '/Product 2.png', '/Product 3.png']).map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Farm ${i + 1}`}
                  className={`desc-about-slide-img${aboutSlide === i ? ' active' : ''}`}
                  onError={e => e.target.src = '/dates.png'}
                />
              ))}
              <div className="desc-about-dots">
                {(about?.images || ['/dates-farming.jpg', '/Product 1.png', '/Product 2.png', '/Product 3.png']).map((_, i) => (
                  <span key={i} className={`desc-about-dot${aboutSlide === i ? ' active' : ''}`} onClick={() => setAboutSlide(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {showProductDetails && selectedProduct && (
        <div className="product-details-overlay" onClick={closeProductDetails}>
          <div className="product-details-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeProductDetails}>✕</button>

            <div className="product-details-content">
              <div className="pd-left">
                <div className="pd-image-wrapper">
                  <img
                    src={selectedProduct.detailImage || selectedProduct.image}
                    alt={selectedProduct.name}
                    onError={(e) => { e.target.src = '/dates.png'; }}
                  />
                </div>
              </div>

              <div className="pd-right">
                <div className="pd-header-row">
                  <h2 className="pd-title">{selectedProduct.name}</h2>
                  {selectedProduct.arabicName && <h2 className="pd-arabic">{selectedProduct.arabicName}</h2>}
                </div>
                <div className="pd-price">Rs.{getPriceForWeight(selectedProduct.price, selectedWeight).toLocaleString()}.00</div>

                <div className="pd-storage-note">
                  {selectedProduct.storageNote || 'Storage Note: To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....'}
                </div>

                <div className="pd-rating-stock-row" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                  <div className="pd-rating" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <div style={{ color: '#fbbf24', fontSize: '1.3rem', letterSpacing: '2px', display: 'flex', cursor: 'pointer' }} title="Click to rate this product">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          style={{ 
                            color: star <= (modalHoverStar || Math.round(productRatings.average)) ? '#fbbf24' : '#e5e7eb',
                            transition: 'color 0.2s, transform 0.2s',
                            transform: star <= modalHoverStar ? 'scale(1.15)' : 'scale(1)'
                          }}
                          onMouseEnter={() => setModalHoverStar(star)}
                          onMouseLeave={() => setModalHoverStar(0)}
                          onClick={() => handleModalRate(star)}
                        >★</span>
                      ))}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: '#666', fontSize: '0.85rem', marginLeft: '5px', fontWeight: '500' }}>
                        {productRatings.average} ({productRatings.total}+ Reviews)
                      </span>
                      {modalRatingStatus === 'success' && (
                        <span style={{ color: '#10b981', fontSize: '0.75rem', marginLeft: '5px', fontWeight: '700', animation: 'fadeIn 0.3s ease' }}>⭐ Rated!</span>
                      )}
                      {modalRatingStatus === 'submitting' && (
                        <span style={{ color: '#c5a059', fontSize: '0.75rem', marginLeft: '5px' }}>Saving...</span>
                      )}
                    </div>
                  </div>
                  <div className="pd-stock-status" style={{ margin: 0 }}>
                    <span className="stock-dot"></span> In Stock
                  </div>
                </div>

                <div className="pd-weight-selection">
                  <p className="weight-label">Weight: <span>{selectedWeight}</span></p>
                  <div className="weight-options">
                    {(selectedProduct.weights && selectedProduct.weights.length > 0 ? selectedProduct.weights : [
                      { label: '1kg Special Box', savings: '' },
                      { label: '500g Mini Box', savings: '' },
                      { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
                      { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
                      { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
                    ]).map((w, idx) => (
                      <button
                        key={idx}
                        className={`weight-opt ${selectedWeight === w.label ? 'active' : ''}`}
                        onClick={() => setSelectedWeight(w.label)}
                      >
                        {w.label} {w.savings && <span>{w.savings}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <button className="pd-add-to-cart-btn" onClick={() => { closeProductDetails(); setShowLoginModal(true); }}>
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)} style={{ zIndex: 99999 }}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{ zIndex: 100000 }}>
            <div className="modal-header">
              <h3 className="modal-title">Login Required</h3>
              <p className="modal-text">Please login or sign up to add items to cart</p>
            </div>
            <div className="modal-actions">
              <button className="btn-full btn-modal-primary" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-full btn-modal-secondary" onClick={() => navigate('/signup')}>Sign Up</button>
              <button className="btn-modal-cancel" onClick={() => setShowLoginModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Floating AI Button */}
      <div className="float-ai-btn" onClick={() => setShowLoginModal(true)}>
        <div className="float-ai-ring" />
        <div className="float-ai-ring float-ai-ring2" />
        <span className="float-ai-icon">🤖</span>
        <span className="float-ai-label">AI</span>
      </div>

      <Footer />
    </div>
  );
}

export default Description;

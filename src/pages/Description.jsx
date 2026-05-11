import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Description.css';

const API = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

function Description() {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductDetails, setShowProductDetails] = useState(false);
  const [productSlide, setProductSlide] = useState(0);
  const [reviewSlide, setReviewSlide] = useState(0);

  const [heroes, setHeroes] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/content/heroes`).then(r => r.json()),
      fetch(`${API}/content/products`).then(r => r.json()),
      fetch(`${API}/content/reviews`).then(r => r.json()),
    ]).then(([h, p, r]) => {
      setHeroes(h.heroes || []);
      setProducts(p.products || []);
      setReviews(r.reviews || []);
    }).catch(() => {});
  }, []);

  const handleProductClick = (product) => { setSelectedProduct(product); setShowProductDetails(true); };
  const closeProductDetails = () => { setShowProductDetails(false); setSelectedProduct(null); };

  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <span key={i} className={i < Math.floor(rating) ? 'star filled' : 'star'}>★</span>
    ));

  const hero1 = heroes.find(h => h.key === 'hero1');
  const hero2 = heroes.find(h => h.key === 'hero2');

  return (
    <div className="description-page">

      <nav className="navbar">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
            <span className="nav-logo-text">AjwaHub</span>
          </div>
          <div className="nav-buttons">
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
      </main>

      {/* FEATURE SECTION */}
      <section className="desc-feature-section">
        <div className="desc-feature-img-wrap">
          <div className="desc-float-single">
            <div className="desc-float-item desc-float-item1"><img src="/Product 1.png" alt="P1" onError={e=>e.target.src='/dates.png'}/></div>
            <div className="desc-float-item desc-float-item2"><img src="/Product 2.png" alt="P2" onError={e=>e.target.src='/dates.png'}/></div>
            <div className="desc-float-item desc-float-item3"><img src="/Product 3.png" alt="P3" onError={e=>e.target.src='/dates.png'}/></div>
            <div className="desc-float-item desc-float-item4"><img src="/Product 4.png" alt="P4" onError={e=>e.target.src='/dates.png'}/></div>
          </div>
        </div>
        <div className="desc-feature-content">
          <span className="desc-feature-badge">🌟 Premium Quality</span>
          <h2 className="desc-feature-title">Why Choose <span>AjwaHub?</span></h2>
          <p className="desc-feature-text">We bring you the finest handpicked dates and dry fruits straight from the source. Every product is carefully selected for freshness, taste, and nutritional value.</p>
          <div className="desc-feature-list">
            <div className="desc-feature-item"><span>✅</span><p>100% Natural & Pure</p></div>
            <div className="desc-feature-item"><span>📦</span><p>Premium Packaging</p></div>
            <div className="desc-feature-item"><span>🚚</span><p>Fast Delivery Across Pakistan</p></div>
            <div className="desc-feature-item"><span>⭐</span><p>Trusted by 50,000+ Customers</p></div>
          </div>
          <button className="desc-feature-btn" onClick={() => navigate('/signup')}>Shop Now →</button>
        </div>
      </section>

      {products.length > 0 && (
        <section className="products-section">
          <div className="products-inner">
            <div className="section-header">
              <h3 className="section-title">Our Premium Collection</h3>
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

      {showProductDetails && selectedProduct && (
        <div className="product-details-overlay" onClick={closeProductDetails}>
          <div className="product-details-modal" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={closeProductDetails}>✕</button>
            <div className="product-details-content">
              <div className="product-details-image">
                <img src={selectedProduct.image} alt={selectedProduct.name} onError={e => { e.target.src = '/dates.png'; }} />
              </div>
              <div className="product-details-info">
                <h2>{selectedProduct.name}</h2>
                <p className="product-description">{selectedProduct.description}</p>
                <p className="product-weight">Weight: {selectedProduct.weight}</p>
                <div className="rating">
                  {renderStars(selectedProduct.rating)}
                  <span className="rating-value">({selectedProduct.rating})</span>
                </div>
                <div className="price-stock">
                  <span className="price">PKR {selectedProduct.price}</span>
                  <span className={`stock ${selectedProduct.stock ? 'in-stock' : 'out-stock'}`}>
                    {selectedProduct.stock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="modal-overlay" onClick={() => setShowLoginModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
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
            <a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.
            069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href="#" aria-label="TikTok"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
          </div>
        </div>
        <div className="login-footer-bottom">&copy; 2025 AjwaHub. All rights reserved.</div>
      </footer>
    </div>
  );
}

export default Description;

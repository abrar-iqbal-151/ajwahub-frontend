import { useNavigate } from 'react-router-dom';
import '../css/Terms.css';

function AboutUs() {
  const navigate = useNavigate();

  return (
    <div className="terms-overlay" onClick={() => window.history.back()}>
      <div className="terms-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={() => window.history.back()}>✕</button>
        <div className="terms-content">
          <h1 className="terms-title">About AjwaHub</h1>
          <div className="terms-sections">
            <section className="terms-section">
              <h2>🌿 Who We Are</h2>
              <p>AjwaHub is Pakistan's premier online destination for premium quality dates, dry fruits, and natural health products. We are passionate about bringing the finest handpicked products directly to your doorstep.</p>
            </section>
            <section className="terms-section">
              <h2>🎯 Our Mission</h2>
              <p>Our mission is to provide 100% authentic, high-quality dates and dry fruits at affordable prices while delivering an exceptional shopping experience to every customer across Pakistan.</p>
            </section>
            <section className="terms-section">
              <h2>⭐ Why Choose Us</h2>
              <p><strong>Premium Quality:</strong> Every product is handpicked and quality tested.</p>
              <p><strong>Fast Delivery:</strong> We deliver across Pakistan within 2-4 business days.</p>
              <p><strong>Authentic Products:</strong> 100% genuine products, no compromise on quality.</p>
              <p><strong>Customer First:</strong> 30-day return policy and dedicated support.</p>
            </section>
            <section className="terms-section">
              <h2>📞 Get In Touch</h2>
              <p><strong>Email:</strong> abrariqbal141@gmail.com</p>
              <p><strong>Phone:</strong> 03020217120</p>
              <p><strong>Address:</strong> Garden East, Karachi, Pakistan</p>
              <p><strong>Hours:</strong> 9 AM – 6 PM (Mon–Sat)</p>
            </section>
          </div>
          <div className="terms-footer">
            <p>© 2025 AjwaHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;

import { useState } from 'react';
import '../css/Terms.css';

function Terms() {
  const [showModal, setShowModal] = useState(true);

  const closeModal = () => {
    setShowModal(false);
    window.history.back();
  };

  if (!showModal) return null;

  return (
    <div className="terms-overlay" onClick={closeModal}>
      <div className="terms-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={closeModal}>✕</button>
        
        <div className="terms-content">
          <h1 className="terms-title">Terms of Service & Privacy Policy</h1>
          
          <div className="terms-sections">
            <section className="terms-section">
              <h2>📋 Terms of Service</h2>
              
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using AjwaHub, you accept and agree to be bound by the terms and provision of this agreement.</p>
              
              <h3>2. Product Information</h3>
              <p>We strive to provide accurate product descriptions, prices, and availability. However, we reserve the right to correct any errors, inaccuracies, or omissions.</p>
              
              <h3>3. Orders and Payment</h3>
              <p>All orders are subject to acceptance and availability. Payment must be made in full before shipment. We accept various payment methods as displayed at checkout.</p>
              
              <h3>4. Shipping and Delivery</h3>
              <p>We aim to process orders within 1-2 business days. Delivery times may vary based on location. Free shipping is available on orders above PKR 2000.</p>
              
              <h3>5. Returns and Refunds</h3>
              <p>We offer a 30-day return policy for unopened products in original packaging. Refunds will be processed within 7-10 business days.</p>
              
              <h3>6. Quality Guarantee</h3>
              <p>All our dates and dry fruits are premium quality, handpicked, and quality tested. We guarantee 100% authentic products.</p>
            </section>

            <section className="terms-section">
              <h2>🔒 Privacy Policy</h2>
              
              <h3>1. Information We Collect</h3>
              <p>We collect information you provide directly (name, email, address) and automatically (browsing behavior, device information).</p>
              
              <h3>2. How We Use Your Information</h3>
              <p>Your information is used to process orders, provide customer service, send updates, and improve our services. We never sell your personal data.</p>
              
              <h3>3. Data Security</h3>
              <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
              
              <h3>4. Cookies</h3>
              <p>We use cookies to enhance your browsing experience, remember preferences, and analyze site traffic. You can disable cookies in your browser settings.</p>
              
              <h3>5. Third-Party Services</h3>
              <p>We may use third-party services for payment processing and analytics. These services have their own privacy policies.</p>
              
              <h3>6. Contact Information</h3>
              <p>For any privacy concerns or data requests, contact us at privacy@ajwahub.com or through our contact page.</p>
              
              <h3>7. Updates to Policy</h3>
              <p>We may update this policy periodically. Continued use of our service constitutes acceptance of any changes.</p>
            </section>

            <section className="terms-section">
              <h2>📞 Contact & Support</h2>
              <p><strong>Email:</strong> abrariqbal141@gmail.com</p>
              <p><strong>Phone:</strong> 03020217120</p>
              <p><strong>Address:</strong> Garden East, Karachi, Pakistan</p>
              <p><strong>Business Hours:</strong> 9 AM - 6 PM (Mon-Sat)</p>
            </section>
          </div>
          
          <div className="terms-footer">
            <p>Last updated: January 2025</p>
            <p>© 2025 AjwaHub. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;

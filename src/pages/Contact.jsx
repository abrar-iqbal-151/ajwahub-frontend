import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/Contact.css';

function Contact() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [info, setInfo] = useState({ location: 'Madinah, Saudi Arabia', phone: '+92 300 0000000', email: 'support@ajwahub.com', hours: 'Mon–Sat, 9am – 6pm' });

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) setUser(JSON.parse(userData));
    fetch('http://localhost:5000/api/settings').then(r => r.json()).then(d => { if (d.settings) setInfo(d.settings); }).catch(() => {});
  }, []);

  const handleLogout = () => { localStorage.removeItem('ajwaHub_currentUser'); setUser(null); navigate('/description'); };
  const isActive = (path) => location.pathname === path;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } catch {}
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="contact-page">
      {/* 3D Background */}
      <div className="desc-bg-3d">
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" />
        <div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" />
        <div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_,i) => <div key={i} className="desc-bg-line" style={{animationDelay: `${i*0.4}s`}} />)}
        </div>
      </div>
<nav className="navbar">
        <div className="nav-logo">
          <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">AjwaHub</span>
        </div>
        <div className="nav-menu">
          <button className={`nav-item ${isActive('/home') ? 'active' : ''}`} onClick={() => navigate("/home")}>Home</button>
          <button className={`nav-item ${isActive('/products') ? 'active' : ''}`} onClick={() => navigate("/products")}>Products</button>
          <button className={`nav-item ${isActive('/ai') ? 'active' : ''}`} onClick={() => navigate("/ai")}>AI</button>
          <button className={`nav-item ${isActive('/gifting') ? 'active' : ''}`} onClick={() => navigate("/gifting")}>Gifting</button>
          <button className={`nav-item ${isActive('/wishlist') ? 'active' : ''}`} onClick={() => navigate("/wishlist")}>Wishlist</button>
          <button className={`nav-item ${isActive('/gymai') ? 'active' : ''}`} onClick={() => navigate("/gymai")}>GymAI</button>
          <button className={`nav-item ${isActive('/tracking') ? 'active' : ''}`} onClick={() => navigate("/tracking")}>Tracking</button>
          <button className={`nav-item ${isActive('/payment') ? 'active' : ''}`} onClick={() => navigate("/payment")}>Payment</button>
          <button className={`nav-item ${isActive('/contact') ? 'active' : ''}`} onClick={() => navigate("/contact")}>Contact</button>
          <button className={`nav-item ${isActive('/settings') ? 'active' : ''}`} onClick={() => navigate("/settings")}>Settings</button>
        </div>
        <div className="nav-right">
          {user && (
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <span className="user-name">{user.name}</span>
              <div className="user-avatar">
                {user.profilePicture ? <img src={user.profilePicture} alt="Profile" className="avatar-image" /> : <span className="avatar-initial">{user.name.charAt(0).toUpperCase()}</span>}
                <div className="online-dot"></div>
              </div>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="dropdown-item" onClick={() => { setShowProfileMenu(false); navigate("/contact"); }}>📧 Contact</button>
                  <button className="dropdown-item" onClick={() => { setShowProfileMenu(false); navigate("/settings"); }}>⚙️ Settings</button>
                  <button className="dropdown-item logout" onClick={() => { setShowProfileMenu(false); handleLogout(); }}>🚪 Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      <div className="contact-wrapper">

        {/* LEFT INFO */}
        <div className="contact-info">
          <span className="contact-badge">📬 Get In Touch</span>
          <h1>Let's <span>Talk</span></h1>
          <p>Have a question, feedback, or want to place a bulk order? We're here to help.</p>

          <div className="contact-cards">
            <div className="contact-card">
              <div className="cc-icon">📍</div>
              <div><h4>Location</h4><p>{info.location}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">📞</div>
              <div><h4>Phone</h4><p>{info.phone}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">✉️</div>
              <div><h4>Email</h4><p>{info.email}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">🕐</div>
              <div><h4>Hours</h4><p>{info.hours}</p></div>
            </div>
          </div>
        </div>


        <div className="contact-form-box">
          <h2>Send a Message</h2>
          <p>We'll get back to you within 24 hours.</p>

          {sent && (
            <div className="contact-success">
              ✅ Message sent! We'll be in touch soon.
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="cf-row">
              <div className="cf-group">
                <label>Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="cf-group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="cf-group">
              <label>Subject</label>
              <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="cf-group">
              <label>Message</label>
              <textarea rows={5} placeholder="Write your message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="cf-submit">
              <span>Send Message</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      </div>

      <footer className="footer" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(74,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)', borderTop: '1px solid rgba(220,38,38,0.2)', textAlign: 'center', padding: '20px 0', marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>
          <span>© 2025 Made by</span>
          <span style={{ background: 'linear-gradient(135deg, #fb923c, #fbbf24, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 800 }}>AjwaHub Team</span>
        </div>
      </footer>
    </div>
  );
}

export default Contact;



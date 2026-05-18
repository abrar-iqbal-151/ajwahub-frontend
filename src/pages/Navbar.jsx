import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { label: 'Home', path: '/home', icon: '🏠' },
  { label: 'Products', path: '/products', icon: '🛍️' },
  { label: 'Premium', path: '/premium', icon: '👑' },
  { label: 'AI', path: '/ai', icon: '🤖' },
  { label: 'Gifting', path: '/gifting', icon: '🎁' },
  { label: 'Wishlist', path: '/wishlist', icon: '❤️' },
  { label: 'GymAI', path: '/gymai', icon: '💪' },
  { label: 'Tracking', path: '/tracking', icon: '📦' },
  { label: 'Orders', path: '/orders', icon: '🧾' },
  { label: 'Payment', path: '/payment', icon: '💳' },
  { label: 'Settings', path: '/settings', icon: '⚙️' },
  { label: 'Contact', path: '/contact', icon: '📞' },
];

function Navbar({ extraLeft }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);

  const [theme, setTheme] = useState(localStorage.getItem('ajwaHub_theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('ajwaHub_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (u) setUser(JSON.parse(u));
  }, [location.pathname]);

  // Close drawer on outside click
  useEffect(() => {
    const handler = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setDrawerOpen(false);
      }
    };
    if (drawerOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [drawerOpen]);

  // Close drawer on route change
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleNavClick = (path) => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (!u) { setShowLoginModal(true); return; }
    navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_currentUser');
    setUser(null);
    setDrawerOpen(false);
    navigate('/description');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        {/* LEFT */}
        <div className="nav-left-group">
          {/* Hamburger — mobile only */}
          <button className="hamburger-btn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
            <span /><span /><span />
          </button>

          <div className="nav-logo" onClick={() => navigate('/home')}>
            <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
            <span className="nav-logo-text">AjwaHub</span>
          </div>

          {extraLeft}
        </div>

        {/* CENTER — desktop menu */}
        <div className="nav-menu">
          {NAV_LINKS.map(({ label, path }) => (
            <button
              key={path}
              className={`nav-item ${isActive(path) ? 'active' : ''}`}
              onClick={() => handleNavClick(path)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* RIGHT — user profile */}
        <div className="nav-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
            {theme === 'light' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
          {user && (
            <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <span className="user-name">{user.name}</span>
              <div className="user-avatar">
                {user.profilePicture
                  ? <img src={user.profilePicture} alt="Profile" className="avatar-image" />
                  : <span className="avatar-initial">{user.name.charAt(0).toUpperCase()}</span>}
                <div className="online-dot" />
              </div>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <button className="dropdown-item" onClick={() => { setShowProfileMenu(false); navigate('/settings'); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    Settings
                  </button>
                  <button className="dropdown-item" onClick={() => { setShowProfileMenu(false); navigate('/contact'); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Contact
                  </button>
                  <button className="dropdown-item logout" onClick={() => { setShowProfileMenu(false); handleLogout(); }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE DRAWER OVERLAY */}
      {drawerOpen && <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />}

      {/* MOBILE DRAWER */}
      <div className={`mobile-drawer ${drawerOpen ? 'open' : ''}`} ref={drawerRef}>
        {/* Drawer Header */}
        <div className="drawer-header">
          <div className="drawer-logo">
            <img src="/LOGO.jpeg" alt="AjwaHub" className="drawer-logo-img" />
            <span className="drawer-logo-text">AjwaHub</span>
          </div>
          <button className="drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
        </div>

        {/* User info in drawer */}
        {user && (
          <div className="drawer-user">
            <div className="drawer-avatar">
              {user.profilePicture
                ? <img src={user.profilePicture} alt="Profile" className="drawer-avatar-img" />
                : <span className="drawer-avatar-initial">{user.name.charAt(0).toUpperCase()}</span>}
              <div className="drawer-online-dot" />
            </div>
            <div className="drawer-user-info">
              <span className="drawer-user-name">{user.name}</span>
              <span className="drawer-user-email">{user.email}</span>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <div className="drawer-links">
          {NAV_LINKS.map(({ label, path, icon }) => (
            <button
              key={path}
              className={`drawer-link ${isActive(path) ? 'active' : ''}`}
              onClick={() => handleNavClick(path)}
            >
              <span className="drawer-link-icon">{icon}</span>
              <span className="drawer-link-label">{label}</span>
              {isActive(path) && <span className="drawer-active-dot" />}
            </button>
          ))}
        </div>

        {/* Drawer Footer */}
        {user && (
          <div className="drawer-footer">
            <button className="drawer-logout" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
      {/* Login Required Modal */}
      {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }} onClick={() => setShowLoginModal(false)}>
          <div style={{ background: 'linear-gradient(135deg,rgba(26,26,46,0.97),rgba(15,15,30,0.97))', border: '2px solid rgba(251,146,60,0.3)', borderRadius: '20px', padding: '30px', maxWidth: '380px', width: '90%', textAlign: 'center', boxShadow: '0 30px 60px rgba(0,0,0,0.8)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fb923c', marginBottom: '10px' }}>Login Required</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginBottom: '20px' }}>Please login or sign up to access this page</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => { setShowLoginModal(false); navigate('/login'); }} style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg,#fb923c,#ea580c)', color: 'white' }}>Login</button>
              <button onClick={() => { setShowLoginModal(false); navigate('/signup'); }} style={{ width: '100%', padding: '12px', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', background: 'transparent', color: '#22d3ee', border: '2px solid #22d3ee' }}>Sign Up</button>
              <button onClick={() => setShowLoginModal(false)} style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>Cancel</button>
              <button onClick={() => { setShowLoginModal(false); navigate(-1); }} style={{ background: 'transparent', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.15)', padding: '10px', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}>← Go Back</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;



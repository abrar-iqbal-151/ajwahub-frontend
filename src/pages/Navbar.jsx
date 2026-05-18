import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  {
    label: 'Home',
    path: '/home',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    )
  },
  {
    label: 'Products',
    path: '/products',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    )
  },
  {
    label: 'Premium',
    path: '/premium',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffd700" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 215, 0, 0.45))' }}>
        <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
        <path d="M3 20h18" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    label: 'AI',
    path: '/ai',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 8px rgba(0, 240, 255, 0.55))' }}>
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="9.01" y2="9" strokeWidth="3" />
        <line x1="15" y1="9" x2="15.01" y2="9" strokeWidth="3" />
        <path d="M12 13a2 2 0 0 0-2 2h4a2 2 0 0 0-2-2z" />
      </svg>
    )
  },
  {
    label: 'Gifting',
    path: '/gifting',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    )
  },
  {
    label: 'Wishlist',
    path: '/wishlist',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff3b30" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 8px rgba(255, 59, 48, 0.55))' }}>
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )
  },
  {
    label: 'GymAI',
    path: '/gymai',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4cd964" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 2px 8px rgba(76, 217, 100, 0.55))' }}>
        <line x1="6" y1="12" x2="18" y2="12" strokeWidth="3" />
        <rect x="2" y="8" width="4" height="8" rx="1" strokeWidth="2.5" />
        <rect x="18" y="8" width="4" height="8" rx="1" strokeWidth="2.5" />
        <line x1="1" y1="10" x2="1" y2="14" strokeWidth="2" />
        <line x1="23" y1="10" x2="23" y2="14" strokeWidth="2" />
      </svg>
    )
  },
  {
    label: 'Tracking',
    path: '/tracking',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    )
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    )
  },
  {
    label: 'Payment',
    path: '/payment',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" strokeWidth="2.5" />
      </svg>
    )
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    )
  },
  {
    label: 'Contact',
    path: '/contact',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#goldGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    )
  }
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
      {/* GLOBAL LINEAR GRADIENTS FOR BRAND SVG ICONS */}
      <svg style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }} aria-hidden="true">
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd700" />
            <stop offset="100%" stopColor="#c5a059" />
          </linearGradient>
          <linearGradient id="premiumGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c5a059" />
            <stop offset="100%" stopColor="#8a6f3e" />
          </linearGradient>
        </defs>
      </svg>

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



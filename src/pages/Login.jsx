import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    console.log('Login page loaded');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setLoading(true);

    if (!formData.email.trim()) {
      setEmailError('Please enter your email');
      setLoading(false); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setEmailError('Please enter a valid email address');
      setLoading(false); return;
    }
    if (!formData.password.trim()) {
      setPasswordError('Please enter your password');
      setLoading(false); return;
    }
    if (formData.password.length < 9) {
      setPasswordError('Password must be at least 9 characters');
      setLoading(false); return;
    }

    try {
      const response = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      console.log('Backend response:', data);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        if (data.user && data.user.twoFactorEnabled === true) {
          navigate('/two-factor-auth', { state: { email: data.user.email, secret: data.user.twoFactorSecret } });
          return;
        } else {
          completeLogin(data);
        }
      } else {
        if (response.status === 401) {
          setEmailError('Email not registered');
          setPasswordError('Incorrect password');
        } else {
          setError(data.message || 'Invalid email or password');
        }
      }
    } catch (err) {
      setError('Server connection failed. Please try again later.');
    }
    
    setLoading(false);
  };
  
  const completeLogin = async (data) => {
    console.log('Completing login for user:', data.user.email);
    
    try {
      const profileResponse = await fetch(`${API}/api/users/profile/${data.user.email}`);
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const completeUser = {
          ...data.user,
          ...profileData.user,
          email: data.user.email
        };
        localStorage.setItem('ajwaHub_currentUser', JSON.stringify(completeUser));
      } else {
        localStorage.setItem('ajwaHub_currentUser', JSON.stringify(data.user));
      }
    } catch (error) {
      localStorage.setItem('ajwaHub_currentUser', JSON.stringify(data.user));
    }
    
    if (data.sessionInfo) {
      const existingSessions = JSON.parse(localStorage.getItem('ajwaHub_sessions') || '[]');
      existingSessions.push(data.sessionInfo);
      localStorage.setItem('ajwaHub_sessions', JSON.stringify(existingSessions));
    }
    
    navigate('/home');
  };

  return (
    <div className="login-page">
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">AjwaHub</span>
        </div>
        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            ← Back
          </button>
        </div>
        <div className="nav-right">
          <button className="btn btn-primary" onClick={() => navigate('/signup')}>
            Sign Up
          </button>
        </div>
      </nav>
      <div className="login-center-wrap">
        <div className="login-container">
        <div className="login-header">
          <h1 className="login-title">Welcome to AjwaHub</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              className={`form-input ${emailError ? 'error' : ''}`}
              value={formData.email}
              onChange={(e) => { setFormData({...formData, email: e.target.value}); setEmailError(''); }}
              disabled={loading}
              autoComplete="off" autoCorrect="off" autoCapitalize="off"
              spellCheck="false" data-form-type="other" required
            />
            {emailError && <p className="field-error">⚠️ {emailError}</p>}
          </div>
          
          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`form-input ${passwordError ? 'error' : ''}`}
              value={formData.password}
              onChange={(e) => { setFormData({...formData, password: e.target.value}); setPasswordError(''); }}
              disabled={loading}
              autoComplete="new-password" data-form-type="other" required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? '👁️' : '👁️'}
            </button>
            {passwordError && <p className="field-error">⚠️ {passwordError}</p>}
          </div>

          <div className="forgot-password-link">
            <button 
              type="button"
              className="forgot-link"
              onClick={() => navigate('/reset-password')}
              disabled={loading}
            >
              Forgot Password?
            </button>
          </div>
          
          <button type="submit" className={`login-btn ${loading ? 'loading' : ''}`} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="signup-link">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')}>
            Sign up
          </span>
        </div>
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
export default Login;

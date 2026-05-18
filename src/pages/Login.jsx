import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Login.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Login() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('ajwaHub_theme') || 'light');
  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('ajwaHub_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

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
        if (data.field === 'email') {
          setEmailError(data.message);
        } else if (data.field === 'password') {
          setPasswordError(data.message);
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
      {/* 3D Background - Same as Description page */}
      <div className="desc-bg-3d">
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" />
        <div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" />
        <div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_,i) => <div key={i} className="desc-bg-line" style={{animationDelay:`${i*0.4}s`}} />)}
        </div>
      </div>

      <nav className="login-navbar">
        <div className="nav-inner">
          <div className="nav-logo" onClick={() => navigate('/')} style={{cursor:'pointer'}}>
            <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
            <span className="nav-logo-text">
              <span className="logo-ajwa">Ajwa</span>
              <span className="logo-hub">Hub</span>
            </span>
          </div>
          <div className="nav-buttons">
            <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle Theme">
              {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              )}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/')}>← Back</button>
            <button className="btn btn-primary" onClick={() => navigate('/signup')}>Sign Up</button>
          </div>
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
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
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


    </div>
  );
}
export default Login;

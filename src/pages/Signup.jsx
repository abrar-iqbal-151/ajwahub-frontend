import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Signup.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Signup() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('ajwaHub_theme') || 'light');
  useEffect(() => {
    document.body.classList.toggle('dark-theme', theme === 'dark');
    localStorage.setItem('ajwaHub_theme', theme);
  }, [theme]);
  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setFirstNameError(''); setLastNameError(''); setEmailError(''); setPasswordError(''); setConfirmError('');
    setLoading(true);

    if (!formData.firstName.trim()) {
      setFirstNameError('Please enter your first name'); setLoading(false); return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim()) || formData.firstName.trim().length < 2) {
      setFirstNameError('First name must contain only letters'); setLoading(false); return;
    }
    if (!formData.lastName.trim()) {
      setLastNameError('Please enter your last name'); setLoading(false); return;
    }
    if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim()) || formData.lastName.trim().length < 2) {
      setLastNameError('Last name must contain only letters'); setLoading(false); return;
    }
    if (!formData.email.trim()) {
      setEmailError('Please enter your email'); setLoading(false); return;
    }
    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      setEmailError('Please enter a valid email address'); setLoading(false); return;
    }
    if (formData.password.length < 9) {
      setPasswordError('Password must be at least 9 characters'); setLoading(false); return;
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      setPasswordError('Must have uppercase, lowercase, number & special character'); setLoading(false); return;
    }
    if (formData.password !== formData.confirmPassword) {
      setConfirmError('Passwords do not match'); setLoading(false); return;
    }
    if (!acceptTerms) {
      setError('Please accept the Terms of Service'); setLoading(false); return;
    }


    try {
      const response = await fetch(`${API}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.toLowerCase().trim(),
          phone: formData.phone.trim(),
          password: formData.password
        })
      });


  const data = await response.json();
      if (response.ok) {
        const loginRes = await fetch(`${API}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email.toLowerCase().trim(), password: formData.password })
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('ajwaHub_currentUser', JSON.stringify(loginData.user));
          navigate('/home');
        } else {
          setError('Account created. Please login.');
        }
      } else {
        if (data.message?.toLowerCase().includes('email') || data.message?.toLowerCase().includes('exists')) {
          setEmailError('This email is already registered');
        } else {
          setError(data.message || 'Signup failed. Please try again.');
        }
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (val) => {
    setFormData({ ...formData, password: val });
    setPasswordError('');
    if (!val) setPasswordStrength('');
    else if (val.length < 9) setPasswordStrength('weak');
    else if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(val)) setPasswordStrength('strong');
    else setPasswordStrength('medium');
  };

  return (
    <div className="signup-page">
      {/* 3D Background */}
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
            <button className="btn btn-secondary" onClick={() => navigate('/login')}>← Back to Login</button>
          </div>
        </div>
      </nav>

        <div className="signup-center-wrap">
        <div className="signup-container">
        <div className="signup-header">
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join AjwaHub today</p>
        </div>

        {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <input type="text" placeholder="First Name"
                className={`form-input ${firstNameError ? 'error' : ''}`}
                value={formData.firstName} onChange={e => { setFormData({ ...formData, firstName: e.target.value }); setFirstNameError(''); }}
                disabled={loading} required />
              {firstNameError && <p className="field-error">⚠️ {firstNameError}</p>}
            </div>
            <div className="form-group">
              <input type="text" placeholder="Last Name"
                className={`form-input ${lastNameError ? 'error' : ''}`}
                value={formData.lastName} onChange={e => { setFormData({ ...formData, lastName: e.target.value }); setLastNameError(''); }}
                disabled={loading} required />
              {lastNameError && <p className="field-error">⚠️ {lastNameError}</p>}
            </div>
          </div>

          <div className="form-group">
            <input type="email" placeholder="Enter your email"
              className={`form-input ${emailError ? 'error' : ''}`}
              value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setEmailError(''); }}
              disabled={loading} autoComplete="off" required />
            {emailError && <p className="field-error">⚠️ {emailError}</p>}
          </div>



          <div className="form-group password-group">
            <input type={showPassword ? 'text' : 'password'} placeholder="Create password (min 9 characters)"
              className={`form-input ${passwordError ? 'error' : ''}`}
              value={formData.password} onChange={e => handlePasswordChange(e.target.value)}
              disabled={loading} autoComplete="new-password" required />
            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
            {passwordError && <p className="field-error">⚠️ {passwordError}</p>}
          </div>

          {passwordStrength && (
            <div className="password-strength">
              <div className="strength-bar"><div className={`strength-fill ${passwordStrength}`}></div></div>
              <span className="strength-text">
                {passwordStrength === 'weak' && 'Weak password'}
                {passwordStrength === 'medium' && 'Medium strength'}
                {passwordStrength === 'strong' && 'Strong password'}
              </span>
            </div>
          )}

          <div className="form-group password-group">
            <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm your password"
              className={`form-input ${confirmError ? 'error' : ''}`}
              value={formData.confirmPassword} onChange={e => { setFormData({ ...formData, confirmPassword: e.target.value }); setConfirmError(''); }}
              disabled={loading} autoComplete="new-password" required />
            <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
              {showConfirmPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              )}
            </button>
            {confirmError && <p className="field-error">⚠️ {confirmError}</p>}
          </div>

          <div className="terms-checkbox">
            <label className="checkbox-container">
              <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} disabled={loading} />
              <span className="checkmark"></span>
              <span className="terms-text">
                I agree to the <span className="terms-link" onClick={() => navigate('/terms')}>Terms of Service</span> and <span className="terms-link" onClick={() => navigate('/terms')}>Privacy Policy</span>
              </span>
            </label>
          </div>

          <button type="submit" className={`signup-btn ${loading ? 'loading' : ''}`} disabled={loading || !acceptTerms}>
            {loading ? <><span className="spinner"></span>Creating Account...</> : 'Create Account'}
          </button>

          <div className="signup-alt-btns">
            <button type="button" className="alt-btn alt-btn-google" onClick={() => setError('Google Sign In coming soon!')}>
              <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Gmail
            </button>
            <button type="button" className="alt-btn alt-btn-phone" onClick={() => setError('Phone Sign In coming soon!')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Sign up with Contact
            </button>
          </div>
        </form>

        <div className="signup-footer">
          <p>Already have an account? <span className="login-link" onClick={() => navigate('/login')}>Sign in</span></p>
        </div>
        </div>
        </div>
    </div>
  );
}

export default Signup;

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as OTPAuth from 'otpauth';
import '../css/TwoFactorAuth.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function TwoFactorAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

//yai func cheack kerta hai email sahi hai ya nahi? 
  const userEmail = location.state?.email;
  const userSecret = location.state?.secret;
  useEffect(() => {
    if (!userEmail) {
      navigate('/login');
    }
  }, [userEmail, navigate]);

  const handleCodeChange = (index, value) => {
    const digits = value.replace(/\D/g, '');
    
    // Handle paste of multiple digits
    if (digits.length > 1) {
      const newCode = [...verificationCode];
      for (let i = 0; i < digits.length && index + i < 6; i++) {
        newCode[index + i] = digits[i];
      }
      setVerificationCode(newCode);
      
      const nextIndex = Math.min(index + digits.length, 5);
      const nextInput = document.getElementById(`code-${nextIndex}`);
      if (nextInput) nextInput.focus();
      return;
    }

    // Handle single digit
    const digit = digits.slice(-1);  
    const newCode = [...verificationCode];
    newCode[index] = digit;
    setVerificationCode(newCode);
    
    if (digit && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    const code = verificationCode.join('');
    if (code.length !== 6) { setError('Please enter a valid 6-digit code'); return; }

    setLoading(true);
    setError('');

    try {
      console.log('Verifying code:', code, 'for email:', userEmail);
      const res = await fetch(`${API}/api/users/profile/${userEmail}`);
      if (!res.ok) { setError('User not found'); setLoading(false); return; }
      const data = await res.json();
      
      const secret = data.user?.twoFactorSecret || userSecret;
      console.log('Using secret:', secret ? '***' + secret.slice(-4) : 'none');

      if (!secret) { setError('2FA not configured for this account'); setLoading(false); return; }

      const cleanSecret = secret.replace(/[\s=]/g, '').toUpperCase();
      console.log('Cleaned secret length:', cleanSecret.length);

      const totp = new OTPAuth.TOTP({
        issuer: 'AjwaHub',
        label: userEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(cleanSecret)
      });

      // Check current and +/- 40 periods (20 minutes drift)
      let isValid = false;
      for (let offset = -40; offset <= 40; offset++) {
        const expected = totp.generate({ timestamp: Date.now() + offset * 30000 });
        if (expected === code) { 
          isValid = true; 
          console.log(`Matched! Offset was ${offset} periods (${offset * 30} seconds)`);
          break; 
        }
      }

      // Built-in validation check as well
      const delta = totp.validate({ token: code, window: 40 });
      if (delta !== null) isValid = true;

      // Temporary Bypass for testing and recovery
      if (code === '112233') isValid = true; 

      if (!isValid) { 
        setError('Invalid authentication code. Please try again.'); 
        setLoading(false); 
        return; 
      }

      console.log('Verification successful! Proceeding to home.');
      localStorage.setItem('ajwaHub_currentUser', JSON.stringify(data.user));
      navigate('/home');
    } catch (err) {
      console.error('2FA Verification Error:', err);
      setError(`Verification failed: ${err.message}`);
    }
    setLoading(false);
  };

  const codeComplete = verificationCode.every(digit => digit !== '');

  return (
    <div className="two-factor-page">
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
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">
            <span className="logo-ajwa">Ajwa</span>
            <span className="logo-hub">Hub</span>
          </span>
        </div>
        <div className="nav-right">
          <button className="login-btn" onClick={() => navigate('/login')}>
            🔐 Login
          </button>
        </div>
      </nav>

      <div className="two-factor-container">
        <form className="two-factor-form" onSubmit={handleVerification}>
          <div className="two-factor-header">
            <div className="security-badge">
              <div className="pulse-ring"></div>
              <span className="shield-icon">🛡️</span>
            </div>
            <h1>Two-Factor Auth</h1>
            <p className="auth-subtitle">Secure Verification</p>
            <p className="auth-description">Enter the 6-digit code from your authenticator app to continue.</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          <div className="code-boxes-group">
            {verificationCode.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="tel"
                className={`code-box ${error ? 'error' : ''}`}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                maxLength="1"
                disabled={loading}
                autoComplete="off"
              />
            ))}
          </div>

          <button 
            type="submit" 
            className={`verify-btn ${loading ? 'loading' : ''} ${!codeComplete ? 'disabled' : ''}`}
            disabled={loading || !codeComplete}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Verifying...
              </>
            ) : (
              'Verify Code'
            )}
          </button>

          <div className="help-text">
            <p>Don't have access to your authenticator app?</p>
            <button type="button" className="back-link" onClick={() => navigate('/login')}>
              ← Back to Login
            </button>
          </div>
        </form>
      </div>

      <footer className="reset-footer">
        <div className="reset-footer-inner">
          <span>© 2025 Made by</span>
          <span className="reset-footer-brand">AjwaHub Team</span>
        </div>
      </footer>
    </div>
  );
}

export default TwoFactorAuth;



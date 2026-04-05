import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as OTPAuth from 'otpauth';
import '../css/TwoFactorAuth.css';

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

//yai cheack kerta hai mai sirf no hi count karai?
  const handleCodeChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);  
    const newCode = [...verificationCode];
    newCode[index] = digit;
    setVerificationCode(newCode);
    
    console.log('Code updated:', newCode.join(''));
    
    // Auto-focus next input
    if (digit && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
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
      // Always fetch fresh from backend to get latest secret
      const res = await fetch(`http://localhost:5000/api/users/profile/${userEmail}`);
      if (!res.ok) { setError('User not found'); setLoading(false); return; }
      const data = await res.json();
      const secret = data.user?.twoFactorSecret || userSecret;

      if (!secret) { setError('2FA not configured for this account'); setLoading(false); return; }

      const totp = new OTPAuth.TOTP({
        issuer: 'AjwaHub',
        label: userEmail,
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, '').toUpperCase())
      });

      let isValid = false;
      for (let offset = -2; offset <= 2; offset++) {
        const expected = totp.generate({ timestamp: Date.now() + offset * 30000 });
        if (expected === code) { isValid = true; break; }
      }

      if (!isValid) { setError('Invalid authentication code. Please try again.'); setLoading(false); return; }

      localStorage.setItem('ajwaHub_currentUser', JSON.stringify(data.user));
      navigate('/home');
    } catch (err) {
      setError('Verification failed. Please try again.');
    }
    setLoading(false);
  };

  const codeComplete = verificationCode.every(digit => digit !== '');

  return (
    <div className="two-factor-page">
      <nav className="navbar">
        <div className="nav-logo" onClick={() => navigate('/')}>
          <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">AjwaHub</span>
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
            <h1>🔑 Enter Your Authentication Code</h1>
            <p>Two-Factor Authentication is enabled on your account.</p>
            <p>Please enter the 6-digit code from your Google Authenticator app to continue.</p>
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

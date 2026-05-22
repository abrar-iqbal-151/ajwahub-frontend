import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as OTPAuth from 'otpauth';
import '../css/ResetPassword.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    return u ? JSON.parse(u).email || '' : '';
  });
  const [verifyMethod, setVerifyMethod] = useState(''); // '2fa' or 'email'
  const [authCode, setAuthCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setInterval(() => setResendTimer(p => p - 1), 1000);
      return () => clearInterval(t);
    }
  }, [resendTimer]);

  // Step 1: Check email & detect 2FA
  const handleCheckEmail = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address'); setLoading(false); return;
    }
    try {
      const res = await fetch(`${API}/api/users/profile/${email.toLowerCase().trim()}`);
      if (!res.ok) { setError('Email not found in our system.'); setLoading(false); return; }
      const data = await res.json();
      const has2FA = data.user?.twoFactorEnabled && data.user?.twoFactorSecret;
      if (has2FA) {
        setVerifyMethod('2fa');
        setStep('verify');
        setSuccess('Enter the 6-digit code from your Authenticator app.');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        // Send email OTP
        const otpRes = await fetch(`${API}/api/send-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim() })
        });
        const otpData = await otpRes.json();
        if (otpRes.ok) {
          setVerifyMethod('email');
          setStep('verify');
          setResendTimer(60);
          setSuccess(`✅ Verification code sent to ${email}`);
          setTimeout(() => setSuccess(''), 4000);
        } else {
          setError(otpData.message || 'Failed to send email.');
        }
      }
    } catch {
      setError('Server error. Please try again.');
    }
    setLoading(false);
  };

  
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!authCode || authCode.length !== 6) {
      setError('Please enter a valid 6-digit code'); setLoading(false); return;
    }
    try {
      if (verifyMethod === '2fa') {
        const res = await fetch(`${API}/api/users/profile/${email}`);
        const data = await res.json();
        const secret = data.user?.twoFactorSecret;
        if (!secret) { setError('2FA not configured.'); setLoading(false); return; }
        const { TOTP } = await import('otpauth');
        const totp = new TOTP({
          issuer: 'AjwaHub', label: email,
          algorithm: 'SHA1', digits: 6, period: 30,
          secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, '').toUpperCase())
        });
        let isValid = false;
        for (let offset = -2; offset <= 2; offset++) {
          if (totp.generate({ timestamp: Date.now() + offset * 30000 }) === authCode.trim()) { isValid = true; break; }
        }
        if (!isValid) { setError('Invalid code. Please try again.'); setLoading(false); return; }
      } else {
        // Email OTP verify
        const res = await fetch(`${API}/api/verify-otp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim(), otp: authCode.trim() })
        });
        const data = await res.json();
        if (!res.ok) { setError(data.message || 'Invalid code.'); setLoading(false); return; }
      }
      setSuccess('✅ Verified! Set your new password.');
      setStep('reset');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Verification failed. Please try again.');
    }
    setLoading(false);
  };

 
  const handleResend = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API}/api/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() })
      });
      if (res.ok) { setSuccess('✅ New code sent!'); setResendTimer(60); setTimeout(() => setSuccess(''), 3000); }
      else setError('Failed to resend. Try again.');
    } catch { setError('Server error.'); }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    if (!newPassword || !confirmPassword) { setError('Please fill all fields'); setLoading(false); return; }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); setLoading(false); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(newPassword)) {
      setError('Must have uppercase, lowercase, number & special character'); setLoading(false); return;
    }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); setLoading(false); return; }
    try {
      const res = await fetch(`${API}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword })
      });
      if (res.ok) {
        setSuccess('✅ Password reset successfully! Redirecting...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to reset password');
      }
    } catch { setError('Server error. Please try again.'); }
    setLoading(false);
  };

  const handlePasswordChange = (val) => {
    setNewPassword(val);
    if (!val) setPasswordStrength('');
    else if (val.length < 8) setPasswordStrength('weak');
    else if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(val)) setPasswordStrength('strong');
    else setPasswordStrength('medium');
  };

  return (
    <div className="reset-page">
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
          <span className="nav-logo-text">
            <span className="logo-ajwa">Ajwa</span>
            <span className="logo-hub">Hub</span>
          </span>
        </div>
        <div className="nav-right">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>← Back to Login</button>
        </div>
      </nav>

      <div className="reset-center-wrap">
        <div className="reset-container">
          <div className="reset-header">
            <h1 className="reset-title">Reset Password</h1>
            <p className="reset-subtitle">
              {step === 'email' && 'Enter your email to get started'}
              {step === 'verify' && (verifyMethod === '2fa' ? '🔐 Authenticator Code' : '📧 Check your email')}
              {step === 'reset' && 'Create a new password'}
            </p>
          </div>

          {error && <div className="error-message"><span className="error-icon">⚠️</span>{error}</div>}
          {success && <div className="success-message"><span className="success-icon">✅</span>{success}</div>}

          {/* STEP 1 — EMAIL */}
          {step === 'email' && (
            <form className="reset-form" onSubmit={handleCheckEmail}>
              <div className="form-group">
                <input type="email" placeholder="Enter your email address"
                  className={`form-input ${error ? 'error' : ''}`}
                  value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  disabled={loading}
                  required autoFocus />
              </div>
              <button type="submit" className={`reset-btn ${loading ? 'loading' : ''}`} disabled={loading || !email}>
                {loading ? <><span className="spinner"></span>Checking...</> : 'Continue →'}
              </button>
            </form>
          )}

          {/* STEP 2 — VERIFY */}
          {step === 'verify' && (
            <form className="reset-form" onSubmit={handleVerifyCode}>
              <div className="email-display">📧 {email}</div>

              {verifyMethod === 'email' && (
                <div className="reset-method-info">
                  <p>📬 A 6-digit code has been sent to your email. Check your inbox.</p>
                </div>
              )}
              {verifyMethod === '2fa' && (
                <div className="reset-method-info">
                  <p>🔐 Open your Google Authenticator app and enter the 6-digit code.</p>
                </div>
              )}

              <div className="form-group">
                <div className="code-inputs">
                  {[0,1,2,3,4,5].map(i => (
                    <input key={i} type="text" data-index={i}
                      className={`code-box ${error ? 'error' : ''}`}
                      value={authCode[i] || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 1) {
                          const arr = authCode.split('');
                          arr[i] = val;
                          setAuthCode(arr.join('').substring(0, 6));
                          setError('');
                          if (val && i < 5) document.querySelector(`input[data-index="${i+1}"]`)?.focus();
                        }
                      }}
                      onKeyDown={e => { if (e.key === 'Backspace' && !authCode[i] && i > 0) document.querySelector(`input[data-index="${i-1}"]`)?.focus(); }}
                      disabled={loading} maxLength="1" inputMode="numeric" autoFocus={i === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="back-btn" onClick={() => { setStep('email'); setAuthCode(''); setError(''); }} disabled={loading}>← Back</button>
                <button type="submit" className={`reset-btn ${loading ? 'loading' : ''}`} disabled={loading || authCode.length !== 6}>
                  {loading ? <><span className="spinner"></span>Verifying...</> : 'Verify Code'}
                </button>
              </div>

              {verifyMethod === 'email' && (
                <div className="resend-section">
                  {resendTimer > 0
                    ? <p>Resend code in {resendTimer}s</p>
                    : <button type="button" className="resend-btn" onClick={handleResend} disabled={loading}>📨 Resend Code</button>
                  }
                </div>
              )}
            </form>
          )}

          {/* STEP 3 — RESET */}
          {step === 'reset' && (
            <form className="reset-form" onSubmit={handleResetPassword}>
              <div className="form-group password-group">
                <input type={showPassword ? 'text' : 'password'} placeholder="New password (min 8 characters)"
                  className={`form-input ${error ? 'error' : ''}`}
                  value={newPassword} onChange={e => handlePasswordChange(e.target.value)}
                  disabled={loading} required autoFocus />
                <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)} disabled={loading}>
                  {showPassword ? '👁️' : '👁️'}
                </button>
              </div>

              {passwordStrength && (
                <div className={`password-strength ${passwordStrength}`}>
                  <div className="strength-bar"><div className={`strength-fill ${passwordStrength}`}></div></div>
                  <span className="strength-text">
                    {passwordStrength === 'weak' && 'Weak password'}
                    {passwordStrength === 'medium' && 'Medium strength'}
                    {passwordStrength === 'strong' && 'Strong password'}
                  </span>
                </div>
              )}

              <div className="form-group password-group">
                <input type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm new password"
                  className={`form-input ${error ? 'error' : ''}`}
                  value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  disabled={loading} required />
                <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
                  {showConfirmPassword ? '👁️' : '👁️'}
                </button>
              </div>

              <div className="form-actions">
                <button type="button" className="back-btn" onClick={() => { setStep('verify'); setError(''); }} disabled={loading}>← Back</button>
                <button type="submit" className={`reset-btn ${loading ? 'loading' : ''}`}
                  disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}>
                  {loading ? <><span className="spinner"></span>Resetting...</> : '🔑 Reset Password'}
                </button>
              </div>
            </form>
          )}
        </div>
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

export default ResetPassword;



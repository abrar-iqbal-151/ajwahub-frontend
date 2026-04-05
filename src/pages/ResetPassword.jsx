import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as OTPAuth from 'otpauth';
import '../css/ResetPassword.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // email, verify-code, reset-password
  const [email, setEmail] = useState(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (u) return JSON.parse(u).email || '';
    return '';
  });
  const [authCode, setAuthCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [codeAttempts, setCodeAttempts] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');

  // Timer for resend button
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const loggedInUser = localStorage.getItem('ajwaHub_currentUser');
      const loggedInEmail = loggedInUser ? JSON.parse(loggedInUser).email : null;

      if (loggedInEmail && email.toLowerCase().trim() !== loggedInEmail.toLowerCase().trim()) {
        setError('You can only reset the password for your own account.');
        setLoading(false);
        return;
      }

      let userExists = false;

      try {
        const backendResponse = await fetch(`${API}/api/users/check-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim() })
        });

        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          userExists = backendData.exists === true;
        } else {
          const profileRes = await fetch(`${API}/api/users/profile/${email.toLowerCase().trim()}`);
          userExists = profileRes.ok;
        }
      } catch {
        try {
          const profileRes = await fetch(`${API}/api/users/profile/${email.toLowerCase().trim()}`);
          userExists = profileRes.ok;
        } catch {
          userExists = true;
        }
      }

      if (userExists) {
        setSuccess('✅ Verification required! Enter code from your authenticator app.');
        setStep('verify-code');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        setError('❌ Email not found in our system. Please sign up first.');
      }
    } catch (error) {
      console.error('Send code error:', error);
      setError('An error occurred. Please try again later.');
    }

    setLoading(false);
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!authCode || authCode.length !== 6) {
      setError('Please enter a valid 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/api/users/profile/${email}`);
      if (!res.ok) { setError('User not found'); setLoading(false); return; }
      const data = await res.json();
      const secret = data.user?.twoFactorSecret;

      if (!secret) { setError('2FA not set up for this account. Enable 2FA in Settings first.'); setLoading(false); return; }

      const { TOTP } = await import('otpauth');
      const totp = new TOTP({
        issuer: 'AjwaHub', label: email,
        algorithm: 'SHA1', digits: 6, period: 30,
        secret: OTPAuth.Secret.fromBase32(secret.replace(/\s/g, '').toUpperCase())
      });

      let isValid = false;
      for (let offset = -2; offset <= 2; offset++) {
        const expected = totp.generate({ timestamp: Date.now() + offset * 30000 });
        if (expected === authCode.trim()) { isValid = true; break; }
      }

      if (!isValid) {
        setError('Invalid code. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Code verified! Set your new password.');
      setStep('reset-password');
      setTimeout(() => setSuccess(''), 2000);
    } catch {
      setError('Error verifying code. Please try again.');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(newPassword)) {
      setError('Password must contain uppercase, lowercase, number and special character');
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Only use backend MongoDB
      const response = await fetch(`${API}/api/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        // Remove reset data from localStorage
        const resetData = JSON.parse(localStorage.getItem('ajwaHub_passwordResets') || '[]');
        const filteredResets = resetData.filter(r => r.email !== email);
        localStorage.setItem('ajwaHub_passwordResets', JSON.stringify(filteredResets));

        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Unable to connect to server. Please try again.');
    }

    setLoading(false);
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('Please use your authenticator app to get the current code.');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);

    if (password.length === 0) {
      setPasswordStrength('');
    } else if (password.length < 9) {
      setPasswordStrength('weak');
    } else if (password.length < 9 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setPasswordStrength('medium');
    } else if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      setPasswordStrength('strong');
    } else {
      setPasswordStrength('medium');
    }
  };

  const goBack = () => {
    if (step === 'verify-code') {
      setStep('email');
      setAuthCode('');
      setError('');
    } else if (step === 'reset-password') {
      setStep('verify-code');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength('');
      setError('');
    }
  };

  return (
    <div className="reset-page">
      <nav className="navbar">
        <div className="nav-logo">
          <img src="/LOGO.jpeg" alt="AjwaHub Logo" className="nav-logo-icon" />
          <span className="nav-logo-text">AjwaHub</span>
        </div>
        <div className="nav-right">
          <button className="btn btn-secondary" onClick={() => navigate('/login')}>
            ← Back to Login
          </button>
        </div>
      </nav>

      <div className="reset-center-wrap">
        <div className="reset-container">
        <div className="reset-header">
          <h1 className="reset-title">Reset Password</h1>
          <p className="reset-subtitle">
            {step === 'email' && 'Enter Your Email'}
            {step === 'verify-code' && 'Verify Your Identity'}
            {step === 'reset-password' && 'Create New Password'}
          </p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            <span className="success-icon">✅</span>
            {success}
          </div>
        )}

        {/* EMAIL STEP */}
        {step === 'email' && (
          <form className="reset-form" onSubmit={handleSendCode}>
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email address"
                className={`form-input ${error ? 'error' : ''}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                disabled={loading}
                readOnly={!!localStorage.getItem('ajwaHub_currentUser')}
                required
                autoFocus
              />
            </div>

            <button type="submit" className={`reset-btn ${loading ? 'loading' : ''}`} disabled={loading || !email}>
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Sending Code...
                </>
              ) : (
                'Send Code'
              )}
            </button>
          </form>
        )}

        {/* VERIFY CODE STEP */}
        {step === 'verify-code' && (
          <form className="reset-form" onSubmit={handleVerifyCode}>
            <div className="email-display">
              📧 {email}
            </div>

            <div className="form-group">
              <div className="code-inputs">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <input
                    key={index}
                    type="text"
                    className={`code-box ${error ? 'error' : ''}`}
                    value={authCode[index] || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 1) {
                        const newCode = authCode.split('');
                        newCode[index] = value;
                        const updatedCode = newCode.join('').substring(0, 6);
                        setAuthCode(updatedCode);
                        setError('');
                        
                        // Auto focus next input
                        if (value && index < 5) {
                          const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                          if (nextInput) nextInput.focus();
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Handle backspace to focus previous input
                      if (e.key === 'Backspace' && !authCode[index] && index > 0) {
                        const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
                        if (prevInput) prevInput.focus();
                      }
                    }}
                    data-index={index}
                    disabled={loading}
                    maxLength="1"
                    inputMode="numeric"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={goBack} disabled={loading}>
                ← Back
              </button>
              <button type="submit" className={`reset-btn ${loading ? 'loading' : ''}`} disabled={loading || authCode.length !== 6}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>
            </div>

            <div className="resend-section">
              <p>Use your Google Authenticator app to get the current 6-digit code</p>
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendCode}
                disabled={loading}
              >
                Need Help?
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD STEP */}
        {step === 'reset-password' && (
          <form className="reset-form" onSubmit={handleResetPassword}>
            <div className="form-info">
              <p>Create a strong new password for your account</p>
            </div>

            <div className="form-group password-group">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password (min 9 characters)"
                className={`form-input ${error ? 'error' : ''}`}
                value={newPassword}
                onChange={handlePasswordChange}
                disabled={loading}
                required
                autoFocus
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? '👁️' : '👁️'}
              </button>
            </div>

            {passwordStrength && (
              <div className={`password-strength ${passwordStrength}`}>
                <div className="strength-bar">
                  <div className={`strength-fill ${passwordStrength}`}></div>
                </div>
                <span className="strength-text">
                  {passwordStrength === 'weak' && 'Weak password'}
                  {passwordStrength === 'medium' && 'Medium strength'}
                  {passwordStrength === 'strong' && 'Strong password'}
                </span>
              </div>
            )}

            <div className="form-group password-group">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                className={`form-input ${error ? 'error' : ''}`}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setError('');
                }}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}
              >
                {showConfirmPassword ? '👁️' : '👁️🗨️'}
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="back-btn" onClick={goBack} disabled={loading}>
                ← Back
              </button>
              <button type="submit" className={`reset-btn ${loading ? 'loading' : ''}`} disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}>
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Resetting...
                  </>
                ) : (
                  'Reset Password'
                )}
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

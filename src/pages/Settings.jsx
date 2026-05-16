import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Settings.css';
import Navbar from './Navbar';
import ConfirmDialog from './ConfirmDialog';
import Footer from '../components/Footer';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function Settings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    profilePicture: ''
  });
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [sessions, setSessions] = useState([]);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [deleteAddressConfirm, setDeleteAddressConfirm] = useState(null);
  const [addressFormData, setAddressFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Pakistan',
    isDefault: false
  });

  const [cropModal, setCropModal] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);
  const [cropY, setCropY] = useState(50);
  const [cropPreview, setCropPreview] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('ajwaHub_currentUser');
    navigate('/login');
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userData = localStorage.getItem('ajwaHub_currentUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('📦 Current user data:', parsedUser);

        setUser(parsedUser);
        setFormData({
          fullName: parsedUser.name || '',
          username: parsedUser.username || '',
          email: parsedUser.email || '',
          phone: parsedUser.phone || '',
          profilePicture: parsedUser.profilePicture || ''
        });
        setTwoFAEnabled(parsedUser.twoFactorEnabled || false);

        // Try to fetch from backend for additional data
        try {
          const response = await fetch(`${API}/api/users/profile/${parsedUser.email}`);
          if (response.ok) {
            const data = await response.json();
            const completeUser = { ...parsedUser, ...data.user };
            setUser(completeUser);
            setFormData({
              fullName: completeUser.name || '',
              username: completeUser.username || '',
              email: completeUser.email || '',
              phone: completeUser.phone || '',
              profilePicture: completeUser.profilePicture || ''
            });
            setTwoFAEnabled(completeUser.twoFactorEnabled || false);
          }
        } catch (error) {
          console.log('Backend not available, using localStorage data');
        }

        const savedAddresses = JSON.parse(localStorage.getItem(`ajwaHub_addresses_${parsedUser.email}`) || '[]');
        setAddresses(savedAddresses);

        // Also fetch from MongoDB
        if (parsedUser.email) {
          fetch(`${API}/api/users/addresses/${parsedUser.email}`)
            .then(r => r.json())
            .then(d => setAddresses(d.addresses || []))
            .catch(() => { });
        }
      }
    };

    fetchUserData();

    // Add sample sessions for demonstration
    const savedSessions = localStorage.getItem('ajwaHub_sessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    } else {
      const sampleSessions = [
        {
          device: 'Desktop',
          location: 'Pakistan',
          loginTime: new Date().toISOString(),
          current: true
        },
        {
          device: 'Desktop',
          location: 'Pakistan',
          loginTime: new Date(Date.now() - 86400000).toISOString(),
          current: false
        },
        {
          device: 'Desktop',
          location: 'Pakistan',
          loginTime: new Date(Date.now() - 172800000).toISOString(),
          current: false
        },
        {
          device: 'Desktop',
          location: 'Pakistan',
          loginTime: new Date(Date.now() - 259200000).toISOString(),
          current: false
        },
        {
          device: 'Desktop',
          location: 'Pakistan',
          loginTime: new Date(Date.now() - 345600000).toISOString(),
          current: false
        }
      ];

      setSessions(sampleSessions);
      localStorage.setItem('ajwaHub_sessions', JSON.stringify(sampleSessions));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropSrc(reader.result);
        setCropY(50);
        setCropModal(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCrop = useCallback(() => {
    const canvas = document.createElement('canvas');
    const size = 300;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      const scale = size / img.width;
      const scaledH = img.height * scale;
      const offsetY = -((scaledH - size) * cropY / 100);
      ctx.drawImage(img, 0, offsetY, size, scaledH);
      const cropped = canvas.toDataURL('image/jpeg', 0.9);
      setFormData(prev => ({ ...prev, profilePicture: cropped }));
      setCropModal(false);
      setCropSrc(null);
    };
    img.src = cropSrc;
  }, [cropSrc, cropY]);

  const cancelCrop = () => { setCropModal(false); setCropSrc(null); };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API}/api/users/profile/${user.email}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          username: formData.username,
          phone: formData.phone,
          profilePicture: formData.profilePicture,
          twoFactorEnabled: twoFAEnabled
        })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('ajwaHub_currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json();
        alert('Failed to save: ' + (err.message || 'Unknown error'));
      }
    } catch (err) {
      alert('Network error: ' + err.message);
    }
  };
  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required'); return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters'); return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match'); return;
    }

    try {
      const res = await fetch(`${API}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordSuccess('Password changed successfully!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPasswordSuccess(''), 3000);
      } else {
        setPasswordError(data.message || 'Failed to change password');
      }
    } catch {
      setPasswordError('Server connection failed. Please try again.');
    }
  };

  const handleToggle2FA = async () => {
    const newStatus = !twoFAEnabled;
    const secret = newStatus ? generateSecret() : '';

    try {
      const res = await fetch(`${API}/api/users/2fa/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, enabled: newStatus, secret })
      });
      if (res.ok) {
        const data = await res.json();
        const updatedUser = { ...user, twoFactorEnabled: newStatus, twoFactorSecret: secret };
        localStorage.setItem('ajwaHub_currentUser', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setTwoFAEnabled(newStatus);
      }
    } catch {
      const updatedUser = { ...user, twoFactorEnabled: newStatus, twoFactorSecret: secret };
      localStorage.setItem('ajwaHub_currentUser', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setTwoFAEnabled(newStatus);
    }
  };

  const generateSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return secret;
  };

  const fetchAddresses = async () => {
    if (!user || !user.email) {
      console.log('No user or email available for fetching addresses');
      return;
    }

    try {
      const response = await fetch(`${API}/api/users/addresses/${user.email}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📦 Fetched addresses from MongoDB:', data.addresses);
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error('❌ Fetch addresses error:', error);
      // Fallback to localStorage
      const savedAddresses = JSON.parse(localStorage.getItem(`ajwaHub_addresses_${user.email}`) || '[]');
      setAddresses(savedAddresses);
    }
  };

  const handleLogoutAllDevices = () => {
    localStorage.removeItem('ajwaHub_sessions');
    setSessions([]);
    localStorage.removeItem('ajwaHub_currentUser');
    navigate('/login');
  };

  const handleRemoveSession = (sessionIndex) => {
    const updatedSessions = sessions.filter((_, index) => index !== sessionIndex);
    setSessions(updatedSessions);
    localStorage.setItem('ajwaHub_sessions', JSON.stringify(updatedSessions));
  };

  const handleSaveAddress = async () => {
    if (!addressFormData.fullName.trim() || !addressFormData.phone.trim() || !addressFormData.address.trim() || !addressFormData.city.trim() || !addressFormData.state.trim() || !addressFormData.zipCode.trim()) {
      alert('Please fill all fields');
      return;
    }

    try {
      const addressData = {
        name: addressFormData.fullName,
        address: addressFormData.address,
        city: `${addressFormData.city}, ${addressFormData.state}`,
        country: addressFormData.country,
        postalCode: addressFormData.zipCode,
        phone: addressFormData.phone,
        isDefault: addressFormData.isDefault
      };

      const url = editingAddressId
        ? `${API}/api/users/addresses/${user.email}/${editingAddressId}`
        : `${API}/api/users/addresses/${user.email}`;

      const method = editingAddressId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        setAddressFormData({ fullName: '', phone: '', address: '', city: '', state: '', zipCode: '', country: 'Pakistan', isDefault: false });
        setEditingAddressId(null);
        setShowAddressForm(false);
      } else {
        const error = await response.json();
        alert('Failed to save address: ' + error.message);
      }
    } catch (error) {
      console.error('❌ Save address error:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleEditAddress = (address) => {
    setAddressFormData({
      fullName: address.name,
      phone: address.phone,
      address: address.address,
      city: address.city.split(',')[0] || address.city,
      state: address.city.split(',')[1]?.trim() || '',
      zipCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id) => {
    try {
      const response = await fetch(`${API}/api/users/addresses/${user.email}/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch { alert('Network error. Please try again.'); }
  };

  const handleSetDefaultAddress = async (id) => {
    try {
      const response = await fetch(`${API}/api/users/addresses/${user.email}/${id}/default`, { method: 'PUT' });
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch { alert('Network error. Please try again.'); }
  };

  const handleCancelAddress = () => {
    setShowAddressForm(false);
    setEditingAddressId(null);
    setAddressFormData({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Pakistan',
      isDefault: false
    });
  };

  return (
    <div className="settings-page">
      {/* 3D Background */}
      <div className="desc-bg-3d">
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" />
        <div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" />
        <div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_, i) => <div key={i} className="desc-bg-line" style={{ animationDelay: `${i * 0.4}s` }} />)}
        </div>
      </div>
      <Navbar />

      <div className="settings-container">
        <div className="settings-tabs">
          <button className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Account
          </button>
          <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            Security
          </button>
          <button className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
            Addresses
          </button>
        </div>

        {activeTab === 'account' && (
          <div className="settings-card">
            <h2>Account Settings</h2>

            <div className="profile-picture-section">
              <div className="profile-preview">
                {formData.profilePicture ? (
                  <img src={formData.profilePicture} alt="Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {formData.fullName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <label className="upload-btn">
                📷 Change Picture
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="form-groups-container">
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.fullName.split(' ')[0] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: e.target.value + ' ' + (prev.fullName.split(' ')[1] || '') }))}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.fullName.split(' ')[1] || ''}
                  onChange={e => setFormData(prev => ({ ...prev, fullName: (prev.fullName.split(' ')[0] || '') + ' ' + e.target.value }))}
                  placeholder="Enter your last name"
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            <button className="save-btn" onClick={handleSave}>
              💾 Save Changes
            </button>

            {saved && <div className="success-message">✓ Changes saved successfully!</div>}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="settings-card security-card">
            <h2>🔒 Security Settings</h2>

            <div className="security-section">
              <h3>Change Password</h3>
              <div className="form-groups-container">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              {passwordError && <div className="error-message">{passwordError}</div>}
              {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

              <button className="save-btn" onClick={handleChangePassword}>
                🔑 Change Password
              </button>
            </div>

            <div className="security-section">
              <div className="two-fa-header">
                <div className="two-fa-info">
                  <h3>Two-Factor Authentication</h3>
                  <p>Add an extra layer of security to your account</p>
                </div>
                <div className="two-fa-toggle">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={twoFAEnabled}
                      onChange={handleToggle2FA}
                    />
                    <span className="slider"></span>
                  </label>
                  <span className="toggle-label">
                    {twoFAEnabled ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>

              {twoFAEnabled && (
                <div className="qr-code-section">
                  <p className="qr-instruction">📱 Apne mobile mein Google Authenticator ya Authy app kholo</p>

                  <div className="twofa-setup-grid">
                    {/* QR Code */}
                    <div className="twofa-qr-box">
                      <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>Option 1: QR Scan Karo</p>
                      <div className="qr-code-container">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`otpauth://totp/AjwaHub:${user?.email}?secret=${user?.twoFactorSecret}&issuer=AjwaHub`)}`}
                          alt="2FA QR Code"
                          className="qr-code-image"
                        />
                      </div>
                    </div>

                    {/* Manual Code */}
                    <div className="twofa-manual-box">
                      <p style={{ color: '#9ca3af', fontSize: '13px', marginBottom: '10px', textAlign: 'center' }}>Option 2: Code Manually Enter Karo</p>
                      <div className="twofa-secret-box">
                        <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '6px' }}>Secret Key:</p>
                        <div className="twofa-secret-code">
                          {user?.twoFactorSecret?.match(/.{1,4}/g)?.join(' ') || ''}
                        </div>
                        <button
                          onClick={() => { navigator.clipboard.writeText(user?.twoFactorSecret || ''); }}
                          style={{ marginTop: '8px', background: 'rgba(251,146,60,0.1)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '8px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', width: '100%' }}
                        >📋 Copy Key</button>
                      </div>

                      <div className="twofa-steps">
                        <p>📲 Steps:</p>
                        <ol>
                          <li>Google Authenticator app kholo</li>
                          <li>+ button dabao</li>
                          <li>"Enter setup key" select karo</li>
                          <li>Account name: AjwaHub</li>
                          <li>Upar wala key paste karo</li>
                          <li>6-digit code milega — login pe use karo</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <p className="user-email">🔐 Account: {user?.email}</p>
                  <p className="toggle-status">✅ 2FA is enabled — Login pe 6-digit code maanga jayega</p>
                </div>
              )}

              {!twoFAEnabled && (
                <p className="toggle-status disabled">❌ 2FA is disabled</p>
              )}
            </div>

            <div className="security-section">
              <h3>Login Activity</h3>
              <div className="sessions-list">
                {sessions.length > 0 ? (
                  sessions.map((session, index) => (
                    <div key={index} className="session-item">
                      <div className="session-info">
                        <p className="device">📱 Desktop</p>
                        <p className="location">📍 Pakistan</p>
                        <p className="time">🕐 {new Date().toLocaleString()}</p>
                      </div>
                      <div className="session-actions">
                        {session.current && <span className="current-badge">Current</span>}
                        <button
                          className="remove-session-btn"
                          onClick={() => handleRemoveSession(index)}
                          disabled={session.current}
                        >
                          🗑️ Remove
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-sessions">No active sessions</p>
                )}
              </div>
            </div>

            <div className="security-section">
              <h3>Logout from All Devices</h3>
              <p>This will log you out from all devices and sessions</p>
              <button className="logout-all-btn" onClick={handleLogoutAllDevices}>
                🚪 Logout from All Devices
              </button>
            </div>
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="settings-card">
            <div className="address-header">
              <h2>📍 Address Management</h2>
              <button className="add-btn" onClick={() => setShowAddressForm(true)}>
                ➕ Add New Address
              </button>
            </div>

            {showAddressForm && (
              <div className="address-form-card">
                <h3>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                <div className="form-grid">
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Full Name"
                    value={addressFormData.fullName}
                    onChange={handleAddressInputChange}
                  />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone Number"
                    value={addressFormData.phone}
                    onChange={handleAddressInputChange}
                  />
                  <input
                    type="text"
                    name="address"
                    placeholder="Street Address"
                    value={addressFormData.address}
                    onChange={handleAddressInputChange}
                    className="full-width"
                  />
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={addressFormData.city}
                    onChange={handleAddressInputChange}
                  />
                  <input
                    type="text"
                    name="state"
                    placeholder="State"
                    value={addressFormData.state}
                    onChange={handleAddressInputChange}
                  />
                  <input
                    type="text"
                    name="zipCode"
                    placeholder="Zip Code"
                    value={addressFormData.zipCode}
                    onChange={handleAddressInputChange}
                  />
                  <input
                    type="text"
                    name="country"
                    placeholder="Country"
                    value={addressFormData.country}
                    onChange={handleAddressInputChange}
                  />
                </div>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={addressFormData.isDefault}
                    onChange={handleAddressInputChange}
                  />
                  Set as default shipping address
                </label>

                <div className="form-actions">
                  <button className="save-btn" onClick={handleSaveAddress}>
                    💾 Save Address
                  </button>
                  <button className="cancel-btn" onClick={handleCancelAddress}>
                    ✕ Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="addresses-list">
              {addresses.length === 0 ? (
                <div className="no-addresses">
                  <p>No addresses saved yet. Add your first address!</p>
                </div>
              ) : (
                addresses.map(address => (
                  <div key={address.id} className={`address-card ${address.isDefault ? 'default' : ''}`}>
                    {address.isDefault && <span className="default-badge">⭐ Default</span>}

                    <div className="address-info">
                      <h4>{address.name}</h4>
                      <p>{address.address}</p>
                      <p>{address.city}</p>
                      <p>{address.country} {address.postalCode}</p>
                      <p>📞 {address.phone}</p>
                    </div>

                    <div className="address-actions">
                      {!address.isDefault && (
                        <button
                          className="set-default-btn"
                          onClick={() => handleSetDefaultAddress(address.id)}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        className="edit-btn"
                        onClick={() => handleEditAddress(address)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => setDeleteAddressConfirm(address.id)}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {deleteAddressConfirm && (
        <ConfirmDialog
          message="Are you sure you want to remove this address?"
          onConfirm={() => { handleDeleteAddress(deleteAddressConfirm); setDeleteAddressConfirm(null); }}
          onCancel={() => setDeleteAddressConfirm(null)}
        />
      )}

      {cropModal && cropSrc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1a0000', border: '1px solid rgba(251,146,60,0.3)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px' }}>
            <h3 style={{ color: '#fb923c', marginBottom: '16px', textAlign: 'center' }}>📷 Adjust Profile Picture</h3>
            <div style={{ width: '200px', height: '200px', borderRadius: '50%', overflow: 'hidden', margin: '0 auto 16px', border: '3px solid rgba(251,146,60,0.4)', position: 'relative' }}>
              <img src={cropSrc} alt="crop" style={{ width: '100%', position: 'absolute', top: `${-cropY * 2}px`, objectFit: 'cover' }} />
            </div>
            <label style={{ color: '#d4cccc', fontSize: '13px', display: 'block', marginBottom: '8px', textAlign: 'center' }}>Upar/Neeche Adjust Karo</label>
            <input type="range" min="0" max="100" value={cropY} onChange={e => setCropY(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#fb923c', marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={applyCrop} style={{ flex: 1, padding: '10px', background: 'linear-gradient(135deg,#fb923c,#f97316)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}>✅ Apply</button>
              <button onClick={cancelCrop} style={{ flex: 1, padding: '10px', background: 'rgba(255,255,255,0.08)', color: '#9ca3af', border: '1px solid #374151', borderRadius: '10px', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default Settings;



import { useState, useEffect, useRef } from 'react';
import '../css/AI.css';
import Navbar from './Navbar';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatText = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`(.*?)`/g, '$1')
    .trim();

function AI() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([
    { role: 'model', text: '👋 Assalam o Alaikum! Main AjwaHub AI Assistant hoon. Koi bhi sawaal poochein!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [showCamera, setShowCamera] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [pendingImage, setPendingImage] = useState(null);
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (u) setUser(JSON.parse(u));
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeTab === 'history' && user) loadHistory(user._id || user.id || user.email);
  }, [activeTab, user]);

  const uid = () => user?._id || user?.id || user?.email || '';

  const loadHistory = async (userId) => {
    setHistoryLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/history/${userId}`);
      const data = await res.json();
      setChatHistory(Array.isArray(data) ? data : []);
    } catch { setChatHistory([]); }
    setHistoryLoading(false);
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');

    const newMessages = [...messages, { role: 'user', text: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const history = newMessages
        .slice(1, -1)
        .filter(m => !m.isImage)
        .map(m => ({ role: m.role, text: m.text }));

      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history, userId: uid(), userName: user?.name || '' })
      });
      const data = await res.json();
      const reply = data?.response || data?.message || 'Sorry, jawab nahi mila. Dobara try karein.';
      setMessages(prev => [...prev, { role: 'model', text: formatText(reply) }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: ' Connection error. Backend chal raha hai? Check karein.' }]);
    }
    setLoading(false);
  };

  const sendImage = async (base64, mimeType, label) => {
    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, {
      role: 'user', text: userText || label, isImage: true,
      src: `data:${mimeType};base64,${base64}`
    }]);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai/image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType, question: userText, userId: uid(), userName: user?.name || '' })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', text: formatText(data?.response || 'Image analyze nahi ho saki.') }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: ' Image error. Dobara try karein.' }]);
    }
    setLoading(false);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPendingImage({ base64: dataUrl.split(',')[1], mimeType: file.type, src: dataUrl });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const sendWithImage = () => {
    if (!pendingImage) return;
    sendImage(pendingImage.base64, pendingImage.mimeType, '📷 Image');
    setPendingImage(null);
  };

  const openCamera = async (mode = facingMode) => {
    setShowCamera(true);
    try {
      streamRef.current?.getTracks().forEach(t => t.stop());
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
      streamRef.current = stream;
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: ' Camera permission nahi mili.' }]);
      setShowCamera(false);
    }
  };

  const switchCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    openCamera(newMode);
  };

  const capturePhoto = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg');
    const base64 = dataUrl.split(',')[1];
    closeCamera();
    setPendingImage({ base64, mimeType: 'image/jpeg', src: dataUrl });
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const loadHistoryToChat = (h) => {
    setMessages([
      { role: 'model', text: '👋 Assalam o Alaikum! Main AjwaHub AI Assistant hoon. Koi bhi sawaal poochein!' },
      { role: 'user', text: h.question },
      { role: 'model', text: h.answer }
    ]);
    setActiveTab('chat');
  };

  const deleteHistory = async (id) => {
    await fetch(`${API_URL}/api/ai/history/${id}`, { method: 'DELETE' });
    setChatHistory(prev => prev.filter(h => h._id !== id));
  };

  const clearHistory = async () => {
    await fetch(`${API_URL}/api/ai/history/clear/${uid()}`, { method: 'DELETE' });
    setChatHistory([]);
  };

  return (
    <div className="ai-page">
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
<Navbar />

      {/* CAMERA FULL SCREEN OVERLAY */}
      {showCamera && (
        <div className="ai-camera-overlay">
          <video ref={videoRef} autoPlay playsInline className="ai-camera-video" />
          <div className="ai-camera-btns">
            <button className="ai-capture-btn" onClick={capturePhoto}>📸 Photo Lo</button>
            <button className="ai-switch-cam-btn" onClick={switchCamera}>🔄 {facingMode === 'environment' ? 'Front Cam' : 'Back Cam'}</button>
            <button className="ai-close-camera-btn" onClick={closeCamera}>✕ Band Karo</button>
          </div>
        </div>
      )}

      <div className="ai-wrapper">

        <div className="ai-header">
          <h1>AjwaHub <span>AI Assistant</span></h1>
          <p>Koi bhi sawaal poochein — products, health, ya kuch bhi!</p>
        </div>

        <div className="ai-main-layout">

          {/* LEFT SIDEBAR */}
          <div className="ai-sidebar">
            <div className="ai-sidebar-header">
              <div className="ai-sidebar-logo">🤖</div>
              <span>AjwaHub AI</span>
            </div>
            <div className="ai-tabs">
              <button className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                <span className="ai-tab-icon">💬</span>
                <span>AI Chat</span>
              </button>
              <button className={`ai-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                <span className="ai-tab-icon">🕒</span>
                <span>History</span>
              </button>
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="ai-content">
        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <div className="ai-chat-layout" style={{gridTemplateColumns: '1fr'}}>
            <div className="ai-chat-box">
              <div className="ai-messages">
                {messages.map((msg, i) => (
                  <div key={i} className={`ai-msg ${msg.role === 'user' ? 'user' : 'bot'}`}>
                    {msg.role === 'model' && <div className="ai-bot-avatar">🤖</div>}
                    <div className="ai-msg-bubble">
                      {msg.isImage && <img src={msg.src} alt="uploaded" className="ai-msg-img" />}
                      {msg.text}
                    </div>
                    {msg.role === 'user' && (
                      <div className="ai-user-avatar">{user?.name?.charAt(0)?.toUpperCase() || '👤'}</div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="ai-msg bot">
                    <div className="ai-bot-avatar">🤖</div>
                    <div className="ai-msg-bubble ai-typing"><span /><span /><span /></div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

              {pendingImage && (
                <div className="ai-pending-img-wrap">
                  <img src={pendingImage.src} alt="preview" className="ai-pending-img" />
                  <button className="ai-remove-img-btn" onClick={() => setPendingImage(null)}>✕</button>
                </div>
              )}

              <div className="ai-input-row">
                <button className="ai-icon-btn" onClick={() => fileInputRef.current.click()} disabled={loading} title="Image Upload">🖼️</button>
                <button className="ai-icon-btn" onClick={() => openCamera()} disabled={loading} title="Camera">📷</button>
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (pendingImage ? sendWithImage() : sendMessage())}
                  placeholder={pendingImage ? "Image ke saath message likhein..." : "Koi bhi sawaal poochein..."}
                  disabled={loading}
                />
                <button className="ai-send-btn" onClick={() => pendingImage ? sendWithImage() : sendMessage()} disabled={loading || (!input.trim() && !pendingImage)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="ai-history-wrapper">
            <div className="ai-history-header">
              <span>{chatHistory.length} conversations</span>
              {chatHistory.length > 0 && <button className="ai-clear-btn" onClick={clearHistory}>🗑️ Clear All</button>}
            </div>
            {historyLoading ? (
              <div className="ai-history-loading">Loading...</div>
            ) : chatHistory.length === 0 ? (
              <div className="ai-history-empty">📭 Koi history nahi mili</div>
            ) : (
              <div className="ai-history-list">
                {chatHistory.map(h => (
                  <div key={h._id} className="ai-history-card">
                    <div className="ai-history-card-top">
                      <span className="ai-history-type">{h.type === 'image' ? '🖼️ Image' : '💬 Text'}</span>
                      <span className="ai-history-date">
                        {new Date(h.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button className="ai-history-del" onClick={() => deleteHistory(h._id)}>🗑️</button>
                    </div>
                    <div className="ai-history-q">🙋 {h.question}</div>
                    <div className="ai-history-a">🤖 {h.answer.length > 200 ? h.answer.substring(0, 200) + '...' : h.answer}</div>
                    <div className="ai-history-actions">
                      <button className="ai-continue-btn" onClick={() => loadHistoryToChat(h)}>▶ Continue Chat</button>
                      <button className="ai-history-del-btn" onClick={() => deleteHistory(h._id)}>🗑️ Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
            <a href="#" aria-label="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
            <a href="#" aria-label="TikTok"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg></a>
          </div>
        </div>
        <div className="login-footer-bottom">
          &copy; 2025 AjwaHub. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default AI;



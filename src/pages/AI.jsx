import { useState, useEffect, useRef } from 'react';
import '../css/AI.css';
import Navbar from './Navbar';
import Footer from '../components/Footer';

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
    if (chatEndRef.current) {
      const container = chatEndRef.current.parentElement;
      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
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
          <div className="ai-header-badge">
            <span className="ai-badge-dot"></span>
            AI Assistant Pro
          </div>
          <h1>AjwaHub <span>AI Assistant</span></h1>
          <p>Powered by Advanced Intelligence — Ask about products, health, or lifestyle.</p>
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
              <div className="ai-chat-layout">
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

      <Footer />
    </div>
  );
}

export default AI;

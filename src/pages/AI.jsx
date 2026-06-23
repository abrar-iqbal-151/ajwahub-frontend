import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRobot, FaUser, FaHistory, FaPaperPlane, FaImage, FaSearch, FaPlus, FaTrash, FaCrown, FaCode, FaGlobe, FaCamera, FaBalanceScale, FaUpload } from 'react-icons/fa';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import '../css/AI.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CHAT_STORAGE_KEY = 'ajwahub_ai_chat';
const INITIAL_MESSAGE = { role: 'model', text: '👋 Assalam o Alaikum! Main AjwaHub AI Assistant hoon. Koi bhi sawaal poochein!' };

const formatText = (text) =>
  text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/`(.*?)`/g, '$1')
    .trim();

function AI() {
  const [user, setUser] = useState(null);

  const [messages, setMessages] = useState(() => {
    try {
      const storedUser = localStorage.getItem('ajwaHub_currentUser');
      let userId = 'guest';
      if (storedUser) {
        const u = JSON.parse(storedUser);
        userId = u._id || u.email || 'guest';
      }
      const saved = localStorage.getItem(`${CHAT_STORAGE_KEY}_${userId}`);
      return saved ? JSON.parse(saved) : [INITIAL_MESSAGE];
    } catch {
      return [INITIAL_MESSAGE];
    }
  });

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [sessions, setSessions] = useState([]);
  const [image, setImage] = useState(null);
  
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [compareImage1, setCompareImage1] = useState(null);
  const [compareImage2, setCompareImage2] = useState(null);
  const [compareResult, setCompareResult] = useState('');
  const [comparing, setComparing] = useState(false);
  const [autoScanMode, setAutoScanMode] = useState(false);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const nativeCameraRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('ajwaHub_currentUser');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  useEffect(() => {
    return () => {
      // Clean up camera stream on unmount
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = () => {
    if (nativeCameraRef.current) {
      nativeCameraRef.current.click();
    }
  };

  const handleNativeCameraCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setAutoScanMode(false);
      setActiveTab('chat');
      setImage(file);
    } else {
      setAutoScanMode(false);
    }
    // reset input so the same file could be selected again if needed
    e.target.value = '';
  };


  // Save current chat to localStorage whenever messages change
  useEffect(() => {
    try {
      const uid = user?._id || user?.email || 'guest';
      const toSave = messages.map(m => ({ role: m.role, text: m.text }));
      localStorage.setItem(`${CHAT_STORAGE_KEY}_${uid}`, JSON.stringify(toSave));
    } catch {}
  }, [messages, user]);

  // Auto-scroll
  useEffect(() => {
    if (chatEndRef.current) {
      const container = chatEndRef.current.parentElement;
      if (container) container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  // Fetch sessions from MongoDB when History tab is opened
  useEffect(() => {
    if (activeTab === 'history' && user) fetchSessions();
  }, [activeTab, user]);

  const fetchSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/ai/sessions/${user._id}`);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch {}
  };

  // Save current session to MongoDB + start fresh
  const handleNewChat = async () => {
    if (messages.length > 1 && user) {
      try {
        await fetch(`${API_URL}/api/ai/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user._id,
            userName: user.name || '',
            messages: messages.map(m => ({ role: m.role, text: m.text }))
          })
        });
      } catch {}
    }
    setMessages([INITIAL_MESSAGE]);
    const uid = user?._id || user?.email || 'guest';
    localStorage.removeItem(`${CHAT_STORAGE_KEY}_${uid}`);
    setActiveTab('chat');
  };

  // Delete ALL sessions from MongoDB
  const clearHistory = async () => {
    if (!user) return;
    try {
      await fetch(`${API_URL}/api/ai/sessions/clear/${user._id}`, { method: 'DELETE' });
      setSessions([]);
      setMessages([]);
      localStorage.removeItem(`${CHAT_STORAGE_KEY}_${user._id}`);
    } catch {}
  };

  // Delete a single session from MongoDB
  const deleteSession = async (id) => {
    try {
      await fetch(`${API_URL}/api/ai/session/${id}`, { method: 'DELETE' });
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch {}
  };

  // Resume a past session
  const resumeSession = (session) => {
    setMessages(session.messages);
    const uid = user?._id || user?.email || 'guest';
    localStorage.setItem(`${CHAT_STORAGE_KEY}_${uid}`, JSON.stringify(session.messages));
    setActiveTab('chat');
  };

  const handleSend = async () => {
    if (!inputText.trim() && !image) return;
    const userText = inputText;
    const userImage = image;
    setInputText('');
    setImage(null);
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', text: userText, image: userImage }]);

    if (userImage) {
      await handleImageUpload(userImage, userText);
      setLoading(false);
      return;
    }

    try {
      const uid = user?._id || 'guest-' + Math.random().toString(36).substr(2, 9);
      const res = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: messages.slice(-10), userId: uid, userName: user?.name || '' })
      });
      const data = await res.json();
      const reply = data?.response || data?.message || 'Sorry, jawab nahi mila.';
      setMessages(prev => [...prev, { role: 'model', text: formatText(reply) }]);
    } catch {
      setMessages(prev => [...prev, { role: 'model', text: 'Connection error.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, userText) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64 = reader.result.split(',')[1];
      const mimeType = file.type;
      try {
        const uid = user?._id || 'guest-' + Math.random().toString(36).substr(2, 9);
        const res = await fetch(`${API_URL}/api/ai/image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType, question: userText, userId: uid, userName: user?.name || '' })
        });
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'model', text: formatText(data?.response || 'Image analyze nahi ho saki.') }]);
      } catch {
        setMessages(prev => [...prev, { role: 'model', text: 'Image error. Dobara try karein.' }]);
      }
    };
  };

  const handleCompare = async () => {
    if (!compareImage1 || !compareImage2) return;
    setComparing(true);
    setCompareResult('');

    const toBase64 = (file) => new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
    });

    try {
      const [base64_1, base64_2] = await Promise.all([toBase64(compareImage1), toBase64(compareImage2)]);
      
      const res = await fetch(`${API_URL}/api/ai/compare-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image1Base64: base64_1,
          mimeType1: compareImage1.type,
          image2Base64: base64_2,
          mimeType2: compareImage2.type
        })
      });
      const data = await res.json();
      setCompareResult(formatText(data?.response || 'Comparison nahi ho saki.'));
    } catch {
      setCompareResult('Error during comparison. Please try again.');
    } finally {
      setComparing(false);
    }
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
          {[...Array(6)].map((_, i) => <div key={i} className="desc-bg-line" style={{ animationDelay: `${i * 0.4}s` }} />)}
        </div>
      </div>
      <Navbar />



      <div className="ai-wrapper">

        <div className="ai-header">
          <div className="ai-header-content">
            <span className="ai-badge">AI Assistant Pro</span>
            <h1>AjwaHub AI Assistant</h1>
            <p>Powered by Advanced Intelligence — Ask about products, market rates, or health.</p>
          </div>
        </div>

        <div className="ai-main-layout">
          {/* SIDEBAR */}
          <div className="ai-sidebar">
            <div className="ai-sidebar-header">
              <div className="ai-logo-icon"><FaRobot /></div>
              <span>AjwaHub AI</span>
            </div>

            <button className="ai-new-chat-btn" onClick={handleNewChat}>
              <FaPlus className="ai-tab-icon" />
              <span>New Chat</span>
            </button>

            <div className="ai-sidebar-divider" />

            <button className={`ai-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
              <FaRobot className="ai-tab-icon" />
              <span>AI Chat</span>
            </button>


            <button className="ai-tab" onClick={() => { setAutoScanMode(true); startCamera(); }}>
              <FaCamera className="ai-tab-icon" />
              <span>Product Scanner</span>
            </button>

            <button className={`ai-tab ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <FaHistory className="ai-tab-icon" />
              <span>History</span>
            </button>
          </div>

          {/* CONTENT */}
          <div className="ai-content">
            {/* MOBILE NAVBAR (Hidden on desktop) */}
            <div className="ai-mobile-navbar">
              <button className="ai-mob-nav-btn" onClick={handleNewChat}>
                <FaPlus className="ai-mob-icon" />
                <span>New</span>
              </button>
              <button className={`ai-mob-nav-btn ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
                <FaRobot className="ai-mob-icon" />
                <span>Chat</span>
              </button>
              <button className="ai-mob-nav-btn" onClick={() => { setAutoScanMode(true); startCamera(); }}>
                <FaCamera className="ai-mob-icon" />
                <span>Scan</span>
              </button>
              <button className={`ai-mob-nav-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
                <FaHistory className="ai-mob-icon" />
                <span>History</span>
              </button>
            </div>

            {activeTab === 'chat' ? (
              <div className="ai-chat-layout">
                <div className="ai-messages">
                  {messages.map((msg, index) => (
                    <div key={index} className={`ai-msg ${msg.role}`}>
                      <div className={`ai-${msg.role}-avatar`}>
                        {msg.role === 'model' ? (
                          <FaRobot />
                        ) : user && user.profilePicture ? (
                          <img src={user.profilePicture} alt="User Profile" />
                        ) : (
                          <FaUser />
                        )}
                      </div>
                      <div className="ai-msg-bubble">
                        {msg.image && (
                          <div className="ai-msg-image">
                            <img src={URL.createObjectURL(msg.image)} alt="upload" />
                          </div>
                        )}
                        <div style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                      </div>
                    </div>
                  ))}



                  {loading && (
                    <div className="ai-msg model">
                      <div className="ai-model-avatar"><FaRobot /></div>
                      <div className="ai-msg-bubble">
                        <div className="ai-typing"><span/><span/><span/></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <div className="ai-input-row">
                  <button className="ai-icon-btn" title="Upload Image" onClick={() => fileInputRef.current.click()}>
                    <FaImage />
                  </button>
                  <input type="file" hidden ref={fileInputRef} onChange={(e) => setImage(e.target.files[0])} accept="image/*" />
                  
                  {/* Native Camera Capture Input — Mobile Only */}
                  {isMobile && (
                    <>
                      <input type="file" accept="image/*" capture="environment" hidden ref={nativeCameraRef} onChange={handleNativeCameraCapture} />
                      <button className="ai-icon-btn ai-camera-btn" title="Scan Item with Camera" onClick={startCamera}>
                        <FaCamera />
                      </button>
                    </>
                  )}
                  {image && (
                    <div className="ai-selected-image">
                      <img src={URL.createObjectURL(image)} alt="preview" />
                      <button onClick={() => setImage(null)}>×</button>
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder="Koi bhi sawaal poochein..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button className="ai-send-btn" onClick={handleSend} disabled={loading}>
                    <FaPaperPlane />
                  </button>
                </div>
                <div className="ai-ceo-footer">
                  <FaCrown style={{ color: '#d4af37', fontSize: '10px' }} />
                  <span>Built by <strong>Abrar</strong> &mdash; CEO &amp; Founder, AjwaHub</span>
                </div>
              </div>
            ) : activeTab === 'compare' ? (
              <div className="ai-compare-layout">
                <div className="ai-compare-header">
                  <h2>Date Quality Scanner</h2>
                  <p>Upload two pictures of dates to compare their quality, appearance, and freshness using AI.</p>
                </div>
                
                <div className="ai-compare-cards">
                  <div className="ai-compare-card">
                    <h3>Date Image 1</h3>
                    <div className="ai-compare-upload" onClick={() => file1Ref.current.click()}>
                      {compareImage1 ? (
                        <img src={URL.createObjectURL(compareImage1)} alt="Date 1" />
                      ) : (
                        <div className="ai-compare-placeholder">
                          <FaUpload />
                          <span>Upload Image 1</span>
                        </div>
                      )}
                    </div>
                    <input type="file" hidden ref={file1Ref} onChange={(e) => setCompareImage1(e.target.files[0])} accept="image/*" />
                    {compareImage1 && (
                      <button className="ai-compare-remove-btn" onClick={() => setCompareImage1(null)}>✕ Remove</button>
                    )}
                  </div>

                  <div className="ai-compare-card">
                    <h3>Date Image 2</h3>
                    <div className="ai-compare-upload" onClick={() => file2Ref.current.click()}>
                      {compareImage2 ? (
                        <img src={URL.createObjectURL(compareImage2)} alt="Date 2" />
                      ) : (
                        <div className="ai-compare-placeholder">
                          <FaUpload />
                          <span>Upload Image 2</span>
                        </div>
                      )}
                    </div>
                    <input type="file" hidden ref={file2Ref} onChange={(e) => setCompareImage2(e.target.files[0])} accept="image/*" />
                    {compareImage2 && (
                      <button className="ai-compare-remove-btn" onClick={() => setCompareImage2(null)}>✕ Remove</button>
                    )}
                  </div>
                </div>

                <div className="ai-compare-action">
                  <button 
                    className="ai-compare-btn" 
                    disabled={!compareImage1 || !compareImage2 || comparing}
                    onClick={handleCompare}
                  >
                    {comparing ? 'Scanning with AI...' : 'Compare & Analyze Quality'}
                  </button>
                </div>

                {compareResult && (
                  <div className="ai-compare-result">
                    <div className="ai-compare-result-header">
                      <FaRobot /> AI Analysis Result
                    </div>
                    <div className="ai-compare-result-body" style={{ whiteSpace: 'pre-wrap' }}>
                      {compareResult}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="ai-history-layout">
                <div className="ai-history-header">
                  <h2>Your Conversations</h2>
                  {sessions.length > 0 && (
                    <button className="ai-clear-btn" onClick={clearHistory}>Clear All</button>
                  )}
                </div>
                <div className="ai-history-list">
                  {!user ? (
                    <div className="ai-empty-history">
                      <FaSearch style={{ fontSize: '36px', opacity: 0.2 }} />
                      <p>Please login to see your history</p>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="ai-empty-history">
                      <FaSearch style={{ fontSize: '36px', opacity: 0.2 }} />
                      <p>No saved chats yet. Start a chat and press "New Chat" to save it!</p>
                    </div>
                  ) : (
                    sessions.map((session) => (
                      <div key={session._id} className="ai-history-item">
                        <div className="ai-history-q">
                          <strong>💬 {session.title || 'Chat Session'}</strong>
                        </div>
                        <div className="ai-history-a">
                          {session.messages.length} messages · {new Date(session.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                        </div>
                        <div className="ai-session-actions">
                          <button className="ai-resume-btn" onClick={() => resumeSession(session)}>
                            Resume Chat
                          </button>
                          <button className="ai-delete-session-btn" onClick={() => deleteSession(session._id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
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

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/GymAI.css';
import Navbar from './Navbar';
import Footer from '../components/Footer';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatText = (text) => text
  .replace(/\*\*(.*?)\*\*/g, '$1')
  .replace(/\*(.*?)\*/g, '$1')
  .replace(/#{1,6}\s/g, '')
  .replace(/`(.*?)`/g, '$1')
  .trim();

const GOALS = [
  { value: 'weight-loss', label: 'Weight Loss' },
  { value: 'muscle-gain', label: 'Muscle Gain' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'energy-boost', label: 'Energy Boost' },
  { value: 'immunity', label: 'Immunity' },
];

const ACTIVITY = [
  { value: 'sedentary', label: 'Sedentary' },
  { value: 'light', label: 'Light (1-3 days/week)' },
  { value: 'moderate', label: 'Moderate (3-5 days/week)' },
  { value: 'active', label: 'Active (6-7 days/week)' },
  { value: 'very-active', label: 'Very Active' },
];

function GymAI() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('diet');
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  const [dietForm, setDietForm] = useState({ weight: '', height: '', age: '', goal: 'weight-loss', activity: 'moderate' });
  const [dietResult, setDietResult] = useState('');
  const [dietLoading, setDietLoading] = useState(false);
  const [dietError, setDietError] = useState('');

  const [ingredients, setIngredients] = useState('');
  const [recipeResult, setRecipeResult] = useState('');
  const [recipeLoading, setRecipeLoading] = useState(false);
  const [recipeError, setRecipeError] = useState('');

  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/api/gymai/history/${userId}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch (e) { console.error('Failed to fetch history', e); }
    setLoadingHistory(false);
  };

  const saveHistory = async (type, promptData, result) => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (!u) return;
    const userId = JSON.parse(u)._id || JSON.parse(u).id;
    try {
      const res = await fetch(`${API}/api/gymai/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, type, promptData, result })
      });
      const data = await res.json();
      if (res.ok) setHistory(prev => [data.history, ...prev]);
    } catch (e) { console.error('Failed to save history', e); }
  };

  const deleteHistory = async (id) => {
    try {
      const res = await fetch(`${API}/api/gymai/history/${id}`, { method: 'DELETE' });
      if (res.ok) setHistory(prev => prev.filter(h => h._id !== id));
    } catch (e) { console.error('Failed to delete history', e); }
  };

  const [videoSearch, setVideoSearch] = useState('');
  const [videoCategory, setVideoCategory] = useState('All Videos');

  const filteredVideos = videos.filter(v => {
    const s = videoSearch.toLowerCase();
    const matchSearch = v.title.toLowerCase().includes(s) || (v.description && v.description.toLowerCase().includes(s));
    const matchCat = videoCategory === 'All Videos' || v.category === videoCategory;
    return matchSearch && matchCat;
  });

  useEffect(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    let userId = null;
    if (u) {
      const parsed = JSON.parse(u);
      setUser(parsed);
      userId = parsed._id || parsed.id || parsed.email;
      fetchHistory(userId);
    } else navigate('/login');
    fetch(`${API}/api/gymai/videos`)
      .then(r => r.json()).then(d => setVideos(d.videos || [])).catch(() => {})
      .finally(() => setLoadingVideos(false));
  }, []);

  const callAI = async (message) => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    const parsed = u ? JSON.parse(u) : null;
    const userId = parsed?._id || parsed?.id || parsed?.email || '';
    const res = await fetch(`${API}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, userId, userName: parsed?.name || '' })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'AI error');
    return formatText(data.response || '');
  };

  const generateDiet = async () => {
    if (!dietForm.weight || !dietForm.height || !dietForm.age) { setDietError('Sab fields fill karein'); return; }
    setDietLoading(true); setDietError(''); setDietResult('');
    try {
      const result = await callAI(`Create a practical 7-day diet plan for: Weight ${dietForm.weight}kg, Height ${dietForm.height}cm, Age ${dietForm.age}, Goal: ${dietForm.goal}, Activity: ${dietForm.activity}. Include Ajwa dates and dry fruits. Give daily calorie target, breakfast/lunch/dinner/snacks.`);
      setDietResult(result);
      saveHistory('diet', `${dietForm.weight}kg | ${dietForm.goal} | ${dietForm.activity}`, result);
    } catch { setDietError('AI se connect nahi ho saka. Dobara try karein.'); }
    setDietLoading(false);
  };

  const generateRecipe = async () => {
    if (!ingredients.trim()) { setRecipeError('Ingredients daalen'); return; }
    setRecipeLoading(true); setRecipeError(''); setRecipeResult('');
    try {
      const result = await callAI(`Create a healthy recipe using: ${ingredients}. Must include Ajwa dates or dry fruits. Give recipe name, ingredients, steps, benefits.`);
      setRecipeResult(result);
      saveHistory('recipe', ingredients, result);
    } catch { setRecipeError('AI se connect nahi ho saka. Dobara try karein.'); }
    setRecipeLoading(false);
  };

  return (
    <div className="gymai-page">
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

      {/* Hero — Products-style gold glass frame */}
      <div className="gymai-hero-wrapper">
        <div className="gymai-hero">
          <div className="gymai-hero-inner">
            <span className="gymai-hero-badge">
              <span className="gymai-pulse-dot"></span> Health &amp; Nutrition AI
            </span>
            <h1>Your Personal <span>Health AI</span></h1>
            <div className="gymai-hero-divider">
              <span className="gymai-divider-line"></span>
              <span className="gymai-divider-dot"></span>
              <span className="gymai-divider-line"></span>
            </div>
            <p>AI-powered diet plans, healthy recipes &amp; expert videos — featuring premium Ajwa dates &amp; dry fruits</p>
            <div className="gymai-hero-btns">
              <button className="gymai-hero-btn primary" onClick={() => setActiveTab('diet')}>Diet Plan</button>
              <button className="gymai-hero-btn secondary" onClick={() => setActiveTab('videos')}>Health Videos</button>
            </div>
          </div>
          <div className="gymai-hero-spotlight"></div>
        </div>
      </div>

      <div className="gymai-container">
        <div className="gymai-tabs">
          {[['diet', 'Diet Plan'], ['recipes', 'Recipes'], ['videos', 'Videos'], ['history', 'History']].map(([val, label]) => (
            <button key={val} className={`gymai-tab ${activeTab === val ? 'active' : ''}`} onClick={() => setActiveTab(val)}>
              {label}
            </button>
          ))}
        </div>

        {/* DIET TAB */}
        {activeTab === 'diet' && (
          <div className="gymai-tab-content">
            <div className="diet-form-card">
              <div className="diet-form-header">
                <h3>Your Body Stats</h3>
                <p>Fill in your details to get a personalized 7-day diet plan</p>
              </div>
              <div className="diet-form-grid">
                {[['weight','Weight (kg)','70'],['height','Height (cm)','175'],['age','Age','25']].map(([key,label,ph]) => (
                  <div key={key} className="diet-field">
                    <label>{label}</label>
                    <input type="number" placeholder={ph} value={dietForm[key]}
                      onChange={e => setDietForm(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="diet-field">
                <label>Your Goal</label>
                <div className="diet-options">
                  {GOALS.map(g => (
                    <button key={g.value} className={`diet-option-btn ${dietForm.goal === g.value ? 'active' : ''}`}
                      onClick={() => setDietForm(p => ({ ...p, goal: g.value }))}>
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="diet-field">
                <label>Activity Level</label>
                <select value={dietForm.activity} onChange={e => setDietForm(p => ({ ...p, activity: e.target.value }))}>
                  {ACTIVITY.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              {dietError && <div className="diet-error">{dietError}</div>}
              <button className="diet-generate-btn" onClick={generateDiet} disabled={dietLoading}>
                {dietLoading ? <><span className="gymai-spinner" /> Generating Plan...</> : 'Generate My Diet Plan'}
              </button>
            </div>
          </div>
        )}

        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <div className="gymai-tab-content">
            <div className="diet-form-card">
              <div className="diet-form-header">
                <h3>AI Recipe Generator</h3>
                <p>Enter your ingredients — AI will create a healthy recipe with Ajwa dates &amp; dry fruits!</p>
              </div>
              <div className="diet-field">
                <label>Your Ingredients</label>
                <textarea rows={3} placeholder="e.g. chicken, milk, honey, oats, banana..."
                  value={ingredients} onChange={e => setIngredients(e.target.value)}
                  className="gymai-textarea" />
              </div>
              {recipeError && <div className="diet-error">{recipeError}</div>}
              <button className="diet-generate-btn" onClick={generateRecipe} disabled={recipeLoading}>
                {recipeLoading ? <><span className="gymai-spinner" /> Generating Recipe...</> : 'Generate Recipe'}
              </button>
            </div>
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="gymai-tab-content">
            <div className="gymai-video-filters">
              <div className="video-search-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" placeholder="Search health & diet videos..." value={videoSearch} onChange={e => setVideoSearch(e.target.value)} />
              </div>
              <select className="video-cat-select" value={videoCategory} onChange={e => setVideoCategory(e.target.value)}>
                <option value="All Videos">All Videos</option>
                <option value="Ajwa Dates">Ajwa Dates</option>
                <option value="Dry Fruits">Dry Fruits</option>
                <option value="Diet & Nutrition">Diet & Nutrition</option>
                <option value="Workout">Workout</option>
              </select>
            </div>

            {loadingVideos ? (
              <div className="gymai-loading"><span className="gymai-spinner" style={{width:32,height:32,borderWidth:3}} /></div>
            ) : filteredVideos.length === 0 ? (
              <div className="gymai-empty">
                <div className="gymai-empty-icon">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{color:'#4b5563'}}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                </div>
                <h3>No Videos Found</h3>
                <p>Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="gymai-videos-grid">
                {filteredVideos.map(video => (
                  <div key={video._id} className="gymai-video-card">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} onError={e => e.target.style.display='none'} />}
                    <div className="gymai-video-info">
                      <span className="gymai-video-cat">{video.category}</span>
                      <h4>{video.title}</h4>
                      <p>{video.description}</p>
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="gymai-watch-btn">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        Watch Video
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div className="gymai-tab-content">
            <div className="gymai-history-master-box">

              {/* Header inside the box */}
              <div className="gymai-history-master-header">
                <div className="gymai-history-master-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div>
                  <h2>Your AI History</h2>
                  <p>Click any entry to view full result · Delete to remove permanently</p>
                </div>
              </div>

              <div className="gymai-history-master-divider" />

              {/* DIET PLANS */}
              <div className="gymai-history-section">
                <h4 className="gymai-history-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  Diet Plans
                </h4>
                {loadingHistory ? (
                  <div className="gymai-loading"><span className="gymai-spinner" style={{width:28,height:28,borderWidth:2}} /></div>
                ) : history.filter(h => h.type === 'diet').length === 0 ? (
                  <div className="gymai-history-empty-box">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    <p>No diet plans generated yet.</p>
                    <button onClick={() => setActiveTab('diet')}>Generate Diet Plan →</button>
                  </div>
                ) : (
                  <div className="gymai-history-list">
                    {history.filter(h => h.type === 'diet').map(h => (
                      <div key={h._id} className="gymai-history-card">
                        <div className="history-info" onClick={() => setDietResult(h.result)}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                          <div>
                            <strong>{h.promptData}</strong>
                            <span>{new Date(h.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <button className="history-delete-btn" onClick={() => deleteHistory(h._id)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="gymai-history-master-divider" />

              {/* RECIPES */}
              <div className="gymai-history-section">
                <h4 className="gymai-history-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                  Recipes
                </h4>
                {loadingHistory ? (
                  <div className="gymai-loading"><span className="gymai-spinner" style={{width:28,height:28,borderWidth:2}} /></div>
                ) : history.filter(h => h.type === 'recipe').length === 0 ? (
                  <div className="gymai-history-empty-box">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></svg>
                    <p>No recipes generated yet.</p>
                    <button onClick={() => setActiveTab('recipes')}>Generate Recipe →</button>
                  </div>
                ) : (
                  <div className="gymai-history-list">
                    {history.filter(h => h.type === 'recipe').map(h => (
                      <div key={h._id} className="gymai-history-card">
                        <div className="history-info" onClick={() => setRecipeResult(h.result)}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                          <div>
                            <strong>{h.promptData}</strong>
                            <span>{new Date(h.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                          </div>
                        </div>
                        <button className="history-delete-btn" onClick={() => deleteHistory(h._id)}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </div>

      {/* AI RESULT MODAL OVERLAY */}
      {(dietResult || recipeResult) && (
        <div className="gymai-modal-overlay" onClick={() => { setDietResult(''); setRecipeResult(''); }}>
          <div className="gymai-modal-content diet-result" onClick={e => e.stopPropagation()}>
            <button className="gymai-modal-close" onClick={() => { setDietResult(''); setRecipeResult(''); }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <div className="diet-result-header">
              <h3>{dietResult ? "Your 7-Day Diet Plan" : "Your AI Recipe"}</h3>
              <span>Powered by Gemini AI</span>
            </div>
            <div className="diet-result-content">
              {(dietResult || recipeResult).split('\n').map((line, i) => (
                <p key={i} className={line.match(/^\d\./) || line.match(/^Day/) ? 'diet-heading' : ''}>{line}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default GymAI;

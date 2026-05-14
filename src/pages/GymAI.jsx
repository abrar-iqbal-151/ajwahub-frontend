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
  { value: 'weight-loss', label: 'Weight Loss', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg> },
  { value: 'muscle-gain', label: 'Muscle Gain', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6.5 6.5h11M6.5 17.5h11M4 12h16"/><circle cx="4" cy="12" r="2"/><circle cx="20" cy="12" r="2"/></svg> },
  { value: 'maintain', label: 'Maintain', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> },
  { value: 'energy-boost', label: 'Energy Boost', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
  { value: 'immunity', label: 'Immunity', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
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

  useEffect(() => {
    const u = localStorage.getItem('ajwaHub_currentUser');
    if (u) setUser(JSON.parse(u));
    else navigate('/login');
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
    } catch { setDietError('AI se connect nahi ho saka. Dobara try karein.'); }
    setDietLoading(false);
  };

  const generateRecipe = async () => {
    if (!ingredients.trim()) { setRecipeError('Ingredients daalen'); return; }
    setRecipeLoading(true); setRecipeError(''); setRecipeResult('');
    try {
      const result = await callAI(`Create a healthy recipe using: ${ingredients}. Must include Ajwa dates or dry fruits. Give recipe name, ingredients, steps, benefits.`);
      setRecipeResult(result);
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

      <div className="gymai-hero">
        <div className="gymai-hero-inner">
          <h1>Your Personal <span>Health AI</span></h1>
          <p>AI-powered diet plans, healthy recipes & expert videos — featuring premium Ajwa dates & dry fruits</p>
          <div className="gymai-hero-btns">
            <button className="gymai-hero-btn primary" onClick={() => setActiveTab('diet')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
              Diet Plan
            </button>
            <button className="gymai-hero-btn secondary" onClick={() => setActiveTab('videos')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
              Health Videos
            </button>
          </div>
        </div>
        <div className="gymai-hero-visual">
          {/* Ajwa Date fruit */}
          <div className="gymai-orb orb1">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="20" rx="7" ry="9" fill="rgba(180,83,9,0.85)" stroke="rgba(251,146,60,0.6)" strokeWidth="1.2"/>
              <ellipse cx="16" cy="19" rx="4" ry="6" fill="rgba(217,119,6,0.5)"/>
              <path d="M16 11 C14 7 10 5 10 5 C13 6 15 9 16 11 C17 9 19 6 22 5 C22 5 18 7 16 11Z" fill="rgba(34,197,94,0.9)" stroke="rgba(74,222,128,0.5)" strokeWidth="0.8"/>
              <line x1="16" y1="11" x2="16" y2="13" stroke="rgba(74,222,128,0.7)" strokeWidth="1"/>
            </svg>
          </div>
          {/* Almond / dry fruit */}
          <div className="gymai-orb orb2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <ellipse cx="16" cy="17" rx="6" ry="9" fill="rgba(180,120,60,0.8)" stroke="rgba(217,160,100,0.6)" strokeWidth="1.2"/>
              <ellipse cx="16" cy="16" rx="3.5" ry="6" fill="rgba(210,150,80,0.4)"/>
              <path d="M13 10 Q16 6 19 10" stroke="rgba(240,180,100,0.7)" strokeWidth="1" fill="none"/>
              <line x1="16" y1="8" x2="16" y2="26" stroke="rgba(240,180,100,0.3)" strokeWidth="0.8"/>
            </svg>
          </div>
          {/* Palm leaf */}
          <div className="gymai-orb orb3">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <path d="M16 28 L16 10" stroke="rgba(74,222,128,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M16 14 C12 10 6 10 5 7 C8 8 13 11 16 14Z" fill="rgba(34,197,94,0.75)" stroke="rgba(74,222,128,0.4)" strokeWidth="0.8"/>
              <path d="M16 14 C20 10 26 10 27 7 C24 8 19 11 16 14Z" fill="rgba(34,197,94,0.75)" stroke="rgba(74,222,128,0.4)" strokeWidth="0.8"/>
              <path d="M16 18 C13 15 8 16 7 13 C10 15 14 17 16 18Z" fill="rgba(74,222,128,0.6)" stroke="rgba(74,222,128,0.3)" strokeWidth="0.8"/>
              <path d="M16 18 C19 15 24 16 25 13 C22 15 18 17 16 18Z" fill="rgba(74,222,128,0.6)" stroke="rgba(74,222,128,0.3)" strokeWidth="0.8"/>
            </svg>
          </div>
          {/* Walnut */}
          <div className="gymai-orb orb4">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="9" fill="rgba(120,80,40,0.8)" stroke="rgba(180,120,60,0.6)" strokeWidth="1.2"/>
              <path d="M10 13 Q16 9 22 13" stroke="rgba(200,150,80,0.6)" strokeWidth="1" fill="none"/>
              <path d="M9 17 Q16 22 23 17" stroke="rgba(200,150,80,0.6)" strokeWidth="1" fill="none"/>
              <line x1="16" y1="7" x2="16" y2="25" stroke="rgba(200,150,80,0.4)" strokeWidth="0.8"/>
              <line x1="7" y1="16" x2="25" y2="16" stroke="rgba(200,150,80,0.3)" strokeWidth="0.8"/>
            </svg>
          </div>
          {/* Center — dates cluster */}
          <div className="gymai-center-orb">
            <svg width="44" height="44" viewBox="0 0 48 48" fill="none">
              <ellipse cx="24" cy="30" rx="6" ry="8" fill="rgba(180,83,9,0.9)" stroke="rgba(251,146,60,0.7)" strokeWidth="1.2"/>
              <ellipse cx="15" cy="32" rx="5" ry="7" fill="rgba(161,72,8,0.85)" stroke="rgba(251,146,60,0.5)" strokeWidth="1"/>
              <ellipse cx="33" cy="32" rx="5" ry="7" fill="rgba(161,72,8,0.85)" stroke="rgba(251,146,60,0.5)" strokeWidth="1"/>
              <path d="M24 22 C21 16 16 13 16 13 C19 15 22 18 24 22 C26 18 29 15 32 13 C32 13 27 16 24 22Z" fill="rgba(34,197,94,0.9)" stroke="rgba(74,222,128,0.5)" strokeWidth="1"/>
              <path d="M15 25 C13 20 10 18 10 18 C12 20 14 22 15 25Z" fill="rgba(34,197,94,0.7)"/>
              <path d="M33 25 C35 20 38 18 38 18 C36 20 34 22 33 25Z" fill="rgba(34,197,94,0.7)"/>
            </svg>
          </div>
        </div>
      </div>

      <div className="gymai-container">
        <div className="gymai-tabs">
          {[
            ['diet', <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>, 'Diet Plan'],
            ['recipes', <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2v6a6 6 0 0 0 12 0V2"/><line x1="12" y1="14" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>, 'Recipes'],
            ['videos', <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>, 'Videos'],
          ].map(([val, icon, label]) => (
            <button key={val} className={`gymai-tab ${activeTab === val ? 'active' : ''}`} onClick={() => setActiveTab(val)}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* DIET TAB */}
        {activeTab === 'diet' && (
          <div className="gymai-tab-content">
            <div className="diet-form-card">
              <div className="diet-form-header">
                <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:8}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Your Body Stats</h3>
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
                      {g.icon} {g.label}
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
              {dietError && <div className="diet-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:6}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {dietError}
              </div>}
              <button className="diet-generate-btn" onClick={generateDiet} disabled={dietLoading}>
                {dietLoading ? <><span className="gymai-spinner" /> Generating Plan...</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg> Generate My Diet Plan</>}
              </button>
            </div>
            {dietResult && (
              <div className="diet-result">
                <div className="diet-result-header">
                  <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign:'middle',marginRight:8,color:'#4ade80'}}><polyline points="20 6 9 17 4 12"/></svg>Your 7-Day Diet Plan</h3>
                  <span>Powered by Gemini AI</span>
                </div>
                <div className="diet-result-content">
                  {dietResult.split('\n').map((line, i) => (
                    <p key={i} className={line.match(/^\d\./) || line.match(/^Day/) ? 'diet-heading' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* RECIPES TAB */}
        {activeTab === 'recipes' && (
          <div className="gymai-tab-content">
            <div className="diet-form-card">
              <div className="diet-form-header">
                <h3><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:8}}><path d="M6 2v6a6 6 0 0 0 12 0V2"/><line x1="12" y1="14" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>AI Recipe Generator</h3>
                <p>Enter your ingredients — AI will create a healthy recipe with Ajwa dates & dry fruits!</p>
              </div>
              <div className="diet-field">
                <label>Your Ingredients</label>
                <textarea rows={3} placeholder="e.g. chicken, milk, honey, oats, banana..."
                  value={ingredients} onChange={e => setIngredients(e.target.value)}
                  className="gymai-textarea" />
              </div>
              {recipeError && <div className="diet-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{verticalAlign:'middle',marginRight:6}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {recipeError}
              </div>}
              <button className="diet-generate-btn" onClick={generateRecipe} disabled={recipeLoading}>
                {recipeLoading ? <><span className="gymai-spinner" /> Generating Recipe...</> : <><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1" fill="currentColor"/></svg> Generate Recipe</>}
              </button>
            </div>
            {recipeResult && (
              <div className="diet-result">
                <div className="diet-result-header">
                  <h3><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{verticalAlign:'middle',marginRight:8,color:'#4ade80'}}><polyline points="20 6 9 17 4 12"/></svg>Your AI Recipe</h3>
                  <span>Powered by Gemini AI</span>
                </div>
                <div className="diet-result-content">
                  {recipeResult.split('\n').map((line, i) => (
                    <p key={i} className={line.match(/^\d\./) ? 'diet-heading' : ''}>{line}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="gymai-tab-content">
            {loadingVideos ? (
              <div className="gymai-loading"><span className="gymai-spinner" style={{width:32,height:32,borderWidth:3}} /></div>
            ) : videos.length === 0 ? (
              <div className="gymai-empty">
                <div className="gymai-empty-icon">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{color:'#4b5563'}}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
              </div>
                <h3>No Videos Yet</h3>
                <p>Admin will add health videos soon</p>
              </div>
            ) : (
              <div className="gymai-videos-grid">
                {videos.map(video => (
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
      </div>

      <Footer />
    </div>
  );
}

export default GymAI;



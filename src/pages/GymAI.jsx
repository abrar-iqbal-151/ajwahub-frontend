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
          {[['diet', 'Diet Plan'], ['recipes', 'Recipes'], ['videos', 'Videos']].map(([val, label]) => (
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
            {dietResult && (
              <div className="diet-result">
                <div className="diet-result-header">
                  <h3>Your 7-Day Diet Plan</h3>
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
            {recipeResult && (
              <div className="diet-result">
                <div className="diet-result-header">
                  <h3>Your AI Recipe</h3>
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

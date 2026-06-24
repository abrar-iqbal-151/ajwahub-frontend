import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  { value: 'weight-loss',  label: 'Weight Loss',   emoji: '🔥' },
  { value: 'muscle-gain',  label: 'Muscle Gain',   emoji: '💪' },
  { value: 'maintain',     label: 'Maintain',      emoji: '⚖️' },
  { value: 'energy-boost', label: 'Energy Boost',  emoji: '⚡' },
  { value: 'immunity',     label: 'Immunity',      emoji: '🛡️' },
];

const ACTIVITY = [
  { value: 'sedentary',   label: 'Sedentary',              sub: 'Desk job, no exercise' },
  { value: 'light',       label: 'Light',                  sub: '1-3 days/week' },
  { value: 'moderate',    label: 'Moderate',               sub: '3-5 days/week' },
  { value: 'active',      label: 'Active',                 sub: '6-7 days/week' },
  { value: 'very-active', label: 'Very Active',            sub: 'Athlete level' },
];

function getBMI(weight, height) {
  const h = height / 100;
  if (!weight || !h) return null;
  return (weight / (h * h)).toFixed(1);
}

function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: 'Underweight', color: '#60a5fa' };
  if (bmi < 25)   return { label: 'Normal',      color: '#34d399' };
  if (bmi < 30)   return { label: 'Overweight',  color: '#fbbf24' };
  return            { label: 'Obese',           color: '#f87171' };
}

// Custom Meal Timer Component
function MealTimerCard({ defaultLabel, defaultTimeStr }) {
  const [timeStr, setTimeStr] = useState(defaultTimeStr);
  const [durationStr, setDurationStr] = useState("1");
  const [isEditing, setIsEditing] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  const [isRinging, setIsRinging] = useState(false);
  const audioRef = useRef(null);
  const ringTimeoutRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/989/989-preview.mp3');
      audioRef.current.loop = true;
    }
    const tick = () => {
      const now = new Date();
      const [hh, mm] = timeStr.split(':').map(Number);
      const end = new Date(now);
      end.setHours(hh, mm, 0, 0);
      if (end <= now) end.setDate(end.getDate() + 1);
      
      const diff = Math.floor((end - now) / 1000);
      
      // Ring the alarm exactly at 0!
      if (diff === 0 && !isRinging) {
        setIsRinging(true);
        audioRef.current.play().catch(() => console.log('Audio autoplay blocked'));
        if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
        ringTimeoutRef.current = setTimeout(() => {
          stopRing();
        }, Number(durationStr) * 60 * 1000);
      }
      
      setTimeLeft({ h: Math.floor(diff / 3600), m: Math.floor((diff % 3600) / 60), s: diff % 60 });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [timeStr, durationStr, isRinging]);

  const stopRing = () => {
    setIsRinging(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const pad = (n) => String(n).padStart(2, '0');
  const format12h = (t24) => {
    let [h, m] = t24.split(':');
    h = parseInt(h);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${ampm}`;
  };

  return (
    <div className={`gymai-timer-card ${isRinging ? 'gymai-ringing' : ''}`}>
      <div className="gymai-timer-label">
        {defaultLabel}
      </div>
      
      {isEditing ? (
        <div className="gymai-timer-edit-panel">
          <input type="time" value={timeStr} onChange={e => setTimeStr(e.target.value)} />
          <div className="gymai-timer-duration-box">
            <label>Alarm Duration:</label>
            <select value={durationStr} onChange={e => setDurationStr(e.target.value)}>
              <option value="1">1 Minute</option>
              <option value="2">2 Minutes</option>
              <option value="3">3 Minutes</option>
              <option value="5">5 Minutes</option>
            </select>
          </div>
          <button className="gymai-timer-save-btn" onClick={() => setIsEditing(false)}>Save</button>
        </div>
      ) : (
        <>
          <div className="gymai-timer-time-target">{format12h(timeStr)} <span style={{opacity: 0.5}}>({durationStr}m alarm)</span></div>
          {isRinging ? (
            <div className="gymai-timer-ringing-ui">
              <span className="ringing-bell">🔔</span>
              <button onClick={stopRing}>Stop Alarm</button>
            </div>
          ) : (
            <div className="gymai-timer-clickable-area" onClick={() => setIsEditing(true)}>
              <div className="gymai-timer-countdown">
                <span>{pad(timeLeft.h)}<small>h</small></span>
                <span className="gymai-timer-sep">:</span>
                <span>{pad(timeLeft.m)}<small>m</small></span>
                <span className="gymai-timer-sep">:</span>
                <span>{pad(timeLeft.s)}<small>s</small></span>
              </div>
              <div className="gymai-timer-sub">until meal time</div>
              
              <div className="gymai-timer-hover-edit">
                <span>✏️ Click to set timer</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function GymAI() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('diet');
  const [videos, setVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  // Multi-step diet form
  const [step, setStep] = useState(1); // 1=body, 2=goal, 3=activity
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
  const [videoSearch, setVideoSearch] = useState('');
  const [videoCategory, setVideoCategory] = useState('All Videos');
  const [languagePrompt, setLanguagePrompt] = useState({ show: false, actionType: null });


  const bmi = getBMI(Number(dietForm.weight), Number(dietForm.height));
  const bmiCat = bmi ? getBMICategory(Number(bmi)) : null;
  const bmiPercent = bmi ? Math.min(100, Math.max(0, ((Number(bmi) - 10) / 30) * 100)) : 0;

  const filteredVideos = videos.filter(v => {
    const s = videoSearch.toLowerCase();
    const matchSearch = v.title.toLowerCase().includes(s) || (v.description && v.description.toLowerCase().includes(s));
    const matchCat = videoCategory === 'All Videos' || v.category === videoCategory;
    return matchSearch && matchCat;
  });

  const fetchHistory = async (userId) => {
    setLoadingHistory(true);
    try {
      const res = await fetch(`${API}/api/gymai/history/${userId}`);
      const data = await res.json();
      setHistory(data.history || []);
    } catch {}
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
    } catch {}
  };

  const deleteHistory = async (id) => {
    try {
      const res = await fetch(`${API}/api/gymai/history/${id}`, { method: 'DELETE' });
      if (res.ok) setHistory(prev => prev.filter(h => h._id !== id));
    } catch {}
  };

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

  const callGymAI = async (prompt, selectedLang) => {
    const res = await fetch(`${API}/api/ai/gymai/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language: selectedLang })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'AI error');
    return formatText(data.response || '');
  };
  const triggerGenerateDiet = () => {
    if (!dietForm.weight || !dietForm.height || !dietForm.age) { setDietError('Sab fields fill karein'); return; }
    setDietError('');
    setLanguagePrompt({ show: true, actionType: 'diet' });
  };

  const triggerGenerateRecipe = () => {
    if (!ingredients.trim()) { setRecipeError('Ingredients daalen'); return; }
    setRecipeError('');
    setLanguagePrompt({ show: true, actionType: 'recipe' });
  };

  const executeGeneration = async (selectedLang) => {
    const action = languagePrompt.actionType;
    setLanguagePrompt({ show: false, actionType: null });
    
    if (action === 'diet') {
      setDietLoading(true); setDietResult('');
      try {
        const result = await callGymAI(`Create a highly tailored, practical diet plan explicitly focused on the goal: ${dietForm.goal}. Perfect match this to the user's activity level (${dietForm.activity}) and stats: Weight ${dietForm.weight}kg, Height ${dietForm.height}cm, Age ${dietForm.age}. Include Ajwa dates and dry fruits. Give daily calorie target, breakfast/lunch/dinner/snacks.`, selectedLang);
        setDietResult(result);
        saveHistory('diet', `${dietForm.weight}kg | ${dietForm.goal} | ${dietForm.activity}`, result);
      } catch { setDietError('AI se connect nahi ho saka. Dobara try karein.'); }
      setDietLoading(false);
    } else if (action === 'recipe') {
      setRecipeLoading(true); setRecipeResult('');
      try {
        const result = await callGymAI(`Create a healthy recipe using: ${ingredients}. Must include Ajwa dates or dry fruits. Give recipe name, ingredients, steps, benefits.`, selectedLang);
        setRecipeResult(result);
        saveHistory('recipe', ingredients, result);
      } catch { setRecipeError('AI se connect nahi ho saka. Dobara try karein.'); }
      setRecipeLoading(false);
    }
  };

  const pad = (n) => String(n).padStart(2, '0');

  return (
    <div className="gymai-page">
      <div className="desc-bg-3d">
        <div className="desc-bg-grid" />
        <div className="desc-orb desc-orb1" /><div className="desc-orb desc-orb2" />
        <div className="desc-orb desc-orb3" /><div className="desc-orb desc-orb4" />
        <div className="desc-bg-lines">
          {[...Array(6)].map((_,i) => <div key={i} className="desc-bg-line" style={{animationDelay:`${i*0.4}s`}} />)}
        </div>
      </div>
      <Navbar />

      <div className="gymai-hero-wrapper">
        <div className="gymai-hero">
          <div className="gymai-hero-inner">
            <span className="gymai-hero-badge"><span className="gymai-pulse-dot"></span> Health &amp; Nutrition AI</span>
            <h1>Your Personal <span>Health AI</span></h1>
            <div className="gymai-hero-divider">
              <span className="gymai-divider-line"></span><span className="gymai-divider-dot"></span><span className="gymai-divider-line"></span>
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

      {/* MEAL TIMER STRIP */}
      <div className="gymai-meal-timers">
        <MealTimerCard defaultLabel="🌅 Breakfast" defaultTimeStr="08:00" />
        <MealTimerCard defaultLabel="☀️ Lunch" defaultTimeStr="13:00" />
        <MealTimerCard defaultLabel="🌙 Dinner" defaultTimeStr="20:00" />
      </div>

      <div className="gymai-container">
        <div className="gymai-tabs">
          {[['diet','🥗 Diet Plan'],['recipes','👨‍🍳 Recipes'],['videos','🎬 Videos'],['history','📋 History']].map(([val, label]) => (
            <button key={val} className={`gymai-tab ${activeTab === val ? 'active' : ''}`} onClick={() => setActiveTab(val)}>{label}</button>
          ))}
        </div>

        {/* ─── DIET TAB ─── */}
        {activeTab === 'diet' && (
          <div className="gymai-tab-content">
            <div className="diet-wizard-wrapper">

              {/* Progress Steps */}
              <div className="diet-wizard-steps">
                {['Body Stats', 'Your Goal', 'Activity'].map((s, i) => (
                  <div key={s} className={`diet-wizard-step ${step > i+1 ? 'done' : step === i+1 ? 'active' : ''}`} onClick={() => step > i+1 && setStep(i+1)}>
                    <div className="diet-wizard-step-circle">{step > i+1 ? '✓' : i+1}</div>
                    <span>{s}</span>
                  </div>
                ))}
              </div>

              {/* STEP 1 — Body Stats */}
              {step === 1 && (
                <div className="diet-step-card">
                  <h3>📊 Your Body Stats</h3>
                  <p>Enter your measurements to calculate your BMI and personalize your plan</p>

                  <div className="diet-form-grid">
                    {[
                      { key:'weight', label:'Weight', unit:'kg', ph:'70', icon:'⚖️' },
                      { key:'height', label:'Height', unit:'cm', ph:'175', icon:'📏' },
                      { key:'age',    label:'Age',    unit:'yrs', ph:'25', icon:'🎂' },
                    ].map(({ key, label, unit, ph, icon }) => (
                      <div key={key} className="diet-input-box">
                        <div className="diet-input-icon">{icon}</div>
                        <label>{label}</label>
                        <div className="diet-input-with-unit">
                          <input type="number" placeholder={ph} value={dietForm[key]}
                            onChange={e => setDietForm(p => ({ ...p, [key]: e.target.value }))} />
                          <span className="diet-unit">{unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live BMI Gauge */}
                  {bmi && (
                    <div className="diet-bmi-card">
                      <div className="diet-bmi-header">
                        <span>Your BMI</span>
                        <span className="diet-bmi-value" style={{ color: bmiCat.color }}>{bmi}</span>
                        <span className="diet-bmi-cat" style={{ color: bmiCat.color }}>{bmiCat.label}</span>
                      </div>
                      <div className="diet-bmi-bar-wrap">
                        <div className="diet-bmi-bar">
                          <div className="diet-bmi-fill" style={{ width: `${bmiPercent}%`, background: bmiCat.color }} />
                          <div className="diet-bmi-pointer" style={{ left: `${bmiPercent}%` }} />
                        </div>
                        <div className="diet-bmi-labels">
                          <span style={{color:'#60a5fa'}}>Under</span>
                          <span style={{color:'#34d399'}}>Normal</span>
                          <span style={{color:'#fbbf24'}}>Over</span>
                          <span style={{color:'#f87171'}}>Obese</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <button className="diet-next-btn" onClick={() => {
                    if (!dietForm.weight || !dietForm.height || !dietForm.age) { setDietError('Sab fields fill karein'); return; }
                    setDietError(''); setStep(2);
                  }}>
                    Next: Choose Your Goal →
                  </button>
                  {dietError && <div className="diet-error">{dietError}</div>}
                </div>
              )}

              {/* STEP 2 — Goal */}
              {step === 2 && (
                <div className="diet-step-card">
                  <h3>🎯 What's Your Goal?</h3>
                  <p>Select your primary health objective</p>
                  <div className="diet-goal-grid">
                    {GOALS.map(g => (
                      <button key={g.value}
                        className={`diet-goal-card ${dietForm.goal === g.value ? 'active' : ''}`}
                        onClick={() => setDietForm(p => ({ ...p, goal: g.value }))}>
                        <span className="diet-goal-emoji">{g.emoji}</span>
                        <span>{g.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="diet-step-nav">
                    <button className="diet-back-btn" onClick={() => setStep(1)}>← Back</button>
                    <button className="diet-next-btn" onClick={() => setStep(3)}>Next: Activity Level →</button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Activity */}
              {step === 3 && (
                <div className="diet-step-card">
                  <h3>🏃 Activity Level</h3>
                  <p>How active are you on a weekly basis?</p>
                  <div className="diet-activity-list">
                    {ACTIVITY.map((a, i) => (
                      <div key={a.value}
                        className={`diet-activity-row ${dietForm.activity === a.value ? 'active' : ''}`}
                        onClick={() => setDietForm(p => ({ ...p, activity: a.value }))}>
                        <div className="diet-activity-bar-fill" style={{ width: `${(i+1)*20}%` }} />
                        <div className="diet-activity-info">
                          <strong>{a.label}</strong>
                          <span>{a.sub}</span>
                        </div>
                        <div className={`diet-activity-check ${dietForm.activity === a.value ? 'on' : ''}`}>✓</div>
                      </div>
                    ))}
                  </div>
                  <div className="diet-step-nav">
                    <button className="diet-back-btn" onClick={() => setStep(2)}>← Back</button>
                    <button className="diet-generate-btn" onClick={triggerGenerateDiet} disabled={dietLoading}>
                      {dietLoading ? <><span className="gymai-spinner" /> Generating Plan...</> : '🚀 Generate My Plan'}
                    </button>
                  </div>
                  {dietError && <div className="diet-error">{dietError}</div>}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ─── RECIPES TAB ─── */}
        {activeTab === 'recipes' && (
          <div className="gymai-tab-content">
            <div className="diet-form-card">
              <div className="diet-form-header">
                <h3>👨‍🍳 AI Recipe Generator</h3>
                <p>Enter your ingredients — AI will create a healthy recipe with Ajwa dates &amp; dry fruits!</p>
              </div>
              <div className="diet-field">
                <label>Your Ingredients</label>
                <textarea rows={3} placeholder="e.g. chicken, milk, honey, oats, banana..."
                  value={ingredients} onChange={e => setIngredients(e.target.value)}
                  className="gymai-textarea" />
              </div>
              {recipeError && <div className="diet-error">{recipeError}</div>}
              <button className="diet-generate-btn" onClick={triggerGenerateRecipe} disabled={recipeLoading}>
                {recipeLoading ? <><span className="gymai-spinner" /> Generating Recipe...</> : 'Generate Recipe'}
              </button>
            </div>
          </div>
        )}

        {/* ─── VIDEOS TAB ─── */}
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
                <div className="gymai-empty-icon">🎬</div>
                <h3>No Videos Found</h3><p>Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="gymai-videos-grid">
                {filteredVideos.map(video => (
                  <div key={video._id} className="gymai-video-card">
                    {video.thumbnail && <img src={video.thumbnail} alt={video.title} onError={e => e.target.style.display='none'} />}
                    <div className="gymai-video-info">
                      <span className="gymai-video-cat">{video.category}</span>
                      <h4>{video.title}</h4><p>{video.description}</p>
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

        {/* ─── HISTORY TAB ─── */}
        {activeTab === 'history' && (
          <div className="gymai-tab-content">
            <div className="gymai-history-master-box">
              <div className="gymai-history-master-header">
                <div className="gymai-history-master-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div><h2>Your AI History</h2><p>Click any entry to view full result · Delete to remove permanently</p></div>
              </div>
              <div className="gymai-history-master-divider" />
              {['diet','recipe'].map(type => (
                <div key={type} className="gymai-history-section">
                  <h4 className="gymai-history-title">{type === 'diet' ? '🥗 Diet Plans' : '👨‍🍳 Recipes'}</h4>
                  {loadingHistory ? (
                    <div className="gymai-loading"><span className="gymai-spinner" style={{width:28,height:28,borderWidth:2}} /></div>
                  ) : history.filter(h => h.type === type).length === 0 ? (
                    <div className="gymai-history-empty-box">
                      <p>No {type === 'diet' ? 'diet plans' : 'recipes'} generated yet.</p>
                      <button onClick={() => setActiveTab(type === 'diet' ? 'diet' : 'recipes')}>Generate {type === 'diet' ? 'Diet Plan' : 'Recipe'} →</button>
                    </div>
                  ) : (
                    <div className="gymai-history-list">
                      {history.filter(h => h.type === type).map(h => (
                        <div key={h._id} className="gymai-history-card">
                          <div className="history-info" onClick={() => type === 'diet' ? setDietResult(h.result) : setRecipeResult(h.result)}>
                            <div><strong>{h.promptData}</strong><span>{new Date(h.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })}</span></div>
                          </div>
                          <button className="history-delete-btn" onClick={() => deleteHistory(h._id)}>🗑</button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="gymai-history-master-divider" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RESULT MODAL */}
      {(dietResult || recipeResult) && (
        <div className="gymai-modal-overlay" onClick={() => { setDietResult(''); setRecipeResult(''); }}>
          <div className="gymai-modal-content diet-result" onClick={e => e.stopPropagation()}>
            <button className="gymai-modal-close" onClick={() => { setDietResult(''); setRecipeResult(''); }}>×</button>
            <div className="diet-result-header">
              <h3>{dietResult ? '🥗 Your 7-Day Diet Plan' : '👨‍🍳 Your AI Recipe'}</h3>
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

      {/* Language Prompt Modal */}
      {languagePrompt.show && createPortal(
        <div className="ai-camera-modal-overlay" onClick={() => setLanguagePrompt({ show: false, actionType: null })}>
          <div className="ai-lang-prompt-modal" onClick={e => e.stopPropagation()}>
            <div className="ai-lang-prompt-header">
              <h3>🌐 Choose Plan Language</h3>
              <button className="ai-camera-close-btn" onClick={() => setLanguagePrompt({ show: false, actionType: null })}>×</button>
            </div>
            <p className="ai-lang-prompt-desc">In which language would you like your result?</p>
            <div className="ai-lang-prompt-actions">
              <button className="ai-lang-btn urdu" onClick={() => executeGeneration('Urdu')}>🇵🇰 اردو (Urdu)</button>
              <button className="ai-lang-btn english" onClick={() => executeGeneration('English')}>🇬🇧 English</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default GymAI;

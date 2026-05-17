import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from '../components/Footer';
import '../css/Contact.css';

function Contact() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [info, setInfo] = useState({ location: 'Madinah, Saudi Arabia', phone: '+92 300 0000000', email: 'support@ajwahub.com', hours: 'Mon–Sat, 9am – 6pm' });

  useEffect(() => {
    const userData = localStorage.getItem('ajwaHub_currentUser');
    if (userData) setUser(JSON.parse(userData));
    fetch('http://localhost:5000/api/settings').then(r => r.json()).then(d => { if (d.settings) setInfo(d.settings); }).catch(() => {});
  }, []);

  const handleLogout = () => { localStorage.removeItem('ajwaHub_currentUser'); setUser(null); navigate('/description'); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
    } catch {}
    setSent(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="contact-page">
      <Navbar />

      <div className="contact-wrapper">

        {/* LEFT INFO */}
        <div className="contact-info">
          <span className="contact-badge">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight: '6px'}}><path d="M22 2L11 13"></path><path d="M22 2L15 22L11 13L2 9L22 2"></path></svg>
            Get In Touch
          </span>
          <h1>Let's <span>Talk</span></h1>
          <p>Have a question, feedback, or want to place a bulk order? We're here to help.</p>

          <div className="contact-cards">
            <div className="contact-card">
              <div className="cc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div><h4>Location</h4><p>{info.location}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              </div>
              <div><h4>Phone</h4><p>{info.phone}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              </div>
              <div><h4>Email</h4><p>{info.email}</p></div>
            </div>
            <div className="contact-card">
              <div className="cc-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              </div>
              <div><h4>Hours</h4><p>{info.hours}</p></div>
            </div>
          </div>
        </div>


        <div className="contact-form-box">
          <h2>Send a Message</h2>
          <p>We'll get back to you within 24 hours.</p>

          {sent && (
            <div className="contact-success">
              ✅ Message sent! We'll be in touch soon.
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="cf-row">
              <div className="cf-group">
                <label>Name</label>
                <input type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="cf-group">
                <label>Email</label>
                <input type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
            </div>
            <div className="cf-group">
              <label>Subject</label>
              <input type="text" placeholder="How can we help?" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required />
            </div>
            <div className="cf-group">
              <label>Message</label>
              <textarea rows={5} placeholder="Write your message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="cf-submit">
              <span>Send Message</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Contact;

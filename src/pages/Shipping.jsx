import { useNavigate } from 'react-router-dom';
import '../css/Tracking.css';
import Navbar from './Navbar';

function Shipping() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
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
      <div className="tracking-container">
        <h1 className="tracking-title">🚚 Shipping Status</h1>
        <div className="status-content">
          <div className="status-icon">🚚</div>
          <h2>Order in Transit</h2>
          <p>Your order has been dispatched and is on its way to you.</p>
        </div>
      </div>
    </div>
  );
}

export default Shipping;



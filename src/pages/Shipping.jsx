import { useNavigate } from 'react-router-dom';
import '../css/Tracking.css';
import Navbar from './Navbar';

function Shipping() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
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

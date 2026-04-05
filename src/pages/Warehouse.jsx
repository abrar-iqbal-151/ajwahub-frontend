import { useNavigate } from 'react-router-dom';
import '../css/Tracking.css';
import Navbar from './Navbar';

function Warehouse() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />
      <div className="tracking-container">
        <h1 className="tracking-title">📦 Warehouse Status</h1>
        <div className="status-content">
          <div className="status-icon">🏢</div>
          <h2>Order in Warehouse</h2>
          <p>Your order has been received and is being prepared for shipment.</p>
        </div>
      </div>
    </div>
  );
}

export default Warehouse;

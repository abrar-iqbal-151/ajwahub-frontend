import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Tracking.css';
import Navbar from './Navbar';

function Delivered() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <Navbar />
      <div className="tracking-container">
        <h1 className="tracking-title">🏠 Delivery Status</h1>
        <div className="status-content">
          <div className="status-icon">🏠</div>
          <h2>Order Delivered</h2>
          <p>Your order has been successfully delivered. Thank you for shopping with us!</p>
        </div>
      </div>
    </div>
  );
}

export default Delivered;

import React from 'react';
import { Link } from 'react-router-dom';
import './BookingSuccess.css';

const BookingCancelled = () => {
  return (
    <div className="booking-result-container">
      <div className="booking-result-card">
        <div className="result-icon cancelled">
          ❌
        </div>
        <h1>Booking Cancelled</h1>
        <p className="result-message">
          Your booking has been cancelled. No payment was processed.
        </p>
        
        <div className="result-actions">
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
          <Link to="/celebrities" className="btn-secondary">
            Browse Celebrities
          </Link>
        </div>
        
        <div className="help-section">
          <p>Need help? <Link to="/contact">Contact our support team</Link></p>
        </div>
      </div>
    </div>
  );
};

export default BookingCancelled;
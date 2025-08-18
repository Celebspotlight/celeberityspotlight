import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { checkPaymentStatus } from '../services/paymentService';
import './BookingSuccess.css';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState('checking');
  const [bookingDetails, setBookingDetails] = useState(null);
  const [error, setError] = useState(null);

  const paymentId = searchParams.get('payment_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        setPaymentStatus('failed');
        setError('No payment ID provided');
        return;
      }

      try {
        const status = await checkPaymentStatus(paymentId);
        setPaymentStatus(status.payment_status);
        
        // Get booking details from localStorage
        const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        const booking = bookings.find(b => b.paymentId === paymentId);
        setBookingDetails(booking);
        
        // Update booking status in localStorage
        if (booking && status.payment_status === 'finished') {
          booking.paymentStatus = 'completed';
          booking.status = 'confirmed';
          localStorage.setItem('bookings', JSON.stringify(bookings));
        }
      } catch (error) {
        console.error('Payment verification failed:', error);
        setPaymentStatus('failed');
        setError(error.message);
      }
    };

    verifyPayment();
  }, [paymentId]);

  const getStatusDisplay = () => {
    switch (paymentStatus) {
      case 'checking':
        return {
          icon: '⏳',
          title: 'Verifying Payment...',
          message: 'Please wait while we verify your payment.',
          className: 'pending'
        };
      case 'finished':
        return {
          icon: '✅',
          title: 'Payment Successful!',
          message: 'Your booking has been confirmed. You will receive an email with session details shortly.',
          className: 'success'
        };
      case 'waiting':
      case 'confirming':
        return {
          icon: '⏳',
          title: 'Payment Pending',
          message: 'Your payment is being processed. Please wait for confirmation.',
          className: 'pending'
        };
      default:
        return {
          icon: '❌',
          title: 'Payment Failed',
          message: error || 'Payment could not be verified. Please contact support.',
          className: 'failed'
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="booking-result-container">
      <div className="booking-result-card">
        <div className={`result-icon ${statusDisplay.className}`}>
          {statusDisplay.icon}
        </div>
        <h1>{statusDisplay.title}</h1>
        <p className="result-message">
          {statusDisplay.message}
        </p>
        
        {bookingDetails && (
          <div className="booking-details">
            <h3>Booking Details</h3>
            <div className="detail-row">
              <span className="detail-label">Booking ID:</span>
              <span className="detail-value">{bookingDetails.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Celebrity:</span>
              <span className="detail-value">{bookingDetails.celebrity?.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Package:</span>
              <span className="detail-value">{bookingDetails.formData?.package}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date:</span>
              <span className="detail-value">{bookingDetails.formData?.date}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{bookingDetails.formData?.time}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Total:</span>
              <span className="detail-value">${bookingDetails.total}</span>
            </div>
          </div>
        )}
        
        {paymentStatus === 'finished' && (
          <div className="zoom-link">
            <p>🎥 <strong>Your session link will be sent to your email within 24 hours.</strong></p>
          </div>
        )}
        
        <div className="result-actions">
          <Link to="/" className="btn-primary">
            Return to Home
          </Link>
          {paymentStatus !== 'finished' && (
            <Link to="/contact" className="btn-secondary">
              Contact Support
            </Link>
          )}
        </div>
        
        <div className="help-section">
          <p>Questions? <Link to="/contact">Contact our support team</Link></p>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;
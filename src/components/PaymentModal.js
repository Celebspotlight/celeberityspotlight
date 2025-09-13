import React, { useState, useEffect } from 'react';
import './PaymentModal.css';
import enhancedPaymentService from '../services/enhancedPaymentService';

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  service, 
  amount, 
  onRegularPayment, 
  onBitcoinPayment,
  onShowCryptoTutorial,
  position = { x: 0, y: 0 }
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [apiStatus, setApiStatus] = useState(null);
  
  // Body scroll management
  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    // Cleanup function to ensure body scroll is always restored
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Check API connectivity on component mount
  useEffect(() => {
    const checkAPI = async () => {
      const status = await enhancedPaymentService.checkAPIConnectivity();
      setApiStatus(status);
    };
    checkAPI();
  }, []);

  const handleSubmit = async (paymentType) => {
    // Component-level guard to prevent duplicate submissions
    if (window.paymentSubmitting) {
      console.log('🛡️ Payment already submitting, preventing duplicate');
      return;
    }
    
    if (!formData.fullName || !formData.email) {
      // Show ultimate notification with strict deduplication
      await window.showUltimateBookingNotification(
        'warning',
        'Required Fields Missing',
        'Please fill in required fields (Name and Email)'
      );
      return;
    }
    
    // Set submission guard
    window.paymentSubmitting = true;

    setIsLoading(true);
    setPaymentError(null);
    
    try {
      // For Bitcoin payments, use the same logic as BookingModal
      if (paymentType === 'bitcoin' && onBitcoinPayment) {
        await onBitcoinPayment(formData);
        // Don't close the modal - let the parent component handle it
        return;
      }
      
      // For regular payments, try enhanced payment service first
      const paymentData = {
        service: service?.title || service?.name || 'Service',
        amount: amount,
        customerInfo: formData,
        paymentType: paymentType
      };
      
      const response = await enhancedPaymentService.createPayment(paymentData);
      
      if (response.success && response.paymentUrl) {
        // Restore body scroll before redirecting
        document.body.style.overflow = 'unset';
        
        // Redirect to payment URL
        window.location.href = response.paymentUrl;
        
        // Close modal
        onClose();
      } else {
        throw new Error('No payment URL received');
      }
      
    } catch (error) {
      console.error('Payment submission error:', error);
      setPaymentError(error.message);
      
      // Fallback to original payment handlers if available
      try {
        if (paymentType === 'regular' && onRegularPayment) {
          await onRegularPayment(formData);
        } else if (paymentType === 'bitcoin' && onBitcoinPayment) {
          await onBitcoinPayment(formData);
        }
      } catch (fallbackError) {
        console.error('Fallback payment also failed:', fallbackError);
        // Show modern notification instead of alert
        const notificationData = {
          type: 'error',
          title: 'Payment Failed',
          message: `Payment processing failed: ${error.message}. Please try again or contact support.`
        };
        localStorage.setItem('pendingNotification', JSON.stringify(notificationData));
        window.dispatchEvent(new CustomEvent('showNotification', { detail: notificationData }));
      }
    } finally {
      setIsLoading(false);
      // Always clear the submission guard
      window.paymentSubmitting = false;
      console.log('🧹 Payment submission guard cleared');
    }
  };



  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => {
      // Restore body scroll before closing
      document.body.style.overflow = 'unset';
      onClose();
    }}>
      <div 
        className="payment-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Complete Payment</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="payment-summary">
            <h4>${amount} Payment</h4>
            <p>for {service?.title}</p>
            
            {/* API Status Indicator */}
            {apiStatus && (
              <div className={`api-status ${apiStatus.connected ? 'connected' : 'disconnected'}`}>
                <span className="status-indicator">●</span>
                {apiStatus.connected ? 'Payment API Connected' : 'Payment API Offline (Mock Mode)'}
              </div>
            )}
            
            {/* Payment Error Display */}
            {paymentError && (
              <div className="payment-error">
                <strong>Payment Error:</strong> {paymentError}
              </div>
            )}
          </div>
          
          <form className="payment-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Full Name *"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              required
            />
            <input
              type="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
            <input
              type="tel"
              placeholder="Phone Number (Optional)"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
            <textarea
              placeholder="Message (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              rows="3"
            />
          </form>
          
          <div className="payment-methods">
            <button 
              className="payment-btn bitcoin"
              onClick={() => handleSubmit('bitcoin')}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Processing...' : '₿ Pay with Bitcoin'}
            </button>
          </div>
          
          <div className="crypto-tutorial-section">
            <div className="tutorial-highlight">
              <span className="tutorial-icon">🚀</span>
              <div className="tutorial-content">
                <h6>New to Crypto Payments?</h6>
                <p>Watch our 3-step video series to learn how to send cryptocurrency payments securely</p>
              </div>
              <button 
                type="button"
                className="btn-tutorial"
                onClick={onShowCryptoTutorial}
              >
                🎥 Watch Crypto Tutorial
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
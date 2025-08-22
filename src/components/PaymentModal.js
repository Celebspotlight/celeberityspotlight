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
  const [debugMode, setDebugMode] = useState(false);

  // Check API connectivity on component mount
  useEffect(() => {
    const checkAPI = async () => {
      const status = await enhancedPaymentService.checkAPIConnectivity();
      setApiStatus(status);
    };
    checkAPI();
  }, []);

  const handleSubmit = async (paymentType) => {
    if (!formData.fullName || !formData.email) {
      alert('Please fill in required fields (Name and Email)');
      return;
    }

    setIsLoading(true);
    setPaymentError(null);
    
    try {
      // Prepare booking data for enhanced payment service
      const bookingData = {
        bookingId: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        totalAmount: amount,
        celebrityName: service?.title || 'Celebrity Experience',
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        notes: formData.notes,
        selectedCrypto: paymentType === 'bitcoin' ? 'btc' : 'btc', // Default to BTC
        paymentType: paymentType
      };

      console.log('Creating payment with enhanced service:', bookingData);
      
      // Use enhanced payment service
      const paymentResult = await enhancedPaymentService.createPayment(bookingData);
      
      console.log('Payment result:', paymentResult);
      
      if (paymentResult.payment_url) {
        // Redirect to payment URL
        window.open(paymentResult.payment_url, '_blank');
        
        // Show success message
        alert(`Payment initiated successfully! ${paymentResult.mock ? '(Mock payment for testing)' : ''}\n\nPayment ID: ${paymentResult.payment_id}\n\nA new tab has opened for payment completion.`);
        
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
        alert(`Payment processing failed: ${error.message}\n\nPlease try again or contact support.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  const viewDebugLogs = () => {
    const logs = enhancedPaymentService.getPaymentDebugLogs();
    console.log('Payment Debug Logs:', logs);
    alert(`Debug logs (${logs.length} entries) have been logged to console. Press F12 to view.`);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="payment-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Complete Payment</h3>
          <div className="header-controls">
            <button onClick={toggleDebugMode} className="debug-btn" title="Toggle Debug Mode">
              🔧
            </button>
            <button onClick={onClose} className="close-btn">×</button>
          </div>
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
              className="payment-btn regular"
              onClick={() => handleSubmit('regular')}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Processing...' : '💳 Pay with Card/Crypto'}
            </button>
            <button 
              className="payment-btn bitcoin"
              onClick={() => handleSubmit('bitcoin')}
              disabled={isLoading}
            >
              {isLoading ? '⏳ Processing...' : '₿ Pay with Bitcoin'}
            </button>
          </div>
          
          <div className="crypto-tutorial-link">
            <p>New to crypto payments? <button className="tutorial-link-btn" onClick={onShowCryptoTutorial}>Watch our step-by-step tutorial</button></p>
          </div>
          
          {/* Debug Panel */}
          {debugMode && (
            <div className="debug-panel">
              <h4>Debug Information</h4>
              <div className="debug-info">
                <p><strong>Environment:</strong> {process.env.REACT_APP_ENVIRONMENT || 'development'}</p>
                <p><strong>API Key:</strong> {process.env.REACT_APP_NOWPAYMENTS_API_KEY ? 'Configured' : 'Missing'}</p>
                <p><strong>API Status:</strong> {apiStatus?.connected ? 'Connected' : 'Disconnected'}</p>
                {apiStatus?.error && <p><strong>API Error:</strong> {apiStatus.error}</p>}
              </div>
              <div className="debug-actions">
                <button onClick={viewDebugLogs} className="debug-action-btn">
                  View Debug Logs
                </button>
                <button 
                  onClick={() => enhancedPaymentService.clearPaymentDebugLogs()} 
                  className="debug-action-btn"
                >
                  Clear Logs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
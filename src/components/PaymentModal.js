import React, { useState } from 'react';
import './PaymentModal.css';

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

  const handleSubmit = async (paymentType) => {
    if (!formData.fullName || !formData.email) {
      alert('Please fill in required fields (Name and Email)');
      return;
    }

    setIsLoading(true);
    try {
      if (paymentType === 'regular') {
        await onRegularPayment(formData);
      } else if (paymentType === 'bitcoin') {
        await onBitcoinPayment(formData);
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      alert('Payment processing failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="payment-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>Complete Donation</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="modal-body">
          <div className="payment-summary">
            <h4>${amount} Donation</h4>
            <p>to {service?.title}</p>
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
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
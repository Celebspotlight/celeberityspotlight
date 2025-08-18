import React, { useState, useEffect, useRef } from 'react';
import './PersonalizedVideoModal.css';
import { createPayment } from '../services/paymentService';
import BitcoinPayment from './BitcoinPayment';
import CryptoTutorial from './CryptoTutorial';

const PersonalizedVideoModal = ({ isOpen, onClose, celebrity, videoServices, getCelebrityVideoPrice, clickPosition }) => {
  const [formData, setFormData] = useState({
    videoType: 'birthday',
    recipientName: '',
    senderName: '',
    email: '',
    customInstructions: '',
    urgentDelivery: false,
    agreeToTerms: false
  });
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [originalScrollPosition, setOriginalScrollPosition] = useState(0);
  const modalRef = useRef(null);

  // Auto-scroll functionality
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position immediately when modal opens
      const currentScrollPosition = window.pageYOffset;
      setOriginalScrollPosition(currentScrollPosition);
      
      // Scroll to top smoothly
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    // Cleanup function when modal closes
    return () => {
      if (!isOpen) {
        // Restore body scroll
        document.body.style.overflow = 'unset';
        
        // Restore original scroll position when modal closes
        if (originalScrollPosition > 0) {
          setTimeout(() => {
            window.scrollTo({
              top: originalScrollPosition,
              behavior: 'smooth'
            });
          }, 100); // Small delay to ensure modal is fully closed
        }
      }
    };
  }, [isOpen]); // Remove originalScrollPosition from dependency array

  if (!isOpen) return null;

  const selectedService = videoServices[formData.videoType];
  const basePrice = getCelebrityVideoPrice(celebrity, formData.videoType);
  const totalPrice = basePrice + (formData.urgentDelivery ? 50 : 0);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 2) {
      if (!formData.recipientName.trim()) errors.recipientName = 'Recipient name is required';
      if (!formData.senderName.trim()) errors.senderName = 'Your name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    }
    
    // Remove the agreeToTerms validation for step 3 since it's not in the form
    // if (step === 3) {
    //   if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to terms';
    // }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      return formData.videoType;
    }
    if (currentStep === 2) {
      return formData.recipientName.trim() && 
             formData.senderName.trim() && 
             formData.email.trim() && 
             /\S+@\S+\.\S+/.test(formData.email);
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBitcoinPayment = () => {
    const bookingId = 'PV' + Date.now();
    const bookingData = {
      id: bookingId,
      type: 'personalized_video',
      celebrity: celebrity,
      videoType: formData.videoType,
      formData: formData,
      total: totalPrice,
      status: 'pending_payment',
      createdAt: new Date().toISOString()
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    setShowBitcoinPayment(true);
  };

  const handleRegularPayment = async () => {
    try {
      const bookingId = 'PV' + Date.now();
      
      const paymentData = {
        bookingId,
        totalAmount: totalPrice,
        celebrityName: celebrity.name,
        selectedCrypto: 'btc',
        email: formData.email
      };
      
      const payment = await createPayment(paymentData);
      
      const bookingData = {
        id: bookingId,
        type: 'personalized_video',
        celebrity: celebrity,
        videoType: formData.videoType,
        formData: formData,
        total: totalPrice,
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
        paymentId: payment.payment_id,
        paymentUrl: payment.payment_url
      };
      
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingBookings.push(bookingData);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      
      window.open(payment.payment_url, '_blank');
      onClose();
      
    } catch (error) {
      alert('Payment failed: ' + error.message);
    }
  };

  const handleBitcoinPaymentComplete = () => {
    setShowBitcoinPayment(false);
    onClose();
  };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedPaymentMethod(null);
    setShowBitcoinPayment(false);
    setFormErrors({});
    
    document.body.style.overflow = 'unset';
    if (originalScrollPosition > 0) {
      setTimeout(() => {
        window.scrollTo({
          top: originalScrollPosition,
          behavior: 'smooth'
        });
      }, 100);
    }
    
    onClose();
  };

  return (
    <div className="personalized-video-modal-overlay" onClick={handleClose}>
      <div 
        ref={modalRef}
        className="personalized-video-modal" 
        onClick={e => e.stopPropagation()}
      >
        {!showBitcoinPayment ? (
          <>
            <div className="modal-header">
              <h2>Book Personalized Video</h2>
              <button className="close-btn" onClick={handleClose}>×</button>
            </div>
            
            <div className="celebrity-info">
              <div className="celebrity-avatar">
                {celebrity.image ? (
                  <img src={celebrity.image} alt={celebrity.name} />
                ) : (
                  <div className="placeholder">{celebrity.name.charAt(0)}</div>
                )}
              </div>
              <div>
                <h3>{celebrity.name}</h3>
                <span className="category">{celebrity.category}</span>
              </div>
            </div>

            {/* Step 1: Video Type Selection */}
            {currentStep === 1 && (
              <div className="step-content">
                <h3>Choose Video Type</h3>
                <div className="video-types-grid">
                  {Object.entries(videoServices).map(([key, service]) => {
                    const price = getCelebrityVideoPrice(celebrity, key);
                    return (
                      <div 
                        key={key}
                        className={`video-type-card ${formData.videoType === key ? 'selected' : ''}`}
                        onClick={() => setFormData(prev => ({ ...prev, videoType: key }))}
                      >
                        <div className="service-icon">{service.icon}</div>
                        <h4>{service.name}</h4>
                        <p>{service.description}</p>
                        <div className="price">${price}</div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="urgent-delivery">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="urgentDelivery"
                      checked={formData.urgentDelivery}
                      onChange={handleInputChange}
                    />
                    Rush Delivery (+$50) - Get your video within 24 hours
                  </label>
                </div>
              </div>
            )}

            {/* Step 2: Video Details */}
            {currentStep === 2 && (
              <div className="step-content">
                <h3>Video Details</h3>
                
                <div className="form-group">
                  <label>Who is this video for? *</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder="e.g., Sarah, Mom, John Smith"
                  />
                  {formErrors.recipientName && <span className="error">{formErrors.recipientName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                  />
                  {formErrors.senderName && <span className="error">{formErrors.senderName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                  />
                  {formErrors.email && <span className="error">{formErrors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label>Custom Instructions</label>
                  <textarea
                    name="customInstructions"
                    value={formData.customInstructions}
                    onChange={handleInputChange}
                    placeholder="Tell the celebrity what you'd like them to say..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Payment Method Selection */}
            {currentStep === 3 && (
              <div className="step-content">
                <h3>Choose Your Payment Method</h3>
                
                <div className="order-summary">
                  <div className="summary-item">
                    <span>Celebrity:</span>
                    <span>{celebrity.name}</span>
                  </div>
                  <div className="summary-item">
                    <span>Video Type:</span>
                    <span>{selectedService.name}</span>
                  </div>
                  <div className="summary-item">
                    <span>Base Price:</span>
                    <span>${basePrice}</span>
                  </div>
                  {formData.urgentDelivery && (
                    <div className="summary-item">
                      <span>Rush Delivery:</span>
                      <span>+$50</span>
                    </div>
                  )}
                  <div className="summary-item total">
                    <span>Total:</span>
                    <span>${totalPrice}</span>
                  </div>
                </div>
                
                <div className="payment-options">
                  <div className="payment-option-card bitcoin-payment">
                    <div className="payment-icon">🪙</div>
                    <h4>Direct Bitcoin Payment</h4>
                    <p>Send Bitcoin directly to our wallet address</p>
                    <ul className="payment-features">
                      <li>🪙 Direct Bitcoin transfer</li>
                      <li>📋 Copy our BTC address</li>
                      <li>📺 Video tutorial included</li>
                      <li>⏱️ 24hr verification</li>
                    </ul>
                    <button 
                      className="select-payment-btn bitcoin"
                      onClick={handleBitcoinPayment}
                    >
                      Pay with Bitcoin
                    </button>
                  </div>
                </div>
                
                <div className="payment-actions">
                  <button 
                    className="btn-primary"
                    onClick={handleRegularPayment}
                  >
                    Proceed to Payment (${totalPrice})
                  </button>
                </div>
                
                    <div className="payment-tutorial-section">
                  <div className="tutorial-highlight">
                    <div className="tutorial-icon">🚀</div>
                    <div className="tutorial-content">
                      <h4>New to Crypto Payments?</h4>
                      <p>Watch our comprehensive 3-step video series to learn how to send cryptocurrency payments securely and confidently.</p>
                      <button 
                        type="button"
                        className="tutorial-btn"
                        onClick={() => setShowCryptoTutorial(true)}
                      >
                        Watch Crypto Tutorial
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="modal-footer">
              {currentStep > 1 && (
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </button>
              )}
              
              {currentStep < 3 && (
                <button 
                  type="button" 
                  className="btn-primary"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceedToNextStep()}
                >
                  Continue
                </button>
              )}
              
              <button type="button" className="btn-secondary" onClick={handleClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <BitcoinPayment 
            amount={totalPrice}
            onClose={() => setShowBitcoinPayment(false)}
          />
        )}
        
        {showCryptoTutorial && (
          <div className="modal-overlay crypto-tutorial-modal" style={{zIndex: 1000000}}>
            <div className="modal-content crypto-tutorial-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Crypto Payment Tutorial</h2>
                <button className="close-btn" onClick={() => setShowCryptoTutorial(false)}>&times;</button>
              </div>
              <CryptoTutorial 
                onContinue={() => {
                  setShowCryptoTutorial(false);
                  setShowBitcoinPayment(true);
                }}
                onSkip={() => setShowCryptoTutorial(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalizedVideoModal;
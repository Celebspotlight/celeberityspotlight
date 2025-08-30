import React, { useState } from 'react';
import './ActingClassModal.css';
import BitcoinPayment from './BitcoinPayment';
import CryptoTutorial from './CryptoTutorial';
import './ActingClassModal.css';

const ActingClassModal = ({ coach, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    preferredDateTime: '',
    classTopic: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!formData.classTopic.trim()) {
      newErrors.classTopic = 'Class topic is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBitcoinPayment = () => {
    if (!validateForm()) {
      return;
    }
    
    const bookingId = `acting_${Date.now()}`;
    const bookingData = {
      bookingId,
      type: 'acting_class',
      coachId: coach.id,
      coachName: coach.name,
      classType: coach.class_type,
      duration: coach.class_duration,
      totalAmount: coach.class_price,
      customerInfo: formData,
      timestamp: new Date().toISOString(),
      status: 'pending_payment'
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    setShowBitcoinPayment(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const bookingId = `acting_${Date.now()}`;
      
      // Save booking data
      const bookingData = {
        bookingId,
        type: 'acting_class',
        coachId: coach.id,
        coachName: coach.name,
        classType: coach.class_type,
        duration: coach.class_duration,
        totalAmount: coach.class_price,
        customerInfo: formData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      
      // Save to localStorage (in production, save to database)
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingBookings.push(bookingData);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      
      // Show simple confirmation message
      alert(`Acting class booking confirmed! Your booking ID is: ${bookingId}\n\nPlease use the payment tutorial or Bitcoin payment options above to complete your payment.`);
      onClose();
      
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book Acting Class</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {!showBitcoinPayment ? (
            <>
              {/* Coach Info */}
              <div className="coach-summary">
                <div className="coach-avatar">
                  <span>{coach.name.charAt(0)}</span>
                </div>
                <div className="coach-details">
                  <h3>{coach.name}</h3>
                  <p>{coach.class_type} • {coach.class_duration}</p>
                  <p className="price">${coach.class_price}</p>
                </div>
              </div>
              
              {/* Booking Form */}
              <form onSubmit={handleSubmit} className="booking-form">
                <div className="form-group">
                  <label htmlFor="fullName">Full Name *</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={errors.fullName ? 'error' : ''}
                  />
                  {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                  />
                  {errors.email && <span className="error-text">{errors.email}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="preferredDateTime">Preferred Date/Time (Optional)</label>
                  <input
                    type="datetime-local"
                    id="preferredDateTime"
                    name="preferredDateTime"
                    value={formData.preferredDateTime}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="classTopic">Class Topic / Focus Area *</label>
                  <input
                    type="text"
                    id="classTopic"
                    name="classTopic"
                    placeholder="e.g., Method Acting, Scene Study, Audition Prep"
                    value={formData.classTopic}
                    onChange={handleInputChange}
                    className={errors.classTopic ? 'error' : ''}
                  />
                  {errors.classTopic && <span className="error-text">{errors.classTopic}</span>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="notes">Notes to Instructor (Optional)</label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows="3"
                    placeholder="Any specific requests or information for your instructor..."
                    value={formData.notes}
                    onChange={handleInputChange}
                  ></textarea>
                </div>
                
                {/* Payment Options Section */}
                <div className="payment-options-section">
                  <h4>Payment Options</h4>
                  
                  {/* Crypto Tutorial Section - First Priority */}
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
                          🎥 Watch Crypto Tutorial
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bitcoin Payment Option - Second Priority */}
                  <div className="payment-option-card bitcoin-payment">
                    <div className="payment-icon">🪙</div>
                    <h4>Direct Bitcoin Payment</h4>
                    <p>Send Bitcoin directly to our wallet address</p>
                    <button 
                      type="button"
                      className="select-payment-btn bitcoin"
                      onClick={handleBitcoinPayment}
                    >
                      ₿ Pay with Bitcoin
                    </button>
                  </div>
                </div>
                
                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={onClose}>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Processing...' : `Proceed to Payment ($${coach.class_price})`}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <BitcoinPayment 
              amount={coach.class_price}
              onPaymentComplete={() => {
                // Handle payment completion
                alert('Payment confirmed! Your acting class booking has been submitted.');
                setShowBitcoinPayment(false);
                onClose();
              }}
              onCancel={() => setShowBitcoinPayment(false)}
              bookingId={`AC-${Date.now()}`}
            />
          )}
        </div>
        
        {showCryptoTutorial && (
          <div className="modal-overlay crypto-tutorial-modal" style={{zIndex: 1000000}}>
            <div className="modal-content crypto-tutorial-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Crypto Payment Tutorial</h2>
                <button className="close-btn" onClick={() => setShowCryptoTutorial(false)}>&times;</button>
              </div>
              <CryptoTutorial 
                onContinue={() => setShowCryptoTutorial(false)}
                onSkip={() => setShowCryptoTutorial(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActingClassModal;
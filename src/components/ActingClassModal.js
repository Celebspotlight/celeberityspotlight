import React, { useState, useEffect, useRef } from 'react';
import './ActingClassModal.css';
import BitcoinPayment from './BitcoinPayment';
import CryptoTutorial from './CryptoTutorial';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ActingClassModal = ({ coach, onClose }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const modalRef = useRef(null);
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
  const [tutorialVideoType, setTutorialVideoType] = useState(null);

  // Body scroll management
  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Cleanup function to ensure body scroll is always restored
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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

  const handleBitcoinPayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    // Prevent duplicate payment submissions
    if (window.actingClassSubmitting) {
      console.log('Payment submission already in progress');
      return;
    }
    
    window.actingClassSubmitting = true;
    
    // Only show Bitcoin payment modal - DO NOT create booking data until payment is confirmed
    setShowBitcoinPayment(true);
  };



  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" ref={modalRef} onClick={(e) => e.stopPropagation()}>
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
              <form className="booking-form">
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
                        <p>Choose your preferred payment method and watch our tutorial to learn how to send cryptocurrency payments securely using CashApp or Venmo.</p>
                        <div className="tutorial-buttons">
                          <button 
                            type="button"
                            className="tutorial-btn cashapp-btn"
                            onClick={() => {
                              setTutorialVideoType('cashapp');
                              setShowCryptoTutorial(true);
                            }}
                          >
                            💰 CashApp Tutorial
                          </button>
                          <button 
                            type="button"
                            className="tutorial-btn venmo-btn"
                            onClick={() => {
                              setTutorialVideoType('venmo');
                              setShowCryptoTutorial(true);
                            }}
                          >
                            💳 Venmo Tutorial
                          </button>
                        </div>
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
                </div>
              </form>
            </>
          ) : (
            <BitcoinPayment 
              amount={coach.class_price}
              onPaymentComplete={async () => {
                // Prevent multiple saves with a flag
                if (window.actingClassSaving) {
                  console.log('Booking save already in progress, skipping duplicate save.');
                  return;
                }
                
                window.actingClassSaving = true;
                
                try {
                  // Show success notification immediately
                  if (window.showNotification) {
                    window.showNotification('Payment confirmed! Processing your acting class booking...', 'success');
                  }
                } catch (notificationError) {
                  console.log('Notification system not available:', notificationError);
                }
                
                try {
                  // Handle payment completion with proper data persistence
                  const bookingId = `AC-${Date.now()}`;
                  
                  // Parse date and time from preferredDateTime
                  let parsedDate = null;
                  let parsedTime = null;
                  if (formData.preferredDateTime) {
                    const dateTime = new Date(formData.preferredDateTime);
                    parsedDate = dateTime.toISOString().split('T')[0];
                    parsedTime = dateTime.toTimeString().split(' ')[0].substring(0, 5);
                  }
                  
                  // Use current user from auth context (already available from useAuth hook)
                  
                  // Create comprehensive booking data
                  const bookingData = {
                    bookingId: bookingId,
                    userId: currentUser?.uid || 'guest',
                    userEmail: currentUser?.email || formData.email,
                    type: 'acting_class',
                    service: `Acting Class - ${coach.class_type}`,
                    coach: {
                      id: coach.id,
                      name: coach.name,
                      classType: coach.class_type,
                      duration: coach.class_duration
                    },
                    customerInfo: {
                      fullName: formData.fullName,
                      email: formData.email,
                      preferredDateTime: formData.preferredDateTime,
                      classTopic: formData.classTopic,
                      notes: formData.notes
                    },
                    date: parsedDate,
                    time: parsedTime,
                    startDate: parsedDate,
                    className: `${coach.class_type} with ${coach.name}`,
                    pricing: {
                      total: coach.class_price
                    },
                    status: 'pending_payment',
                    paymentMethod: 'bitcoin',
                    paymentStatus: 'submitted',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                  };
                  
                  // Check if this booking already exists to prevent duplicates
                  const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
                  const isDuplicate = existingBookings.some(booking => 
                    booking.coach?.id === coach.id && 
                    booking.userEmail === (currentUser?.email || formData.email) &&
                    booking.type === 'acting_class' &&
                    Math.abs(new Date(booking.createdAt).getTime() - new Date().getTime()) < 30000
                  );
                  
                  if (isDuplicate) {
                    console.log('Duplicate booking detected, skipping save.');
                    return;
                  }
                  
                  // Save to localStorage for immediate display in dashboard
                  existingBookings.push(bookingData);
                  localStorage.setItem('bookings', JSON.stringify(existingBookings));
                  
                  // Save to Firebase
                  try {
                    await addDoc(collection(db, 'bookings'), {
                      ...bookingData,
                      createdAt: serverTimestamp()
                    });
                    console.log('Acting class booking saved to Firebase successfully');
                  } catch (firebaseError) {
                    console.error('Error saving to Firebase:', firebaseError);
                  }
                  
                  console.log('Acting class booking saved successfully:', bookingData);
                  
                  // Close modal and navigate
                  setShowBitcoinPayment(false);
                  document.body.style.overflow = 'unset';
                  onClose();
                  
                  // Navigate to dashboard
                  setTimeout(() => {
                    navigate('/dashboard');
                  }, 1000);
                  
                } catch (error) {
                  console.error('Error saving acting class booking:', error);
                  alert('Error processing booking. Please try again.');
                } finally {
                  window.actingClassSaving = false;
                  window.actingClassSubmitting = false;
                }
              }}
              onCancel={() => {
                setShowBitcoinPayment(false);
                window.actingClassSubmitting = false;
                // Restore body scroll when canceling payment
                document.body.style.overflow = 'unset';
              }}
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
                onContinue={() => {
                  setShowCryptoTutorial(false);
                  setTutorialVideoType(null);
                }}
                onSkip={() => {
                  setShowCryptoTutorial(false);
                  setTutorialVideoType(null);
                }}
                videoType={tutorialVideoType}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActingClassModal;
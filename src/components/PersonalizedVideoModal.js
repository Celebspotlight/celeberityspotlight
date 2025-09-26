import React, { useState, useEffect, useRef } from 'react';
import './PersonalizedVideoModal.css';
import BitcoinPayment from './BitcoinPayment';
import CryptoTutorial from './CryptoTutorial';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const PersonalizedVideoModal = ({ isOpen, onClose, celebrity, videoServices, getCelebrityVideoPrice, clickPosition }) => {
  const { currentUser } = useAuth();
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
  const [tutorialVideoType, setTutorialVideoType] = useState(null);
  const [, setSelectedPaymentMethod] = useState(null);
  const modalRef = useRef(null);

  // Enhanced modal management with proper viewport handling
  useEffect(() => {
    if (isOpen) {
      // Scroll to top when modal opens
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Ensure modal is visible in viewport when Bitcoin payment shows
      if (showBitcoinPayment && modalRef.current) {
        setTimeout(() => {
          modalRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
        }, 100);
      }
    } else {
      // Restore body scroll when modal closes
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure body scroll is always restored
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, showBitcoinPayment]);

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

  // Removed unused validateStep function

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

  // const handleNext = () => {
  //   if (validateStep(currentStep)) {
  //     setCurrentStep(prev => prev + 1);
  //   }
  // };

  const handleBitcoinPayment = () => {
    // Prevent duplicate payment submissions
    if (window.personalizedVideoSubmitting) {
      console.log('Payment submission already in progress');
      return;
    }
    
    window.personalizedVideoSubmitting = true;
    
    // Only show Bitcoin payment modal - DO NOT create booking data until payment is confirmed
    setShowBitcoinPayment(true);
    
    // Ensure payment modal is visible in viewport
    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };

  // Removed unused handleRegularPayment function

  // const handleBitcoinPaymentComplete = () => {
  //   setShowBitcoinPayment(false);
  //   onClose();
  // };

  const handleClose = () => {
    setCurrentStep(1);
    setSelectedPaymentMethod(null);
    setShowBitcoinPayment(false);
    setShowCryptoTutorial(false);
    setFormErrors({});
    
    // Ensure body scroll is restored when closing
    document.body.style.overflow = 'unset';
    
    // Call the parent's onClose function to properly close the modal
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
                
                {/* Payment Tutorial Section - First Priority */}
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
                      ₿ Pay with Bitcoin
                    </button>
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
          onPaymentComplete={async () => {
            // Prevent multiple saves with a flag
            if (window.personalizedVideoSaving) {
              console.log('Booking save already in progress, skipping duplicate save.');
              return;
            }
            
            window.personalizedVideoSaving = true;
            
            try {
              // Show success notification immediately
              if (window.showNotification) {
                window.showNotification('Payment confirmed! Processing your personalized video booking...', 'success');
              }
            } catch (notificationError) {
              console.log('Notification system not available:', notificationError);
            }
            
            try {
              // Handle payment completion with proper data persistence
              const bookingId = `PV-${Date.now()}`;
              
              // Create comprehensive booking data
              const bookingData = {
                bookingId: bookingId,
                userId: currentUser?.uid || 'guest',
                userEmail: currentUser?.email || formData.email,
                type: 'personalized_video',
                service: `${celebrity.name} - ${videoServices[formData.videoType]?.name || 'Personalized Video'}`,
                celebrity: {
                  id: celebrity.id,
                  name: celebrity.name,
                  image: celebrity.image,
                  price: getCelebrityVideoPrice(celebrity, formData.videoType)
                },
                personalInfo: {
                  senderName: formData.senderName,
                  email: formData.email,
                  recipientName: formData.recipientName
                },
                videoDetails: {
                  videoType: formData.videoType,
                  videoTypeName: videoServices[formData.videoType]?.name || 'Standard Video',
                  customInstructions: formData.customInstructions,
                  urgentDelivery: formData.urgentDelivery
                },
                pricing: {
                  basePrice: getCelebrityVideoPrice(celebrity, formData.videoType),
                  urgentDeliveryFee: formData.urgentDelivery ? 50 : 0,
                  total: totalPrice
                },
                status: 'pending', // Pending admin approval
                paymentMethod: 'bitcoin',
                paymentStatus: 'pending', // Keep as pending for admin panel visibility
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };
              
              // Check if this booking already exists to prevent duplicates
              const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
              const isDuplicate = existingBookings.some(booking => 
                booking.celebrity?.id === celebrity.id && 
                booking.userEmail === (currentUser?.email || formData.email) &&
                booking.type === 'personalized_video' &&
                Math.abs(new Date(booking.createdAt).getTime() - new Date().getTime()) < 30000 // Within 30 seconds
              );
              
              if (isDuplicate) {
                console.log('Duplicate booking detected, skipping save.');
                return;
              }
              
              // Save to localStorage for immediate display in dashboard
              existingBookings.push(bookingData);
              localStorage.setItem('bookings', JSON.stringify(existingBookings));
              
              // Save to Firebase database for admin panel visibility
              try {
                const bookingsCollection = collection(db, 'bookings');
                const docRef = await addDoc(bookingsCollection, {
                  ...bookingData,
                  createdAt: serverTimestamp(),
                  updatedAt: serverTimestamp()
                });
                console.log('Personalized video booking saved to Firebase with ID:', docRef.id);
              } catch (firebaseError) {
                console.error('Error saving to Firebase:', firebaseError);
                // Don't fail the entire process if Firebase save fails
              }
              
              // Show detailed success notification with booking ID
              try {
                if (window.showNotification) {
                  window.showNotification(
                    `🎉 Personalized video booking confirmed! Booking ID: ${bookingId}. You'll receive your custom video within 3-5 business days.`,
                    'success'
                  );
                }
              } catch (notificationError) {
                console.log('Notification system not available:', notificationError);
              }
              
              console.log('Payment confirmed! Personalized video booking saved successfully.');
              console.log('Personalized video booking saved:', bookingData);
              
              // Redirect to dashboard after a short delay
              setTimeout(() => {
                window.location.href = '/dashboard';
              }, 2000);
            } catch (error) {
              console.error('Error saving personalized video booking:', error);
              
              // Show error notification
              try {
                if (window.showNotification) {
                  window.showNotification(
                    'Payment confirmed, but there was an issue saving your booking data. Please contact support with your payment confirmation.',
                    'error'
                  );
                }
              } catch (notificationError) {
                console.log('Notification system not available:', notificationError);
              }
            } finally {
              // Reset both saving and submission flags
              setTimeout(() => {
                window.personalizedVideoSaving = false;
                window.personalizedVideoSubmitting = false;
              }, 5000);
            }
            
            // Reset all modal states before closing
            setShowBitcoinPayment(false);
            setShowCryptoTutorial(false);
            setCurrentStep(1);
            setSelectedPaymentMethod(null);
            setFormErrors({});
            
            // Ensure body scroll is restored
            document.body.style.overflow = 'unset';
            
            // Close the modal
            onClose();
          }}
            onCancel={() => {
              setShowBitcoinPayment(false);
              // Clear submission guard when canceling
              window.personalizedVideoSubmitting = false;
              // Ensure body scroll is restored when canceling payment
              document.body.style.overflow = 'unset';
            }}
            bookingId={`PV-${Date.now()}`}
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

export default PersonalizedVideoModal;
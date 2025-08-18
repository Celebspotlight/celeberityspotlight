import React, { useState, useEffect } from 'react';
import './BookVideoPage.css';
import { createPayment } from '../services/paymentService';
import CryptoTutorial from '../components/CryptoTutorial';

const BookVideoPage = () => {
  const [celebrity, setCelebrity] = useState(null);
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
  const [loading, setLoading] = useState(true);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);

  const videoServices = {
    birthday: {
      name: 'Birthday Shoutout',
      basePrice: 25,
      description: 'Personalized birthday message',
      icon: '🎂',
      popular: true
    },
    anniversary: {
      name: 'Anniversary Wishes',
      basePrice: 30,
      description: 'Celebrate special milestones',
      icon: '💕'
    },
    promotion: {
      name: 'Business Promotion',
      basePrice: 100,
      description: 'Promote your business',
      icon: '📢'
    },
    congratulations: {
      name: 'Congratulations',
      basePrice: 35,
      description: 'Celebrate achievements',
      icon: '🎉'
    },
    getWell: {
      name: 'Get Well Soon',
      basePrice: 40,
      description: 'Send healing wishes',
      icon: '🌟'
    },
    graduation: {
      name: 'Graduation Message',
      basePrice: 45,
      description: 'Celebrate graduation',
      icon: '🎓'
    },
    holiday: {
      name: 'Holiday Greetings',
      basePrice: 30,
      description: 'Seasonal messages',
      icon: '🎄'
    },
    custom: {
      name: 'Custom Message',
      basePrice: 50,
      description: 'Any occasion',
      icon: '💬'
    }
  };

  const getCelebrityVideoPrice = (celebrity, serviceType) => {
    const basePrice = videoServices[serviceType].basePrice;
    const categoryMultiplier = {
      'Music': 4,
      'Movies': 3.5,
      'Sports': 3,
      'TV': 2.5,
      'Social Media': 2,
      'Comedy': 2.2,
      'Reality TV': 1.8
    };
    return Math.round(basePrice * (categoryMultiplier[celebrity.category] || 2));
  };

  useEffect(() => {
    // Get celebrity data from localStorage or URL params
    const urlParams = new URLSearchParams(window.location.search);
    const celebrityId = urlParams.get('id');
    
    let selectedCelebrity = null;
    
    if (celebrityId) {
      // First try to load from celebrities list
      const savedCelebrities = localStorage.getItem('celebrities');
      if (savedCelebrities) {
        const celebrities = JSON.parse(savedCelebrities);
        selectedCelebrity = celebrities.find(c => c.id.toString() === celebrityId);
      }
      
      // If not found in celebrities list, try selectedCelebrity as fallback
      if (!selectedCelebrity) {
        const storedCelebrity = localStorage.getItem('selectedCelebrity');
        if (storedCelebrity) {
          const parsedCelebrity = JSON.parse(storedCelebrity);
          // Verify the ID matches
          if (parsedCelebrity.id.toString() === celebrityId) {
            selectedCelebrity = parsedCelebrity;
          }
        }
      }
    } else {
      // Fallback: get from localStorage (set by PersonalizedVideos page)
      const storedCelebrity = localStorage.getItem('selectedCelebrity');
      if (storedCelebrity) {
        selectedCelebrity = JSON.parse(storedCelebrity);
      }
    }
    
    if (selectedCelebrity) {
      setCelebrity(selectedCelebrity);
      // Clean up the selectedCelebrity after successful load
      localStorage.removeItem('selectedCelebrity');
    }
    
    setLoading(false);
  }, []);

  const selectedService = videoServices[formData.videoType];
  const basePrice = celebrity ? getCelebrityVideoPrice(celebrity, formData.videoType) : 0;
  const urgentFee = formData.urgentDelivery ? 50 : 0;
  const totalPrice = basePrice + urgentFee;

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
    
    if (step === 3) {
      if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to terms';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
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
      
      // Save booking data
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
      
      // Redirect to payment
      window.open(payment.payment_url, '_blank');
      
      // Redirect back to main page
      window.location.href = '/personalized-videos';
      
    } catch (error) {
      alert('Payment failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="book-video-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading celebrity information...</p>
        </div>
      </div>
    );
  }

  if (!celebrity) {
    return (
      <div className="book-video-page">
        <div className="error-container">
          <div className="error-content">
            <div className="error-icon">😕</div>
            <h2>Celebrity Not Found</h2>
            <p>The selected celebrity could not be found. Please try again.</p>
            <button 
              className="btn btn-primary"
              onClick={() => window.location.href = '/personalized-videos'}
            >
              <span>← Back to Celebrity List</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-video-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <button 
              className="back-btn"
              onClick={() => window.location.href = '/personalized-videos'}
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Celebrities</span>
            </button>
            <h1>Book Your Personalized Video</h1>
            <p>Create an unforgettable moment with a custom video message</p>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Celebrity Showcase */}
        <div className="celebrity-showcase">
          <div className="celebrity-card">
            <div className="celebrity-avatar">
              {celebrity.image ? (
                <img src={celebrity.image} alt={celebrity.name} />
              ) : (
                <div className="avatar-placeholder">
                  <div className="avatar-icon">
                    <svg width="40" height="40" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div className="avatar-initials">{celebrity.name.charAt(0)}</div>
                </div>
              )}
              <div className="verified-badge">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
            </div>
            <div className="celebrity-info">
              <h2>{celebrity.name}</h2>
              <div className="celebrity-meta">
                <span className="category">{celebrity.category}</span>
                <div className="rating">
                  <span className="stars">⭐⭐⭐⭐⭐</span>
                  <span className="rating-text">4.9 (2.1k reviews)</span>
                </div>
              </div>
              <div className="delivery-info">
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>Typically responds within 3-7 days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-container">
          <div className="progress-steps">
            <div className="progress-line"></div>
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > 1 ? (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ) : (
                  <span>1</span>
                )}
              </div>
              <div className="step-label">
                <span className="step-title">Choose Video Type</span>
                <span className="step-desc">Select your occasion</span>
              </div>
            </div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">
                {currentStep > 2 ? (
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                ) : (
                  <span>2</span>
                )}
              </div>
              <div className="step-label">
                <span className="step-title">Video Details</span>
                <span className="step-desc">Personalize your message</span>
              </div>
            </div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
              <div className="step-circle">
                <span>3</span>
              </div>
              <div className="step-label">
                <span className="step-title">Confirm & Pay</span>
                <span className="step-desc">Complete your order</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="booking-content">
          {/* Step 1: Video Type Selection */}
          {currentStep === 1 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Choose Your Video Type</h3>
                <p>Select the perfect occasion for your personalized video message</p>
              </div>
              
              <div className="video-types-grid">
                {Object.entries(videoServices).map(([key, service]) => {
                  const price = getCelebrityVideoPrice(celebrity, key);
                  return (
                    <div 
                      key={key}
                      className={`video-type-card ${formData.videoType === key ? 'selected' : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'videoType', value: key } })}
                    >
                      {service.popular && (
                        <div className="popular-badge">
                          <span>Most Popular</span>
                        </div>
                      )}
                      <div className="service-icon">{service.icon}</div>
                      <h4>{service.name}</h4>
                      <p>{service.description}</p>
                      <div className="price">${price}</div>
                      <div className="select-indicator">
                        <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="urgent-delivery">
                <div className="delivery-option">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="urgentDelivery"
                      checked={formData.urgentDelivery}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    <div className="option-content">
                      <div className="option-title">
                        <span>🚀 Rush Delivery</span>
                        <span className="price-tag">+$50</span>
                      </div>
                      <div className="option-desc">Get your video within 24 hours</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {currentStep === 2 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Video Details</h3>
                <p>Tell us about your video message</p>
              </div>
              
              <div className="selected-service">
                <div className="service-summary">
                  <div className="service-icon">{selectedService.icon}</div>
                  <div className="service-info">
                    <h4>{selectedService.name}</h4>
                    <p>{selectedService.description}</p>
                  </div>
                  <div className="service-price">${basePrice}</div>
                </div>
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Who is this video for? *</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={formData.recipientName}
                    onChange={handleInputChange}
                    placeholder="e.g., Sarah, Mom, John Smith"
                    className={formErrors.recipientName ? 'error' : ''}
                  />
                  {formErrors.recipientName && <span className="error-text">{formErrors.recipientName}</span>}
                </div>
                
                <div className="form-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className={formErrors.senderName ? 'error' : ''}
                  />
                  {formErrors.senderName && <span className="error-text">{formErrors.senderName}</span>}
                </div>
                
                <div className="form-group full-width">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="your@email.com"
                    className={formErrors.email ? 'error' : ''}
                  />
                  {formErrors.email && <span className="error-text">{formErrors.email}</span>}
                </div>
                
                <div className="form-group full-width">
                  <label>Custom Instructions</label>
                  <textarea
                    name="customInstructions"
                    value={formData.customInstructions}
                    onChange={handleInputChange}
                    placeholder="Tell the celebrity what you'd like them to say or mention..."
                    rows={4}
                  />
                  <div className="char-count">{formData.customInstructions.length}/500</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {currentStep === 3 && (
            <div className="step-content">
              <div className="step-header">
                <h3>Confirm Your Order</h3>
                <p>Review your details before proceeding to payment</p>
              </div>
              
              <div className="order-summary">
                <div className="summary-header">
                  <h4>Order Summary</h4>
                </div>
                <div className="summary-content">
                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-label">Celebrity</span>
                      <span className="item-value">{celebrity.name}</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-label">Video Type</span>
                      <span className="item-value">{selectedService.name}</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-label">Recipient</span>
                      <span className="item-value">{formData.recipientName}</span>
                    </div>
                  </div>
                  <div className="summary-item">
                    <div className="item-info">
                      <span className="item-label">Base Price</span>
                      <span className="item-value">${basePrice}</span>
                    </div>
                  </div>
                  {formData.urgentDelivery && (
                    <div className="summary-item">
                      <div className="item-info">
                        <span className="item-label">Rush Delivery</span>
                        <span className="item-value">+$50</span>
                      </div>
                    </div>
                  )}
                  <div className="summary-divider"></div>
                  <div className="summary-total">
                    <div className="item-info">
                      <span className="item-label">Total</span>
                      <span className="item-value">${totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Payment Tutorial Section */}
              <div className="payment-tutorial-section">
                <div className="tutorial-highlight">
                  <div className="tutorial-icon">💳</div>
                  <div className="tutorial-content">
                    <h4>Having Payment Issues?</h4>
                    <p>New to cryptocurrency payments? Watch our comprehensive 3-step video tutorial to learn how to send crypto payments securely!</p>
                <button 
                  className="tutorial-btn"
                  onClick={() => setShowCryptoTutorial(true)}
                >
                  <span className="btn-icon">🚀</span>
                  Watch Crypto Tutorial Series
                </button>
                  </div>
                </div>
              </div>
              
              <div className="terms-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className={formErrors.agreeToTerms ? 'error' : ''}
                  />
                  <span className="checkmark"></span>
                  <span className="terms-text">
                    I agree to the <a href="#" className="terms-link">Terms of Service</a> and <a href="#" className="terms-link">Privacy Policy</a>
                  </span>
                </label>
                {formErrors.agreeToTerms && <span className="error-text">{formErrors.agreeToTerms}</span>}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="step-navigation">
            {currentStep > 1 && (
              <button className="btn btn-secondary" onClick={handleBack}>
                Previous
              </button>
            )}
            
            <div className="step-info">
              Step {currentStep} of 3
            </div>
            
            {currentStep < 3 ? (
              <button className="btn btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary" onClick={handleSubmit}>
                Proceed to Payment (${totalPrice})
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Crypto Tutorial Modal */}
      {showCryptoTutorial && (
        <div className="modal-overlay" onClick={() => setShowCryptoTutorial(false)}>
          <div className="modal-content crypto-tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setShowCryptoTutorial(false)}
            >
              ×
            </button>
            <CryptoTutorial onClose={() => setShowCryptoTutorial(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default BookVideoPage;
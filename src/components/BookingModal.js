import React, { useState, useEffect } from 'react';
import './BookingModal.css';
import { createPayment } from '../services/paymentService';
import CryptoTutorial from './CryptoTutorial';
import BitcoinPayment from './BitcoinPayment'; // ADD THIS IMPORT

const BookingModal = ({ isOpen, onClose, celebrity }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    country: '',
    city: '',
    
    // Session Details
    package: 'basic',
    date: '',
    time: '',
    duration: '',
    location: 'virtual',
    language: 'english',
    
    // Special Requests
    specialRequests: '',
    giftFor: '',
    occasion: '',
    accessibilityNeeds: '',
    
    // Agreement
    agreeToTerms: false,
    agreeToPrivacy: false,
    marketingConsent: false,
    
    paymentMethod: 'btc'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [bookingId, setBookingId] = useState('');
  const [paymentData, setPaymentData] = useState(null); // Add this line

  const packages = {
    basic: {
      name: 'Basic Celebrity Experience',
      price: celebrity?.price || 500,
      duration: '5 minutes',
      features: ['5-minute video call', 'One screenshot', 'Digital autograph']
    },
    premium: {
      name: 'Premium Experience',
      price: (celebrity?.price || 500) + 200,
      duration: '15 minutes',
      features: ['15-minute video call', 'Multiple screenshots', 'Digital autograph', 'Personal message recording']
    },
    vip: {
      name: 'VIP Experience',
      price: (celebrity?.price || 500) + 500,
      duration: '30 minutes',
      features: ['30-minute private session', 'Professional screenshots', 'Signed digital memorabilia', 'Video message', 'Priority support']
    }
  };

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
    'France', 'Spain', 'Italy', 'Netherlands', 'Sweden', 'Norway', 'Denmark',
    'Japan', 'South Korea', 'Singapore', 'India', 'Brazil', 'Mexico', 'Other'
  ];

  const languages = [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese', 
    'Japanese', 'Korean', 'Mandarin', 'Other'
  ];

  const occasions = [
    'Birthday', 'Anniversary', 'Graduation', 'Wedding', 'Holiday Gift', 
    'Get Well Soon', 'Congratulations', 'Just Because', 'Other'
  ];

  // Generate unique booking ID
  const generateBookingId = () => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `BK-${timestamp}-${randomStr}`.toUpperCase();
  };

  // Add the validateForm function
  const validateForm = () => {
    const errors = {};
    
    // Personal Information
    if (!formData.firstName.trim()) errors.firstName = 'First name is required';
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    if (!formData.country) errors.country = 'Country is required';
    
    // Session Details
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    
    // Agreements
    if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to terms and conditions';
    if (!formData.agreeToPrivacy) errors.agreeToPrivacy = 'You must agree to privacy policy';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add the copyToClipboard function
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Booking ID copied to clipboard! 📋\n\nSave this ID for your records.');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Booking ID copied to clipboard! 📋\n\nSave this ID for your records.');
    });
  };

  // Load saved form data on mount
  useEffect(() => {
    if (isOpen && celebrity) {
      const savedData = localStorage.getItem(`booking-draft-${celebrity.id}`);
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      }
      setBookingId(generateBookingId());
    }
  }, [isOpen, celebrity]);

  // Save form data to localStorage on changes
  useEffect(() => {
    if (celebrity && Object.values(formData).some(val => val !== '' && val !== false)) {
      localStorage.setItem(`booking-draft-${celebrity.id}`, JSON.stringify(formData));
    }
  }, [formData, celebrity]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const errors = {};
    
    if (step === 1) {
      if (!formData.firstName.trim()) errors.firstName = 'First name is required';
      if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
      if (!formData.email.trim()) errors.email = 'Email is required';
      if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
      if (!formData.phone.trim()) errors.phone = 'Phone number is required';
      if (!formData.country) errors.country = 'Country is required';
    }
    
    if (step === 2) {
      if (!formData.date) errors.date = 'Date is required';
      if (!formData.time) errors.time = 'Time is required';
    }
    
    if (step === 4) {
      if (!formData.agreeToTerms) errors.agreeToTerms = 'You must agree to terms and conditions';
      if (!formData.agreeToPrivacy) errors.agreeToPrivacy = 'You must agree to privacy policy';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5)); // Changed from 4 to 5
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    const basePrice = packages[formData.package].price;
    return basePrice;
  };
  
  // ADD THIS FUNCTION
  const handleBitcoinPayment = () => {
    if (!validateForm()) {
      return;
    }
    
    // Generate booking data for Bitcoin payment
    const bookingId = 'BK' + Date.now();
    const bookingData = {
      id: bookingId,
      celebrity: celebrity,
      formData: formData,
      total: calculateTotal(),
      status: 'pending_bitcoin_payment',
      createdAt: new Date().toISOString(),
      paymentMethod: 'bitcoin',
      paymentStatus: 'pending'
    };
    
    // Save booking to localStorage
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    // Clear the draft
    localStorage.removeItem(`booking-draft-${celebrity.id}`);
    
    setBookingId(bookingId);
    setShowBitcoinPayment(true);
  };
  
  // ADD THIS FUNCTION
  const handleConfirmBooking = () => {
    if (!validateStep(4)) {
      return;
    }
    setIsConfirmed(true);
  };
  
  const handleCancelTransaction = () => {
    if (window.confirm('Are you sure you want to cancel this transaction? Your booking will be cancelled.')) {
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const updatedBookings = existingBookings.filter(booking => booking.id !== bookingId);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      setCurrentStep(1);
      setPaymentData(null);
      onClose();
    }
  };

  const handleGoBackToPayment = () => {
    if (paymentData && paymentData.payment_url) {
      const paymentWindow = window.open(paymentData.payment_url, '_blank', 'noopener,noreferrer');
      if (!paymentWindow) {
        alert('Please allow popups for this site to open the payment page.');
      }
    } else {
      alert('Payment URL not available. Please try refreshing and booking again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const bookingData = {
        bookingId,
        celebrityName: celebrity.name,
        totalAmount: calculateTotal(),
        email: formData.email,
        selectedCrypto: formData.paymentMethod || 'btc',
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          country: formData.country
        },
        sessionDetails: {
          package: formData.package,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          language: formData.language
        },
        specialRequests: formData.specialRequests
      };
      
      // Create payment
      const payment = await createPayment(bookingData);
      setPaymentData(payment);
      
      // Save booking to localStorage
      const fullBookingData = {
        id: bookingId,
        type: 'celebrity_experience',
        celebrity: celebrity,
        formData: formData,
        total: calculateTotal(),
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
        paymentId: payment.payment_id,
        paymentUrl: payment.payment_url
      };
      
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingBookings.push(fullBookingData);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      
      // Clear the draft
      localStorage.removeItem(`booking-draft-${celebrity.id}`);
      
      // Redirect to payment
      if (payment.payment_url) {
        window.open(payment.payment_url, '_blank');
      } else {
        throw new Error('Payment URL not received');
      }
      
    } catch (error) {
      console.error('Booking submission failed:', error);
      alert('Booking failed. Please try again.');
    }
  };

  // Existing useEffect for modal viewport
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      
      setTimeout(() => {
        const modalElement = document.querySelector('.modal-overlay');
        if (modalElement) {
          modalElement.focus();
        }
      }, 100);
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="modal-overlay" 
      onClick={onClose}
      tabIndex={-1}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999
      }}
    >
      <div className="modal-content enhanced-booking" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Book {celebrity?.name}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
    
        <div className="progress-bar" data-step={currentStep}>
          <div className={`step ${
            currentStep === 1 ? 'active' : 
            currentStep > 1 ? 'completed' : ''
          }`}>
            <span>{currentStep > 1 ? '' : '1'}</span>
            <label>Personal Info</label>
          </div>
          <div className={`step ${
            currentStep === 2 ? 'active' : 
            currentStep > 2 ? 'completed' : ''
          }`}>
            <span>{currentStep > 2 ? '' : '2'}</span>
            <label>Session Details</label>
          </div>
          <div className={`step ${
            currentStep === 3 ? 'active' : 
            currentStep > 3 ? 'completed' : ''
          }`}>
            <span>{currentStep > 3 ? '' : '3'}</span>
            <label>Special Requests</label>
          </div>
          <div className={`step ${
            currentStep === 4 ? 'active' : 
            currentStep > 4 ? 'completed' : ''
          }`}>
            <span>{currentStep > 4 ? '' : '4'}</span>
            <label>Confirmation</label>
          </div>
          <div className={`step ${
            currentStep === 5 ? 'active' : ''
          }`}>
            <span>5</span>
            <label>Payment</label>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="step-content">
              <h3>Personal Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={formErrors.firstName ? 'error' : ''}
                  />
                  {formErrors.firstName && <span className="error-text">{formErrors.firstName}</span>}
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={formErrors.lastName ? 'error' : ''}
                  />
                  {formErrors.lastName && <span className="error-text">{formErrors.lastName}</span>}
                </div>
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={formErrors.phone ? 'error' : ''}
                  />
                  {formErrors.phone && <span className="error-text">{formErrors.phone}</span>}
                </div>
                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={formErrors.country ? 'error' : ''}
                  >
                    <option value="">Select Country</option>
                    {countries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                  {formErrors.country && <span className="error-text">{formErrors.country}</span>}
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Session Details */}
          {currentStep === 2 && (
            <div className="step-content">
              <h3>Session Details</h3>
              
              <div className="form-group">
                <label>Package *</label>
                <div className="package-options">
                  {Object.entries(packages).map(([key, pkg]) => (
                    <div 
                      key={key} 
                      className={`package-option ${formData.package === key ? 'selected' : ''}`}
                      onClick={() => handleInputChange({ target: { name: 'package', value: key } })}
                    >
                      <div className="package-header">
                        <h4>{pkg.name}</h4>
                        <span className="price">${pkg.price}</span>
                      </div>
                      <div className="package-duration">{pkg.duration}</div>
                      <ul className="package-features">
                        {pkg.features.map((feature, index) => (
                          <li key={index}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={formErrors.date ? 'error' : ''}
                  />
                  {formErrors.date && <span className="error-text">{formErrors.date}</span>}
                </div>
                <div className="form-group">
                  <label>Preferred Time *</label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                    className={formErrors.time ? 'error' : ''}
                  />
                  {formErrors.time && <span className="error-text">{formErrors.time}</span>}
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  >
                    <option value="virtual">Virtual (Zoom)</option>
                    <option value="in-person">In-Person (if available)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select
                    name="language"
                    value={formData.language}
                    onChange={handleInputChange}
                  >
                    {languages.map(lang => (
                      <option key={lang.toLowerCase()} value={lang.toLowerCase()}>{lang}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Special Requests */}
          {currentStep === 3 && (
            <div className="step-content">
              <h3>Special Requests & Details</h3>
              
              <div className="form-group">
                <label>Special Requests or Messages</label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleInputChange}
                  placeholder="Any special requests, topics you'd like to discuss, or messages you'd like to share..."
                  rows={4}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Is this a gift for someone?</label>
                  <input
                    type="text"
                    name="giftFor"
                    value={formData.giftFor}
                    onChange={handleInputChange}
                    placeholder="Leave blank if for yourself"
                  />
                </div>
                <div className="form-group">
                  <label>Occasion</label>
                  <select
                    name="occasion"
                    value={formData.occasion}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Occasion</option>
                    {occasions.map(occasion => (
                      <option key={occasion} value={occasion}>{occasion}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label>Accessibility Needs</label>
                <textarea
                  name="accessibilityNeeds"
                  value={formData.accessibilityNeeds}
                  onChange={handleInputChange}
                  placeholder="Please let us know if you have any accessibility requirements..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Step 4: Confirmation & Payment */}
      
          
          {currentStep === 4 && (
            <div className="step-content">
              <h3>Confirm Your Booking</h3>
              
              {!isConfirmed && (
                <div className="review-notice">
                  <p>📋 Please review your booking details below and confirm when ready.</p>
                </div>
              )}
              
              {isConfirmed && (
                <div className="confirmed-notice">
                  <p>✅ Booking details confirmed! Ready to proceed to secure payment.</p>
                </div>
              )}
              
              <div className={`booking-summary ${isConfirmed ? 'confirmed' : ''}`}>
                <div className="summary-section">
                  <h4>Session Details</h4>
                  <div className="summary-item">
                    <span>Celebrity:</span>
                    <span>{celebrity?.name}</span>
                  </div>
                  <div className="summary-item">
                    <span>Package:</span>
                    <span>{packages[formData.package].name}</span>
                  </div>
                  <div className="summary-item">
                    <span>Date & Time:</span>
                    <span>{formData.date} at {formData.time}</span>
                  </div>
                  <div className="summary-item">
                    <span>Duration:</span>
                    <span>{packages[formData.package].duration}</span>
                  </div>
                  <div className="summary-item">
                    <span>Location:</span>
                    <span>{formData.location === 'virtual' ? 'Virtual (Zoom)' : 'In-Person'}</span>
                  </div>
                </div>
                
                <div className="summary-section">
                  <h4>Contact Information</h4>
                  <div className="summary-item">
                    <span>Name:</span>
                    <span>{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="summary-item">
                    <span>Email:</span>
                    <span>{formData.email}</span>
                  </div>
                  <div className="summary-item">
                    <span>Phone:</span>
                    <span>{formData.phone}</span>
                  </div>
                </div>
                
                <div className="summary-section total-section">
                  <div className="summary-item total">
                    <span>Total Amount:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>
              
              <div className="agreements">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className={formErrors.agreeToTerms ? 'error' : ''}
                    />
                    <span>I agree to the Terms and Conditions *</span>
                  </label>
                  {formErrors.agreeToTerms && <span className="error-text">{formErrors.agreeToTerms}</span>}
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="agreeToPrivacy"
                      checked={formData.agreeToPrivacy}
                      onChange={handleInputChange}
                      className={formErrors.agreeToPrivacy ? 'error' : ''}
                    />
                    <span>I agree to the Privacy Policy *</span>
                  </label>
                  {formErrors.agreeToPrivacy && <span className="error-text">{formErrors.agreeToPrivacy}</span>}
                </div>
                
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="marketingConsent"
                      checked={formData.marketingConsent}
                      onChange={handleInputChange}
                    />
                    <span>I would like to receive updates and promotional offers</span>
                  </label>
                </div>
              </div>
              
              <div className="payment-info">
                <h5>Payment Options:</h5>
                
                {/* Show Bitcoin payment option when confirmed */}
                {isConfirmed && (
                  <div className="bitcoin-payment-section">
                    <div className="bitcoin-payment-card">
                      <div className="bitcoin-card-header">
                        <span className="bitcoin-icon">₿</span>
                        <h6>Alternative: Direct Bitcoin Payment</h6>
                      </div>
                      <div className="bitcoin-card-body">
                        <p>Send Bitcoin directly to our wallet address</p>
                        <ul>
                          <li>Manual Bitcoin transfer</li>
                          <li>Lower transaction fees</li>
                          <li>24-48 hour manual verification</li>
                        </ul>
                      </div>
                      <button 
                        type="button" 
                        className="btn-bitcoin-alt"
                        onClick={handleBitcoinPayment}
                      >
                        ₿ Pay with Bitcoin
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Crypto Tutorial Section */}
                <div className="payment-tutorial-section">
                  <div className="tutorial-highlight">
                    <span className="tutorial-icon">🚀</span>
                    <div className="tutorial-content">
                      <h6>New to Crypto Payments?</h6>
                      <p>Watch our 3-step video series to learn how to send cryptocurrency payments securely</p>
                    </div>
                    <button 
                      type="button"
                      className="btn-tutorial"
                      onClick={() => setShowCryptoTutorial(true)}
                    >
                      🎥 Watch Crypto Tutorial
                    </button>
                  </div>
                </div>
                
                {!isConfirmed ? (
                  <>
                    <h5>Next Steps:</h5>
                    <p>After confirming your booking, you can proceed with secure crypto payment or choose direct Bitcoin transfer.</p>
                    <p><strong>New to Crypto?</strong> Watch our step-by-step tutorial above to learn how to make cryptocurrency payments safely.</p>
                  </>
                ) : (
                  <>
                    <h5>Ready to Complete Payment:</h5>
                    <p>Use the "Proceed to Payment" button below for secure crypto payment, or choose the Bitcoin option above for direct transfer.</p>
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Step 5: Payment Redirect */}
          {currentStep === 5 && (
            <div className="step-content payment-redirect-step">
              <div className="payment-icon">💳</div>
              <h3>Opening Payment in New Tab...</h3>
              
              <div className="booking-id-highlight">
                <h4>Your Booking ID</h4>
                <div className="booking-id-display">
                  <span className="booking-id-text">{bookingId}</span>
                  <button 
                    onClick={() => copyToClipboard(bookingId)}
                    className="copy-id-btn"
                    title="Copy to clipboard"
                  >
                    📋 Copy
                  </button>
                </div>
                <p className="booking-id-note">
                  <strong>Important:</strong> Save this Booking ID! You'll need it to track your booking.
                </p>
              </div>
              
              <div className="payment-instructions">
                <h4>Payment Instructions:</h4>
                <ol>
                  <li>A new tab will open with our secure payment processor</li>
                  <li>Complete your cryptocurrency payment in the new tab</li>
                  <li>Keep this tab open to return after payment</li>
                  <li>Check your email for booking confirmation</li>
                </ol>
                
                <div className="payment-status">
                  <p>⏳ <strong>Status:</strong> Awaiting Payment</p>
                  <p>🔒 <strong>Security:</strong> Powered by NOWPayments</p>
                  <p>💰 <strong>Amount:</strong> ${calculateTotal()}</p>
                </div>
              </div>
              
              <div className="payment-actions">
                <button 
                  onClick={() => copyToClipboard(bookingId)}
                  className="btn-secondary"
                >
                  📋 Copy Booking ID
                </button>
                <button 
                  onClick={handleGoBackToPayment}
                  className="btn-primary"
                >
                  🔗 Open Payment (Manual)
                </button>
                <button 
                  onClick={handleCancelTransaction}
                  className="btn-danger"
                >
                  ❌ Cancel Transaction
                </button>
              </div>
            </div>
          )}


          
          <div className="modal-footer">
            {currentStep > 1 && currentStep < 5 && (
              <button type="button" className="btn-secondary" onClick={handlePrevious}>
                Previous
              </button>
            )}
            {currentStep < 4 ? (
              <button type="button" className="btn-primary" onClick={handleNext}>
                Next Step
              </button>
            ) : currentStep === 4 ? (
              <div className="confirmation-buttons">
                {!isConfirmed ? (
                  <button type="button" className="btn-primary" onClick={handleConfirmBooking}>
                    ✓ Confirm Details
                  </button>
                ) : (
                  <>
                    <button type="button" className="btn-secondary" onClick={() => setIsConfirmed(false)}>
                      ← Edit Details
                    </button>
                    <button type="submit" className="btn-primary payment-btn">
                      💳 Proceed to Payment
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
          
          {/* Bitcoin Payment Modal */}
          {showBitcoinPayment && (
            <div className="modal-overlay bitcoin-modal" style={{zIndex: 1000000}}>
              <div className="modal-content bitcoin-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Bitcoin Payment</h2>
                  <button className="close-btn" onClick={() => setShowBitcoinPayment(false)}>&times;</button>
                </div>
                <BitcoinPayment
                  amount={calculateTotal()}
                  onPaymentComplete={() => {
                    setShowBitcoinPayment(false);
                    alert('Payment confirmation received! We will verify your Bitcoin transaction and send you a confirmation email within 24-48 hours.');
                    onClose();
                  }}
                  onCancel={() => setShowBitcoinPayment(false)}
                />
              </div>
            </div>
          )}
          
          {/* Crypto Tutorial Modal */}
          {showCryptoTutorial && (
            <div className="modal-overlay crypto-tutorial-modal" style={{zIndex: 1000000}}>
              <div className="modal-content crypto-tutorial-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>Crypto Payment Tutorial</h2>
                  <button className="close-btn" onClick={() => setShowCryptoTutorial(false)}>&times;</button>
                </div>
                <CryptoTutorial onClose={() => setShowCryptoTutorial(false)} />
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
  
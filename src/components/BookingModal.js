import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './BookingModal.css';
import CryptoTutorial from './CryptoTutorial';
import BitcoinPayment from './BitcoinPayment';

const BookingModal = ({ isOpen, onClose, celebrity }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bitcoinPaymentStep, setBitcoinPaymentStep] = useState(1); // 1: details, 2: payment, 3: confirmation

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
      // Check authentication before proceeding to payment step (step 4)
      if (currentStep === 3 && !currentUser) {
        alert('Please sign in to continue with your booking.');
        navigate('/login');
        return;
      }
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
  
  // Modified Bitcoin payment function for multi-step flow
  const handleBitcoinPayment = () => {
    // Check authentication before proceeding with payment
    if (!currentUser) {
      alert('Please sign in to complete your payment.');
      navigate('/login');
      return;
    }
    
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
    setCurrentStep(5); // Move to Bitcoin payment step
    setBitcoinPaymentStep(1);
  };
  
  // Handle Bitcoin payment completion
  const handleBitcoinPaymentComplete = async () => {
    setBitcoinPaymentStep(3);
    
    try {
      // Update booking status to pending (awaiting admin approval)
      const bookingData = {
        bookingId: bookingId,
        userId: currentUser?.uid || 'guest',
        userEmail: currentUser?.email || formData.email,
        type: 'celebrity_experience',
        service: `${celebrity.name} - ${packages[formData.package]?.name || 'Meet & Greet'}`,
        celebrity: {
          id: celebrity.id,
          name: celebrity.name,
          image: celebrity.image,
          price: celebrity.price
        },
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          country: formData.country,
          city: formData.city
        },
        sessionDetails: {
          package: formData.package,
          packageName: packages[formData.package]?.name || 'Standard Package',
          date: formData.date,
          time: formData.time,
          location: formData.location,
          language: formData.language
        },
        specialRequests: {
          requests: formData.specialRequests,
          giftFor: formData.giftFor,
          occasion: formData.occasion,
          accessibilityNeeds: formData.accessibilityNeeds
        },
        pricing: {
          basePrice: packages[formData.package]?.price || celebrity.price,
          total: calculateTotal()
        },
        status: 'pending', // Pending admin approval
        paymentMethod: 'bitcoin',
        paymentStatus: 'pending', // Keep as pending for admin panel visibility
        agreements: {
          termsAccepted: formData.agreeToTerms,
          privacyAccepted: formData.agreeToPrivacy,
          marketingConsent: formData.marketingConsent
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage for immediate display in dashboard
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const existingIndex = existingBookings.findIndex(b => b.bookingId === bookingId);
      
      if (existingIndex >= 0) {
        existingBookings[existingIndex] = { ...existingBookings[existingIndex], ...bookingData };
      } else {
        existingBookings.push(bookingData);
      }
      
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      
      // Update Firebase record with payment completion
      try {
        if (bookingData.id) {
          const bookingRef = doc(db, 'bookings', bookingData.id);
          await updateDoc(bookingRef, {
            paymentStatus: 'pending', // Keep as pending for admin visibility
            paymentMethod: 'bitcoin',
            updatedAt: serverTimestamp()
          });
          console.log('Firebase booking updated with payment completion');
        }
      } catch (firebaseError) {
        console.error('Error updating Firebase booking:', firebaseError);
      }
      
      // Show notification
      const notification = {
        id: Date.now(),
        type: 'payment_reminder',
        title: 'Payment Submitted Successfully!',
        message: 'Your Bitcoin payment has been submitted. Check your User Management section to track approval status.',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifications.unshift(notification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));
      
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Booking saved locally but there was an issue with cloud sync. Your booking is still valid.');
    }
    
    // Auto-redirect after 3 seconds
    setTimeout(() => {
      onClose();
      navigate('/dashboard');
    }, 3000);
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

    // Check if user is authenticated
    if (!currentUser) {
      alert('Please sign in to complete your booking.');
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save booking to Firebase Firestore
      const fullBookingData = {
        bookingId: bookingId,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        type: 'celebrity_experience',
        celebrity: {
          id: celebrity.id,
          name: celebrity.name,
          image: celebrity.image,
          price: celebrity.price
        },
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          country: formData.country,
          city: formData.city
        },
        sessionDetails: {
          package: formData.package,
          packageName: packages[formData.package].name,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          language: formData.language
        },
        specialRequests: {
          requests: formData.specialRequests,
          giftFor: formData.giftFor,
          occasion: formData.occasion,
          accessibilityNeeds: formData.accessibilityNeeds
        },
        pricing: {
          basePrice: packages[formData.package].price,
          total: calculateTotal()
        },
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: formData.paymentMethod,
        agreements: {
          termsAccepted: formData.agreeToTerms,
          privacyAccepted: formData.agreeToPrivacy,
          marketingConsent: formData.marketingConsent
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Add booking to Firestore
      const docRef = await addDoc(collection(db, 'bookings'), fullBookingData);
      
      // Also save to localStorage as backup
      const localBookingData = {
        ...fullBookingData,
        id: docRef.id,
        createdAt: new Date().toISOString()
      };
      
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      existingBookings.push(localBookingData);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      
      // Clear the draft
      localStorage.removeItem(`booking-draft-${celebrity.id}`);
      
      // Show success message
      alert(`Booking confirmed! Your booking ID is: ${bookingId}\n\nYou can view and manage your booking in your dashboard.\n\nPlease use the payment tutorial or Bitcoin payment options above to complete your payment.`);
      
      // Navigate to dashboard
      onClose();
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Booking submission failed:', error);
      alert('Booking failed. Please try again. If the problem persists, please contact support.');
    } finally {
      setIsSubmitting(false);
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
        
        {/* Authentication Notice */}
        {!currentUser && (
          <div className="auth-notice">
            <div className="auth-notice-content">
              <span className="auth-icon">👤</span>
              <div className="auth-text">
                <h4>Sign in for a better experience</h4>
                <p>Create an account or sign in to track your bookings and get personalized recommendations.</p>
              </div>
              <button 
                type="button" 
                className="btn-auth-notice"
                onClick={() => navigate('/login')}
              >
                Sign In
              </button>
            </div>
          </div>
        )}
    
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
              
              <div className="review-notice">
                <p>📋 Please review your booking details below. Use the payment options at the bottom to complete your booking.</p>
              </div>
              
              <div className="booking-summary">
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
                
                {/* Crypto Tutorial Section - First Priority */}
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
                
                {/* Bitcoin Payment Section - Always Available */}
                <div className="bitcoin-payment-section">
                  <div className="bitcoin-payment-card">
                    <div className="bitcoin-card-header">
                      <span className="bitcoin-icon">₿</span>
                      <h6>Bitcoin Payment</h6>
                    </div>
                    <div className="bitcoin-card-body">
                      <p>Get Bitcoin wallet address and send payment directly</p>
                      <ul>
                        <li>Direct Bitcoin transfer</li>
                        <li>Lower transaction fees</li>
                        <li>24-48 hour manual verification</li>
                      </ul>
                    </div>
                    <button 
                      type="button" 
                      className="btn-bitcoin-alt"
                      onClick={handleBitcoinPayment}
                    >
                      ₿ Get Bitcoin Address
                    </button>
                  </div>
                </div>
                
                <h5>Payment Instructions:</h5>
                <p>Watch the crypto tutorial above to learn how to make Bitcoin payments, then use the Bitcoin payment option to get the wallet address and complete your payment.</p>
                <p><strong>Simple Process:</strong> Tutorial → Copy Bitcoin Address → Send Payment</p>
              </div>
            </div>
          )}
          
          {/* Step 5: Bitcoin Payment Flow */}
          {currentStep === 5 && (
            <div className="step-content bitcoin-payment-flow">
              {bitcoinPaymentStep === 1 && (
                <div className="bitcoin-step booking-details">
                  <div className="step-header">
                    <h3>📋 Booking Details</h3>
                    <p>Review your booking before payment</p>
                  </div>
                  
                  <div className="booking-summary-card">
                    <div className="celebrity-info">
                      <img src={celebrity.image} alt={celebrity.name} className="celebrity-avatar" />
                      <div>
                        <h4>{celebrity.name}</h4>
                        <p>{packages[formData.package].name}</p>
                      </div>
                    </div>
                    
                    <div className="booking-details-grid">
                      <div className="detail-item">
                        <span className="label">Package:</span>
                        <span className="value">{packages[formData.package].name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Duration:</span>
                        <span className="value">{packages[formData.package].duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Date & Time:</span>
                        <span className="value">{formData.date} at {formData.time}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Total Amount:</span>
                        <span className="value total-amount">${calculateTotal()}</span>
                      </div>
                    </div>
                    
                    <div className="booking-id-section">
                      <h5>Your Booking ID</h5>
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
                    </div>
                  </div>
                  
                  <div className="step-actions">
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      onClick={() => setCurrentStep(4)}
                    >
                      ← Back to Review
                    </button>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      onClick={() => setBitcoinPaymentStep(2)}
                    >
                      Continue to Payment →
                    </button>
                  </div>
                </div>
              )}
              
              {bitcoinPaymentStep === 2 && (
                <div className="bitcoin-step payment-instructions">
                  <div className="step-header">
                    <h3>₿ Bitcoin Payment</h3>
                    <p>Send Bitcoin to complete your booking</p>
                  </div>
                  
                  <BitcoinPayment
                    amount={calculateTotal()}
                    onPaymentComplete={handleBitcoinPaymentComplete}
                    onCancel={() => setBitcoinPaymentStep(1)}
                    bookingId={bookingId}
                  />
                </div>
              )}
              
              {bitcoinPaymentStep === 3 && (
                <div className="bitcoin-step payment-confirmation">
                  <div className="confirmation-content">
                    <div className="success-icon">✅</div>
                    <h3>Payment Submitted Successfully!</h3>
                    <p>Your Bitcoin payment has been received and is being processed.</p>
                    
                    <div className="next-steps">
                      <h4>What happens next?</h4>
                      <ul>
                        <li>We'll verify your Bitcoin transaction (usually within 24-48 hours)</li>
                        <li>You'll receive an email confirmation once verified</li>
                        <li>Check your User Management section to track booking status</li>
                        <li>You'll be redirected to your dashboard in a few seconds</li>
                      </ul>
                    </div>
                    
                    <div className="booking-reference">
                      <h5>Booking Reference: {bookingId}</h5>
                    </div>
                    
                    <div className="notification-alert">
                      <div className="alert-icon">🔔</div>
                      <div className="alert-content">
                        <h6>Reminder Set!</h6>
                        <p>We've added a reminder to check your booking status within the next hour.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
            ) : null}
          </div>
          
          {/* Crypto Tutorial Modal */}
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
        </form>
      </div>
    </div>
  );
};

export default BookingModal;
  
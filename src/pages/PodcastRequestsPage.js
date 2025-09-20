import React, { useState, useEffect, useRef } from 'react';
import './PodcastRequestsPage.css';
import { createPayment } from '../services/paymentService';
import BitcoinPayment from '../components/BitcoinPayment';
import CryptoTutorial from '../components/CryptoTutorial';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const PodcastRequestsPage = () => {
  const navigate = useNavigate();
  const [celebrities, setCelebrities] = useState([]);
  const [filteredCelebrities, setFilteredCelebrities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);
  const [isBookingProcessed, setIsBookingProcessed] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [clickedButtonRef, setClickedButtonRef] = useState(null);
  const paymentModalRef = useRef(null);
  const [originalScrollPosition, setOriginalScrollPosition] = useState(0);
  const [formData, setFormData] = useState({
    podcastName: '',
    hostName: '',
    email: '',
    phone: '',
    podcastType: 'interview',
    duration: '30',
    preferredDate: '',
    preferredTime: '',
    format: 'video',
    audience: '',
    topic: '',
    questions: '',
    specialRequests: '',
    agreeToTerms: false
  });
  
  // Prevent scroll when showing Bitcoin payment
  useEffect(() => {
    if (showBitcoinPayment) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    }
  }, [showBitcoinPayment]);

  const podcastTypes = {
    interview: {
      name: 'Interview',
      description: 'One-on-one conversation with the celebrity',
      basePrice: 500,
      icon: '🎤'
    },
    panel: {
      name: 'Panel Discussion',
      description: 'Celebrity joins a panel with other guests',
      basePrice: 750,
      icon: '👥'
    },
    qa: {
      name: 'Live Q&A',
      description: 'Interactive session with audience questions',
      basePrice: 600,
      icon: '❓'
    },
    storytelling: {
      name: 'Storytelling',
      description: 'Celebrity shares personal stories and experiences',
      basePrice: 650,
      icon: '📖'
    }
  };

  const categories = ['all', 'Music', 'Movies', 'TV', 'Sports', 'Comedy', 'Social Media'];

  useEffect(() => {
    const savedCelebrities = localStorage.getItem('celebrities');
    if (savedCelebrities) {
      const celebrityList = JSON.parse(savedCelebrities);
      setCelebrities(celebrityList);
      setFilteredCelebrities(celebrityList);
    }
  }, []);

  useEffect(() => {
    let filtered = celebrities;
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(celebrity => celebrity.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(celebrity => 
        celebrity.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredCelebrities(filtered);
  }, [celebrities, selectedCategory, searchTerm]);

  const getPodcastPrice = (celebrity, podcastType) => {
    const basePrice = podcastTypes[podcastType].basePrice;
    const categoryMultiplier = {
      'Music': 2.5,
      'Movies': 3,
      'TV': 2.2,
      'Sports': 2.8,
      'Comedy': 2,
      'Social Media': 1.8
    };
    return Math.round(basePrice * (categoryMultiplier[celebrity.category] || 2));
  };

  const handleBooking = (celebrity, event) => {
    setClickedButtonRef(event.target);
    setOriginalScrollPosition(window.pageYOffset);
    setSelectedCelebrity(celebrity);
    setShowBookingForm(true);
    // Reset booking processed flag for new booking
    setIsBookingProcessed(false);
    // Generate a consistent booking ID for this booking session
    setCurrentBookingId(`PC-${Date.now()}`);
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Scroll to modal after it renders
    setTimeout(() => {
      if (paymentModalRef.current) {
        const modalElement = paymentModalRef.current.querySelector('.modal-content');
        if (modalElement) {
          modalElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }, 100);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions');
      return;
    }

    setShowBookingForm(false);
    setShowPaymentModal(true);
  };

  // ADD THIS MISSING FUNCTION BACK:
  const handlePayment = async (paymentFormData) => {
    try {
      const bookingId = currentBookingId || `PC-${Date.now()}`;
      const totalAmount = getPodcastPrice(selectedCelebrity, formData.podcastType);
      
      const paymentRequestData = {
        bookingId,
        totalAmount,
        celebrityName: selectedCelebrity.name,
        selectedCrypto: 'btc',
        email: paymentFormData.email
      };
      
      const response = await createPayment(paymentRequestData);
      
      if (response && response.payment_url) {
        // DO NOT save booking data until payment is confirmed
        // Only open payment URL
        window.open(response.payment_url, '_blank');
        handleCloseModal();
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
      // Ensure scroll is restored even on error
      document.body.style.overflow = 'unset';
    }
  };

  const handleBitcoinPayment = (paymentData) => {
    // Only show Bitcoin payment modal - DO NOT create booking data until payment is confirmed
    setShowBitcoinPayment(true);
    setShowPaymentModal(false);
  };

  const handleBitcoinPaymentComplete = async () => {
    // Prevent duplicate processing
    if (isBookingProcessed) {
      // Booking already processed, skipping duplicate call
      return;
    }
    
    setIsBookingProcessed(true);
    
    try {
      const bookingId = currentBookingId || `PC-${Date.now()}`;
      const totalAmount = getPodcastPrice(selectedCelebrity, formData.podcastType);
      
      // Create booking data object
      const bookingData = {
        id: bookingId,
        bookingId: bookingId,
        userId: auth.currentUser?.uid || null,
        type: 'podcast_booking',
        celebrity: {
          id: selectedCelebrity.id,
          name: selectedCelebrity.name,
          category: selectedCelebrity.category
        },
        podcastDetails: {
          podcastName: formData.podcastName,
          hostName: formData.hostName,
          podcastType: formData.podcastType,
          duration: formData.duration,
          format: formData.format,
          audience: formData.audience,
          topic: formData.topic,
          questions: formData.questions,
          specialRequests: formData.specialRequests
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone
        },
        // Add customerInfo for admin panel compatibility
        customerInfo: {
          firstName: formData.hostName?.split(' ')[0] || 'Unknown',
          lastName: formData.hostName?.split(' ').slice(1).join(' ') || 'Host',
          email: formData.email,
          phone: formData.phone
        },
        // Add personalInfo as fallback
        personalInfo: {
          firstName: formData.hostName?.split(' ')[0] || 'Unknown',
          lastName: formData.hostName?.split(' ').slice(1).join(' ') || 'Host',
          email: formData.email,
          phone: formData.phone
        },
        sessionDetails: {
          preferredDate: formData.preferredDate,
          preferredTime: formData.preferredTime
        },
        pricing: {
          basePrice: podcastTypes[formData.podcastType].basePrice,
          total: totalAmount
        },
        status: 'pending',
        paymentStatus: 'pending_bitcoin_payment',
        paymentMethod: 'bitcoin',
        agreements: {
          termsAccepted: formData.agreeToTerms
        },
        createdAt: new Date().toISOString()
      };
      
      // Check for duplicates before saving to localStorage
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const isDuplicate = existingBookings.some(booking => 
        booking.bookingId === bookingId || 
        (booking.celebrity?.id === selectedCelebrity.id && 
         booking.contactInfo?.email === formData.email &&
         booking.type === 'podcast_booking' &&
         Math.abs(new Date(booking.createdAt).getTime() - new Date().getTime()) < 300000) // Within 5 minutes
      );
      
      if (isDuplicate) {
        // Duplicate podcast booking detected, skipping save
        setShowBitcoinPayment(false);
        document.body.style.overflow = 'unset';
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
        return;
      }
      
      // Save to localStorage
      existingBookings.push(bookingData);
      localStorage.setItem('bookings', JSON.stringify(existingBookings));
      // Podcast booking saved to localStorage
      
      // Save to Firebase for admin panel visibility
      try {
        // Check for existing Firebase entries to prevent duplicates
        const bookingsCollection = collection(db, 'bookings');
        const existingQuery = query(
          bookingsCollection,
          where('bookingId', '==', bookingId)
        );
        const existingSnapshot = await getDocs(existingQuery);
        
        if (existingSnapshot.empty) {
          const docRef = await addDoc(bookingsCollection, {
            ...bookingData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
          // Podcast booking saved to Firebase
        } else {
          // Podcast booking already exists in Firebase, skipping duplicate save
        }
      } catch (firebaseError) {
        console.error('Error saving podcast booking to Firebase:', firebaseError);
        // Don't fail the entire process if Firebase save fails
      }
      
      // Show success notification
      try {
        if (window.showNotification) {
          window.showNotification(
            `🎉 Podcast booking confirmed! Booking ID: ${bookingId}. We'll contact you within 24 hours to finalize details.`,
            'success'
          );
        }
      } catch (notificationError) {
        // Notification system not available
      }
      
      // Podcast booking saved successfully
      
    } catch (error) {
      console.error('Error saving podcast booking:', error);
    } finally {
      setShowBitcoinPayment(false);
      
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Navigate to dashboard with a small delay to ensure data is saved
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  };

  const handleCloseModal = () => {
    setShowBookingForm(false);
    setShowPaymentModal(false);
    setShowBitcoinPayment(false);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    // Scroll back to the clicked button
    setTimeout(() => {
      if (clickedButtonRef) {
        clickedButtonRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      } else if (originalScrollPosition > 0) {
        window.scrollTo({
          top: originalScrollPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  };

  return (
    <div className="podcast-requests-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Podcast Requests</h1>
          <p>Invite celebrities as guests for interviews, panels, or live Q&A sessions</p>
        </div>
      </section>

      {/* Services Overview */}
      <section className="podcast-services">
        <div className="container">
          <h2>Podcast Services</h2>
          <div className="services-grid">
            {Object.entries(podcastTypes).map(([key, service]) => (
              <div key={key} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className="service-price">From ${service.basePrice}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Celebrity Selection */}
      <section className="celebrity-selection">
        <div className="container">
          <h2>Select Celebrity Guest</h2>
          
          {/* Filters */}
          <div className="filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search celebrities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category}
                  className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === 'all' ? 'All' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Celebrity Grid */}
          <div className="celebrities-grid">
            {filteredCelebrities.map(celebrity => (
              <div key={celebrity.id} className="celebrity-card">
                <div className="celebrity-image">
                  {celebrity.image ? (
                    <img src={celebrity.image} alt={celebrity.name} />
                  ) : (
                    <div className="placeholder-image">
                      <span>{celebrity.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <div className="celebrity-info">
                  <h3>{celebrity.name}</h3>
                  <p className="category">{celebrity.category}</p>
                  <div className="pricing">
                    <span className="price">${getPodcastPrice(celebrity, 'interview')}</span>
                  </div>
                  <button 
                    className="book-btn"
                    onClick={(e) => handleBooking(celebrity, e)}
                  >
                    Request Guest
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking Form Modal */}
      {showBookingForm && (
        <div className="modal-overlay" onClick={handleCloseModal} ref={paymentModalRef}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request {selectedCelebrity?.name}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="booking-form">
              <div className="form-section">
                <h3>Podcast Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Podcast Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.podcastName}
                      onChange={(e) => setFormData({...formData, podcastName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Host Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.hostName}
                      onChange={(e) => setFormData({...formData, hostName: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Session Details</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Type *</label>
                    <select
                      value={formData.podcastType}
                      onChange={(e) => setFormData({...formData, podcastType: e.target.value})}
                    >
                      {Object.entries(podcastTypes).map(([key, type]) => (
                        <option key={key} value={key}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration</label>
                    <select
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    >
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                    </select>
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Format</label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData({...formData, format: e.target.value})}
                    >
                      <option value="video">Video</option>
                      <option value="audio">Audio Only</option>
                      <option value="live">Live Stream</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Audience Size</label>
                    <input
                      type="text"
                      placeholder="e.g., 10K downloads"
                      value={formData.audience}
                      onChange={(e) => setFormData({...formData, audience: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <div className="form-group">
                  <label>Topic/Theme</label>
                  <input
                    type="text"
                    placeholder="What will you discuss?"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  />
                </div>
                
                <div className="form-group">
                  <label>Sample Questions</label>
                  <textarea
                    placeholder="Share questions you'd like to ask..."
                    value={formData.questions}
                    onChange={(e) => setFormData({...formData, questions: e.target.value})}
                  />
                </div>
              </div>

              <div className="pricing-summary">
                <h3>Price: ${getPodcastPrice(selectedCelebrity, formData.podcastType)}</h3>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={(e) => setFormData({...formData, agreeToTerms: e.target.checked})}
                  />
                  I agree to terms and conditions *
                </label>
              </div>

              <button type="submit" className="submit-btn">
                Continue to Payment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Payment - {selectedCelebrity?.name}</h2>
              <button className="close-btn" onClick={handleCloseModal}>&times;</button>
            </div>
            
            <div className="payment-form">
              <div className="payment-summary">
                <h4>${getPodcastPrice(selectedCelebrity, formData.podcastType)}</h4>
                <p>{podcastTypes[formData.podcastType].name} with {selectedCelebrity?.name}</p>
              </div>
              
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const paymentData = {
                  email: formData.get('email'),
                  name: formData.get('name')
                };
                handlePayment(paymentData);
              }}>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" name="email" required defaultValue={formData.email} />
                </div>
                
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" name="name" required defaultValue={formData.hostName} />
                </div>
                
                <div className="payment-methods">
                  <button 
                    type="button" 
                    className="payment-btn tutorial"
                    onClick={() => setShowCryptoTutorial(true)}
                  >
                    🎥 Watch Crypto Tutorial
                  </button>
                  <button 
                    type="button" 
                    className="payment-btn bitcoin"
                    onClick={() => {
                      const formData = new FormData(document.querySelector('.payment-form form'));
                      const paymentData = {
                        email: formData.get('email'),
                        name: formData.get('name')
                      };
                      handleBitcoinPayment(paymentData);
                    }}
                  >
                    ₿ Pay with Bitcoin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bitcoin Payment Modal */}
      {showBitcoinPayment && (
        <div className="modal-overlay">
          <div className="modal-content bitcoin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bitcoin Payment</h2>
              <button className="close-btn" onClick={() => setShowBitcoinPayment(false)}>&times;</button>
            </div>
            <BitcoinPayment
              amount={getPodcastPrice(selectedCelebrity, formData.podcastType)}
              onPaymentComplete={handleBitcoinPaymentComplete}
              onCancel={() => setShowBitcoinPayment(false)}
              bookingId={currentBookingId}
            />
          </div>
        </div>
      )}

      {/* Crypto Tutorial Modal */}
      {showCryptoTutorial && (
        <div className="modal-overlay" onClick={() => setShowCryptoTutorial(false)}>
          <div className="modal-content crypto-tutorial-modal" onClick={(e) => e.stopPropagation()}>
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
  );
};

export default PodcastRequestsPage;
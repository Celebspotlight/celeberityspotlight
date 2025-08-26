import React, { useState, useEffect, useRef } from 'react';
import './PodcastRequestsPage.css';
import { createPayment } from '../services/paymentService';
import BitcoinPayment from '../components/BitcoinPayment';
import CryptoTutorial from '../components/CryptoTutorial';

const PodcastRequestsPage = () => {
  const [celebrities, setCelebrities] = useState([]);
  const [filteredCelebrities, setFilteredCelebrities] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);
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
      const bookingId = 'PODCAST' + Date.now();
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
        const bookingData = {
          id: bookingId,
          type: 'podcast',
          celebrity: selectedCelebrity,
          podcastType: formData.podcastType,
          price: totalAmount,
          formData: { ...formData, ...paymentFormData },
          paymentUrl: response.payment_url,
          status: 'pending_payment',
          createdAt: new Date().toISOString()
        };
        
        const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
        existingBookings.push(bookingData);
        localStorage.setItem('bookings', JSON.stringify(existingBookings));
        
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
    const bookingId = 'PODCAST' + Date.now();
    const bookingData = {
      id: bookingId,
      type: 'podcast_request',
      celebrity: selectedCelebrity,
      formData: formData,
      total: getPodcastPrice(selectedCelebrity, formData.podcastType),
      status: 'pending_bitcoin_payment',
      createdAt: new Date().toISOString(),
      paymentMethod: 'bitcoin'
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    existingBookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(existingBookings));
    
    setShowBitcoinPayment(true);
    setShowPaymentModal(false);
  };

  const handleBitcoinPaymentComplete = () => {
    setShowBitcoinPayment(false);
    
    // Restore body scroll - THIS WAS MISSING!
    document.body.style.overflow = 'unset';
    
    // Scroll back to the clicked button
    setTimeout(() => {
      if (clickedButtonRef) {
        clickedButtonRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
    
    alert('Thank you for your booking! Your Bitcoin payment has been processed.');
  };

  const handleCloseModal = () => {
    setShowBookingForm(false);
    setShowPaymentModal(false);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    
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
      <div className="page-header">
        <div className="container">
          <h1>Podcast Requests</h1>
          <p>Invite celebrities as guests for interviews, panels, or live Q&A sessions</p>
        </div>
      </div>

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
                    <span className="price-label">From:</span>
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
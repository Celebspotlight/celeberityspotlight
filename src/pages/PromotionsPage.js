import React, { useState, useRef } from 'react';
import { createPayment } from '../services/paymentService';
import BitcoinPayment from '../components/BitcoinPayment';
import PaymentModal from '../components/PaymentModal';
import CryptoTutorial from '../components/CryptoTutorial';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { collection, addDoc } from 'firebase/firestore';
import './PromotionsPage.css';

const PromotionsPage = () => {
  const { currentUser } = useAuth();
  const [selectedService, setSelectedService] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);
  const [tutorialVideoType, setTutorialVideoType] = useState(null);
  const [clickedButtonRef, setClickedButtonRef] = useState(null);
  const [tempFormData, setTempFormData] = useState(null);
  const [tempBookingId, setTempBookingId] = useState(null);
  const paymentModalRef = useRef(null);

  const promotionServices = [
    {
      id: 1,
      title: 'Social Media Campaign',
      description: 'Comprehensive social media promotion across all platforms',
      icon: '📱',
      pricing: 'From $5,000',
      duration: '2-4 weeks',
      price: 5000,
      features: [
        'Multi-platform content creation',
        'Influencer collaboration',
        'Hashtag strategy development',
        'Performance analytics'
      ]
    },
    {
      id: 2,
      title: 'Brand Ambassador Program',
      description: 'Long-term celebrity partnership for brand representation',
      icon: '🤝',
      pricing: 'From $15,000',
      duration: '3-6 months',
      price: 15000,
      features: [
        'Exclusive brand partnership',
        'Event appearances',
        'Content creation rights',
        'Media interview coordination'
      ]
    },
    {
      id: 3,
      title: 'Product Launch Campaign',
      description: 'Celebrity-backed product launch and promotion',
      icon: '🚀',
      pricing: 'From $10,000',
      duration: '4-8 weeks',
      price: 10000,
      features: [
        'Launch event coordination',
        'Press release distribution',
        'Social media buzz creation',
        'Influencer network activation'
      ]
    },
    {
      id: 4,
      title: 'Video Testimonial',
      description: 'Professional celebrity endorsement video',
      icon: '🎬',
      pricing: 'From $3,000',
      duration: '1-2 weeks',
      price: 3000,
      features: [
        'Professional video production',
        'Script development',
        'Multiple format delivery',
        'Usage rights included'
      ]
    }
  ];

  const benefits = [
    {
      icon: '🎯',
      title: 'Targeted Reach',
      description: 'Connect with your exact audience through celebrity influence'
    },
    {
      icon: '📈',
      title: 'Proven Results',
      description: 'Track engagement, reach, and conversion metrics'
    },
    {
      icon: '⚡',
      title: 'Rapid Execution',
      description: 'Quick turnaround times for time-sensitive campaigns'
    }
  ];

  const handleServiceSelect = (service, event) => {
    // Store reference to the clicked button
    setClickedButtonRef(event.target);
    
    setSelectedService(service);
    setShowPaymentModal(true);
    
    // Scroll to payment modal after it renders
    setTimeout(() => {
      if (paymentModalRef.current) {
        const modalElement = paymentModalRef.current.querySelector('.payment-modal');
        if (modalElement) {
          modalElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }, 100);
  };

  const handleRegularPayment = async (formData) => {
    try {
      const bookingId = 'PROMO' + Date.now() + Math.random().toString(36).substr(2, 9);
      
      const paymentRequestData = {
        bookingId,
        totalAmount: selectedService.price,
        celebrityName: selectedService.title,
        selectedCrypto: 'btc',
        email: formData.email
      };
      
      const response = await createPayment(paymentRequestData);
      
      if (response && response.invoice_url) {
        // Parse fullName into firstName and lastName for admin panel compatibility
        const nameParts = (formData.fullName || '').trim().split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.slice(1).join(' ') || 'Customer';
        
        const bookingData = {
          id: bookingId,
          type: 'promotion',
          service: selectedService,
          celebrity: { name: selectedService.title }, // Add celebrity name for admin panel
          formData: {
            ...formData,
            firstName,
            lastName
          },
          personalInfo: {
            firstName,
            lastName,
            email: formData.email,
            phone: formData.phone || 'N/A',
            fullName: formData.fullName
          },
          total: selectedService.price,
          paymentUrl: response.invoice_url,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'crypto',
          userId: currentUser?.uid || 'anonymous',
          userEmail: formData.email,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Save to Firebase only
        try {
          const docRef = await addDoc(collection(db, 'bookings'), bookingData);
          // Promotion booking saved to Firebase
        } catch (firebaseError) {
          console.error('Error saving promotion to Firebase:', firebaseError);
          alert('Failed to save promotion booking. Please try again.');
          return;
        }
        
        // Show notification (similar to donation)
        const notification = {
          id: Date.now(),
          type: 'payment_reminder',
          title: 'Promotion Payment Initiated!',
          message: 'Your promotion payment has been initiated. Complete the payment and check your User Management section to track status.',
          timestamp: new Date().toISOString(),
          read: false
        };
        
        const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        existingNotifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(existingNotifications));
        
        window.open(response.invoice_url, '_blank');
        setShowPaymentModal(false);
        
        // Auto-redirect to dashboard after 2 seconds (like donations)
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  const handleBitcoinPayment = (formData) => {
    // Generate booking ID but DO NOT save booking data until payment is confirmed
    const bookingId = 'PROMO' + Date.now() + Math.random().toString(36).substr(2, 9);
    
    // Store form data temporarily for payment completion
    setTempFormData(formData);
    setTempBookingId(bookingId);
    
    setShowBitcoinPayment(true);
    setShowPaymentModal(false);
  };

  const handleBitcoinPaymentComplete = async () => {
    // Now save the booking data after payment confirmation
    if (tempFormData && tempBookingId) {
      // Parse fullName into firstName and lastName for admin panel compatibility
      const nameParts = (tempFormData.fullName || '').trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Customer';
      
      const bookingData = {
        id: tempBookingId,
        type: 'promotion',
        service: selectedService,
        celebrity: { name: selectedService.title }, // Add celebrity name for admin panel
        formData: {
          ...tempFormData,
          firstName,
          lastName
        },
        personalInfo: {
          firstName,
          lastName,
          email: tempFormData.email,
          phone: tempFormData.phone || 'N/A',
          fullName: tempFormData.fullName
        },
        total: selectedService.price,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'bitcoin',
        userId: currentUser?.uid || 'anonymous',
        userEmail: tempFormData.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to Firebase only
      try {
        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
        // Bitcoin promotion booking saved to Firebase
      } catch (firebaseError) {
        console.error('Error saving bitcoin promotion to Firebase:', firebaseError);
        alert('Failed to save promotion booking. Please try again.');
        return;
      }
      
      // Show notification (similar to donation)
      const notification = {
        id: Date.now(),
        type: 'payment_completed',
        title: 'Promotion Payment Completed!',
        message: 'Your promotion payment has been completed successfully. Check your User Management section to track status.',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifications.unshift(notification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));
      
      // Clear temporary data
      setTempFormData(null);
      setTempBookingId(null);
    }
    
    setShowBitcoinPayment(false);
    
    // Auto-redirect to dashboard after 3 seconds (like donation Bitcoin payment)
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    
    // Scroll back to the clicked button
    setTimeout(() => {
      if (clickedButtonRef) {
        clickedButtonRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  const handleFreeConsultation = () => {
    const subject = encodeURIComponent('Free Consultation Request - Celebrity Promotion Services');
    const body = encodeURIComponent(
      'Hello,\n\n' +
      'I am interested in a free consultation for celebrity promotion services.\n\n' +
      'Please contact me to discuss:\n' +
      '- My brand and promotion goals\n' +
      '- Available celebrity partnerships\n' +
      '- Pricing and package options\n' +
      '- Timeline and campaign strategy\n\n' +
      'Thank you for your time.\n\n' +
      'Best regards'
    );
    
    window.open(`mailto:celebrityspotlight2024@gmail.com?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="promotions-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Celebrity Promotion Services</h1>
          <p>Amplify your brand with authentic celebrity endorsements and strategic partnerships</p>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="container">
          <h2>Our Services</h2>
          <div className="services-grid">
            {promotionServices.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-header">
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                </div>
                <div className="service-body">
                  <p className="service-description">{service.description}</p>
                  <div className="service-details">
                    <div className="pricing">{service.pricing}</div>
                    <div className="duration">{service.duration}</div>
                  </div>
                  <ul className="features-list">
                    {service.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                  <button 
                    className="select-service-btn"
                    onClick={(e) => handleServiceSelect(service, e)}
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <h2>Why Choose Our Services</h2>
          <div className="benefits-grid">
            {benefits.map((benefit, index) => (
              <div key={index} className="benefit-card">
                <div className="benefit-icon">{benefit.icon}</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Elevate Your Brand?</h2>
            <p>Contact us today to discuss your celebrity promotion needs</p>
            <button className="cta-button" onClick={handleFreeConsultation}>Get Free Consultation</button>
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div ref={paymentModalRef} className="modal-container">
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handleCloseModal}
            service={selectedService}
            amount={selectedService?.price}
            onRegularPayment={handleRegularPayment}
            onBitcoinPayment={handleBitcoinPayment}
            onShowCryptoTutorial={(videoType) => {
              setTutorialVideoType(videoType);
              setShowCryptoTutorial(true);
            }}
          />
        </div>
      )}

      {/* Bitcoin Payment Modal */}
      {showBitcoinPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <BitcoinPayment
              amount={selectedService?.price}
              onPaymentComplete={handleBitcoinPaymentComplete}
              onCancel={() => setShowBitcoinPayment(false)}
              bookingId={`PR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`}
            />
          </div>
        </div>
      )}

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
            <CryptoTutorial 
              videoType={tutorialVideoType}
              onContinue={() => {
                setShowCryptoTutorial(false);
                setTutorialVideoType(null);
              }}
              onSkip={() => {
                setShowCryptoTutorial(false);
                setTutorialVideoType(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
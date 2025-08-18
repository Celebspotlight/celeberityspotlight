import React, { useState } from 'react';
import './VideoTutorial.css';

const VideoTutorial = ({ onContinue, onSkip }) => {
  const [hasWatched, setHasWatched] = useState(false);
  const [showAlternativePayment, setShowAlternativePayment] = useState(false);

  const handleVideoEnd = () => {
    setHasWatched(true);
  };

  const handleShowAlternative = () => {
    setShowAlternativePayment(true);
  };

  return (
    <div className="video-tutorial-container">
      <div className="tutorial-header">
        <h3>💡 Crypto Payment Tutorial</h3>
        <p>Watch our comprehensive 3-step video series to learn how to send cryptocurrency payments securely.</p>
      </div>

      <div className="video-wrapper">
        <iframe
          width="100%"
          height="315"
          src="https://www.youtube.com/embed/YOUR_CRYPTO_TUTORIAL_VIDEO_ID"
          title="Crypto Payment Tutorial - Step by Step Guide"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onEnded={handleVideoEnd}
        ></iframe>
      </div>

      <div className="tutorial-options">
        <div className="payment-choice">
          <h4>Choose Your Payment Method:</h4>
          
          <div className="payment-option primary-option">
            <div className="option-header">
              <span className="option-icon">🔒</span>
              <h5>Crypto Payment (Recommended)</h5>
            </div>
            <p>Secure, fast, and automated processing through NOWPayments</p>
            <button 
              className="btn-primary"
              onClick={onContinue}
            >
              Continue with Crypto Payment
            </button>
          </div>

          <div className="payment-option alternative-option">
            <div className="option-header">
              <span className="option-icon">💬</span>
              <h5>Alternative Payment Methods</h5>
            </div>
            <p>If you need assistance with crypto payments, contact our support team</p>
            <button 
              className="btn-secondary"
              onClick={handleShowAlternative}
            >
              Contact Support
            </button>
          </div>
        </div>

        {showAlternativePayment && (
          <div className="alternative-payment-info">
            <div className="alert-warning">
              <h5>💬 Need Help with Crypto Payments?</h5>
              <ol>
                <li>Email us at: <strong>support@yoursite.com</strong></li>
                <li>Include your booking reference number</li>
                <li>Describe any payment difficulties you're experiencing</li>
                <li>Our team will assist you within 24 hours</li>
              </ol>
              
              <div className="contact-info">
                <p><strong>Support Options:</strong></p>
                <p>📧 Email: support@yoursite.com</p>
                <p>📞 Phone: (555) 123-4567</p>
                <p>💬 Live Chat: Available 9AM-6PM EST</p>
              </div>
            </div>
            
            <div className="alternative-actions">
              <button 
                className="btn-primary"
                onClick={() => {
                  alert('Please contact our support team for personalized payment assistance.');
                  onSkip();
                }}
              >
                I Understand - Contact Support
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowAlternativePayment(false)}
              >
                Go Back to Crypto Payment
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="tutorial-footer">
        <button 
          className="btn-link"
          onClick={onSkip}
        >
          Skip Tutorial - Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default VideoTutorial;
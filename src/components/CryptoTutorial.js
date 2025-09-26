import React, { useState } from 'react';
import './CryptoTutorial.css';

const CryptoTutorial = ({ onContinue, onSkip, videoType }) => {
  const [selectedTutorial, setSelectedTutorial] = useState(videoType || null);
  const [showAlternativePayment, setShowAlternativePayment] = useState(false);

  const cryptoTutorials = [
    {
      id: 'cashapp',
      title: 'Watch Crypto Tutorial for CashApp',
      description: 'Learn how to buy and send cryptocurrency using CashApp for secure payments.',
      videoUrl: '/casp app.mp4',
      buttonText: 'Watch CashApp Crypto Tutorial',
      icon: '💳'
    },
    {
      id: 'venmo',
      title: 'Watch Crypto Tutorial for Venmo',
      description: 'Discover how to use Venmo for cryptocurrency transactions and payments.',
      videoUrl: '/venmo.mp4',
      buttonText: 'Watch Venmo Crypto Tutorial',
      icon: '📱'
    }
  ];

  const handleTutorialSelect = (tutorialId) => {
    setSelectedTutorial(tutorialId);
  };

  const handleBackToSelection = () => {
    setSelectedTutorial(null);
  };

  const handleShowAlternative = () => {
    setShowAlternativePayment(true);
  };

  const selectedTutorialData = cryptoTutorials.find(tutorial => tutorial.id === selectedTutorial);

  return (
    <div className="crypto-tutorial-container">
      <div className="tutorial-header">
        <h3>🚀 Crypto Payment Tutorial</h3>
        <p>Choose your preferred payment method to learn how to send cryptocurrency payments securely.</p>
      </div>

      {!selectedTutorial && !videoType ? (
        // Direct Tutorial Buttons - No Selection Screen
        <div className="tutorial-direct-buttons">
          {cryptoTutorials.map((tutorial) => (
            <div key={tutorial.id} className="tutorial-direct-option">
              <div className="tutorial-direct-card">
                <div className="tutorial-icon">{tutorial.icon}</div>
                <div className="tutorial-info">
                  <h5>{tutorial.title}</h5>
                  <p>{tutorial.description}</p>
                </div>
                <button 
                  type="button"
                  className="btn-primary tutorial-direct-btn"
                  onClick={() => handleTutorialSelect(tutorial.id)}
                >
                  {tutorial.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Video Player Screen
        <div className="tutorial-video-content">
          <div className="video-header">
            {!videoType && (
              <button 
                type="button"
                className="btn-back"
                onClick={handleBackToSelection}
              >
                ← Back to Tutorials
              </button>
            )}
            <h4>{selectedTutorialData.title}</h4>
          </div>
          
          <p className="video-description">{selectedTutorialData.description}</p>

          <div className="video-wrapper">
            <video
              key={selectedTutorial}
              width="100%"
              height="315"
              controls
            >
              <source src={selectedTutorialData.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Tutorial Options */}
      <div className="tutorial-options">
        <div className="payment-choice">
          <h4>Ready to Proceed?</h4>
          
          <div className="payment-option primary-option">
            <div className="option-header">
              <span className="option-icon">🎓</span>
              <h5>I Understand How to Use Crypto!</h5>
            </div>
            <p>Close this tutorial and proceed to the payment section to complete your booking using cryptocurrency.</p>
            <button 
              type="button"
              className="btn-primary"
              onClick={onSkip}
            >
              Close Tutorial - I Understand
            </button>
          </div>

          <div className="payment-option alternative-option">
            <div className="option-header">
              <span className="option-icon">💬</span>
              <h5>Need Help? Contact Support</h5>
            </div>
            <p>Having trouble? Our support team can assist you</p>
            <button 
              type="button"
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
                <li>Email us at: <strong>celebrityspotlight2024@gmail.com</strong></li>
                <li>Include your booking reference number</li>
                <li>Describe any payment difficulties you're experiencing</li>
                <li>Our team will assist you within 24 hours</li>
              </ol>
              
              <div className="contact-info">
                <p><strong>Support Options:</strong></p>
                <p>📧 Email: celebrityspotlight2024@gmail.com</p>
                <p>💬 Live Chat: Available 9AM-6PM EST</p>
              </div>
              
              <button 
                type="button"
                className="btn-secondary"
                onClick={() => setShowAlternativePayment(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoTutorial;
import React, { useState } from 'react';
import './CryptoTutorial.css';

const CryptoTutorial = ({ onContinue, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showAlternativePayment, setShowAlternativePayment] = useState(false);

  const tutorialSteps = [
    {
      id: 1,
      title: 'Step 1: Setting Up Your Crypto Wallet',
      description: 'Learn how to create and set up a cryptocurrency wallet for secure transactions.',
      videoUrl: '/Step 1.mp4',
      duration: '3:45'
    },
    {
      id: 2,
      title: 'Step 2: Buying Cryptocurrency',
      description: 'Discover how to purchase cryptocurrency using various payment methods.',
      videoUrl: '/Step 2.mp4',
      duration: '4:20'
    },
    {
      id: 3,
      title: 'Step 3: Making Your Payment',
      description: 'Complete your transaction by sending crypto to our payment processor.',
      videoUrl: '/Step 3.mp4',
      duration: '2:55'
    }
  ];

  const handleVideoEnd = (stepId) => {
    if (!completedSteps.includes(stepId)) {
      setCompletedSteps([...completedSteps, stepId]);
    }
  };

  const handleNextStep = () => {
    if (currentStep < tutorialSteps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const allStepsCompleted = completedSteps.length === tutorialSteps.length;
  const currentStepCompleted = completedSteps.includes(currentStep);

  const handleShowAlternative = () => {
    setShowAlternativePayment(true);
  };

  const currentStepData = tutorialSteps[currentStep - 1];

  return (
    <div className="crypto-tutorial-container">
      <div className="tutorial-header">
        <h3>🚀 Crypto Payment Tutorial</h3>
        <p>Follow these 3 simple steps to learn how to send cryptocurrency payments securely.</p>
      </div>

      {/* Progress Indicator */}
      <div className="tutorial-progress">
        {tutorialSteps.map((step, index) => (
          <div 
            key={step.id} 
            className={`progress-step ${
              currentStep === step.id ? 'active' : 
              completedSteps.includes(step.id) ? 'completed' : ''
            }`}
            onClick={() => setCurrentStep(step.id)}
          >
            <div className="step-number">
              {completedSteps.includes(step.id) ? '✓' : step.id}
            </div>
            <div className="step-label">{step.title}</div>
          </div>
        ))}
      </div>

      {/* Current Step Content */}
      <div className="tutorial-step-content">
        <div className="step-header">
          <h4>{currentStepData.title}</h4>
          <span className="step-duration">⏱️ {currentStepData.duration}</span>
        </div>
        
        <p className="step-description">{currentStepData.description}</p>

        <div className="video-wrapper">
          <iframe
            width="100%"
            height="315"
            src={currentStepData.videoUrl}
            title={currentStepData.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onEnded={() => handleVideoEnd(currentStep)}
          ></iframe>
        </div>

        {/* Step Navigation */}
        <div className="step-navigation">
          <button 
            className="btn-secondary"
            onClick={handlePreviousStep}
            disabled={currentStep === 1}
          >
            ← Previous
          </button>
          
          <div className="step-status">
            {currentStepCompleted && (
              <span className="step-completed">✓ Step Completed</span>
            )}
          </div>
          
          <button 
            className="btn-secondary"
            onClick={handleNextStep}
            disabled={currentStep === tutorialSteps.length}
          >
            Next →
          </button>
        </div>
      </div>

      {/* Tutorial Options */}
      <div className="tutorial-options">
        <div className="payment-choice">
          <h4>Ready to Make Your Payment?</h4>
          
          <div className="payment-option primary-option">
            <div className="option-header">
              <span className="option-icon">🔒</span>
              <h5>Crypto Payment (Recommended)</h5>
            </div>
            <p>Secure, fast, and automated processing through NOWPayments</p>
            <button 
              className={`btn-primary ${!allStepsCompleted ? 'disabled' : ''}`}
              onClick={onContinue}
              disabled={!allStepsCompleted}
            >
              {allStepsCompleted ? 'Continue with Crypto Payment' : `Complete All Steps (${completedSteps.length}/3)`}
            </button>
          </div>

          <div className="payment-option alternative-option">
            <div className="option-header">
              <span className="option-icon">📞</span>
              <h5>Need Help? Contact Support</h5>
            </div>
            <p>Having trouble? Our support team can assist you</p>
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
            <div className="alert-info">
              <h5>💬 Contact Our Support Team</h5>
              <p>If you're having trouble with crypto payments, our support team is here to help!</p>
              
              <div className="contact-info">
                <p><strong>📧 Email:</strong> support@yoursite.com</p>
                <p><strong>📞 Phone:</strong> (555) 123-4567</p>
                <p><strong>💬 Live Chat:</strong> Available 9AM-6PM EST</p>
                <p><strong>⏰ Response Time:</strong> Within 2 hours during business hours</p>
              </div>
              
              <div className="support-note">
                <p><em>Please include your booking details when contacting support for faster assistance.</em></p>
              </div>
            </div>
            
            <div className="alternative-actions">
              <button 
                className="btn-primary"
                onClick={() => {
                  alert('Please contact our support team using the information above. We\'ll help you complete your payment.');
                  onSkip();
                }}
              >
                I'll Contact Support
              </button>
              <button 
                className="btn-secondary"
                onClick={() => setShowAlternativePayment(false)}
              >
                Back to Tutorial
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
          Skip Tutorial - I Know How to Use Crypto
        </button>
      </div>
    </div>
  );
};

export default CryptoTutorial;
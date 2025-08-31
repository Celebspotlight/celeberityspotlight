import React, { useState } from 'react';
import './VideoTutorial.css';

const VideoTutorial = ({ onContinue, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [showAlternativePayment, setShowAlternativePayment] = useState(false);

  const tutorialSteps = [
    {
      id: 1,
      title: 'Step 1: Understanding Cryptocurrency',
      description: 'Learn the basics of cryptocurrency and how digital payments work.',
      videoUrl: '/crypto-basics.mp4',
      duration: '3:30'
    },
    {
      id: 2,
      title: 'Step 2: Setting Up Your Wallet',
      description: 'Discover how to create and secure your cryptocurrency wallet.',
      videoUrl: '/wallet-setup.mp4',
      duration: '4:15'
    },
    {
      id: 3,
      title: 'Step 3: Making Secure Payments',
      description: 'Learn how to send cryptocurrency payments safely and securely.',
      videoUrl: '/secure-payments.mp4',
      duration: '3:45'
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
    <div className="video-tutorial-container">
      <div className="tutorial-header">
        <h3>💡 Crypto Payment Tutorial</h3>
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
          <video
            width="100%"
            height="315"
            controls
            onEnded={() => handleVideoEnd(currentStep)}
          >
            <source src={currentStepData.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
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

      {/* Tutorial Options - Only show when all steps completed */}
      <div className="tutorial-options">
        <div className="payment-choice">
          {allStepsCompleted ? (
            <>
              <h4>Tutorial Complete!</h4>
              
              <div className="payment-option primary-option">
                <div className="option-header">
                  <span className="option-icon">🎓</span>
                  <h5>You've Learned About Crypto Payments!</h5>
                </div>
                <p>Now you understand how cryptocurrency payments work. Close this tutorial and manually proceed to the payment section to complete your booking.</p>
                <button 
                  className="btn-primary"
                  onClick={onSkip}
                >
                  Close Tutorial - I Understand
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
            </>
          ) : (
            <div className="tutorial-progress-info">
              <h4>Complete All Steps to Proceed</h4>
              <p>Watch all {tutorialSteps.length} tutorial videos to understand crypto payments before proceeding.</p>
              <div className="progress-summary">
                <span>Progress: {completedSteps.length}/{tutorialSteps.length} steps completed</span>
              </div>
            </div>
          )}
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
                Go Back to Tutorial
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
          Skip Tutorial - I Already Know Crypto
        </button>
      </div>
    </div>
  );
};

export default VideoTutorial;
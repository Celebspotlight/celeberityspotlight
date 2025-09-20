import React, { useState, useEffect } from 'react';
import './PaymentStatusNotification.css';

const PaymentStatusNotification = ({ bookingId, onClose, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState('submitted');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');
  const [confirmations, setConfirmations] = useState(0);
  const [requiredConfirmations] = useState(3);
  const [hasNotified, setHasNotified] = useState(false);

  const statusSteps = [
    {
      key: 'submitted',
      title: 'Payment Submitted',
      description: 'Your Bitcoin payment has been submitted to the network',
      icon: '📤',
      duration: 5 // seconds
    },
    {
      key: 'broadcasting',
      title: 'Broadcasting Transaction',
      description: 'Transaction is being broadcast to the Bitcoin network',
      icon: '📡',
      duration: 15
    },
    {
      key: 'pending',
      title: 'Pending Confirmation',
      description: 'Waiting for network confirmations',
      icon: '⏳',
      duration: 45
    },
    {
      key: 'confirming',
      title: 'Confirming Transaction',
      description: `Receiving confirmations (${confirmations}/${requiredConfirmations})`,
      icon: '🔄',
      duration: 25
    },
    {
      key: 'confirmed',
      title: 'Payment Confirmed',
      description: 'Your booking has been confirmed successfully',
      icon: '✅',
      duration: 0
    }
  ];

  useEffect(() => {
    // Generate a mock transaction hash
    const generateTxHash = () => {
      const chars = '0123456789abcdef';
      let hash = '';
      for (let i = 0; i < 64; i++) {
        hash += chars[Math.floor(Math.random() * chars.length)];
      }
      return hash;
    };

    setTransactionHash(generateTxHash());

    // Track if page is visible using Page Visibility API
    let isPageVisible = !document.hidden;
    let pausedTime = 0;
    let lastVisibleTime = Date.now();
    
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page became hidden - record the time
        lastVisibleTime = Date.now();
        isPageVisible = false;
        console.log('Payment tracker: Page hidden, continuing in background');
      } else {
        // Page became visible - add paused time
        if (!isPageVisible) {
          pausedTime += Date.now() - lastVisibleTime;
          isPageVisible = true;
          console.log('Payment tracker: Page visible again, resuming display');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Start the payment tracking simulation
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        // Calculate actual elapsed time accounting for background time
        const actualElapsed = Math.floor((Date.now() - pausedTime) / 1000) - Math.floor(Date.now() / 1000) + prev + 1;
        const newTime = prev + 1; // Always increment regardless of visibility
        
        // Update status based on time elapsed
        if (newTime <= 5) {
          setCurrentStatus('submitted');
          setProgress((newTime / 5) * 20);
        } else if (newTime <= 20) {
          setCurrentStatus('broadcasting');
          setProgress(20 + ((newTime - 5) / 15) * 20);
        } else if (newTime <= 65) {
          setCurrentStatus('pending');
          setProgress(40 + ((newTime - 20) / 45) * 30);
        } else if (newTime <= 90) {
          setCurrentStatus('confirming');
          setProgress(70 + ((newTime - 65) / 25) * 25);
          
          // Simulate confirmations
          const confirmationProgress = Math.floor((newTime - 65) / 8);
          setConfirmations(Math.min(confirmationProgress, requiredConfirmations));
        } else {
          setCurrentStatus('confirmed');
          setProgress(100);
          setConfirmations(requiredConfirmations);
          
          // Notify parent component only once when first confirmed
          if (newTime === 91 && onStatusUpdate && !hasNotified) {
            setHasNotified(true);
            clearInterval(interval); // Stop the interval immediately to prevent further calls
            
            // Play notification sound with a more reliable audio source
            try {
              // Create a simple beep sound using Web Audio API
              const audioContext = new (window.AudioContext || window.webkitAudioContext)();
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
              oscillator.type = 'sine';
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.5);
              
              console.log('Notification sound played successfully');
            } catch (e) {
              console.log('Audio notification failed:', e);
              // Fallback: try with a simple audio element
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
                audio.volume = 0.3;
                audio.play().catch(e => console.log('Fallback audio failed:', e));
              } catch (fallbackError) {
                console.log('All audio methods failed:', fallbackError);
              }
            }
            
            // Defer the status update callback to avoid setState during render
            setTimeout(() => {
              onStatusUpdate('confirmed');
            }, 0);
          }
          
          // Auto close after 5 seconds of confirmation
          if (newTime > 95) {
            clearInterval(interval);
            setTimeout(() => {
              document.body.style.overflow = 'unset';
              onClose && onClose();
            }, 2000);
          }
        }
        
        return newTime;
      });
    }, 1000);

    // Cleanup function to restore body scrolling when component unmounts
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.body.style.overflow = 'unset';
    };
  }, [onStatusUpdate, onClose, requiredConfirmations]);

  const getCurrentStep = () => {
    return statusSteps.find(step => step.key === currentStatus) || statusSteps[0];
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (currentStatus) {
      case 'confirmed': return '#27ae60';
      case 'confirming': return '#f39c12';
      default: return '#3498db';
    }
  };

  return (
    <div className="payment-status-overlay">
      <div className="payment-status-modal">
        <div className="payment-status-header">
          <h3>Payment Status Tracker</h3>
          <button className="close-status-btn" onClick={() => {
            document.body.style.overflow = 'unset';
            onClose();
          }}>×</button>
        </div>
        
        <div className="payment-status-content">
          <div className="status-main">
            <div className="status-icon" style={{ color: getStatusColor() }}>
              {getCurrentStep().icon}
            </div>
            <h4>{getCurrentStep().title}</h4>
            <p>{getCurrentStep().description}</p>
          </div>
          
          <div className="progress-section">
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: getStatusColor()
                }}
              ></div>
            </div>
            <div className="progress-text">
              <span>{Math.round(progress)}% Complete</span>
              <span>Time: {formatTime(timeElapsed)}</span>
            </div>
          </div>
          
          <div className="transaction-details">
            <div className="detail-row">
              <span className="detail-label">Booking ID:</span>
              <span className="detail-value">{bookingId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Transaction Hash:</span>
              <span className="detail-value tx-hash">
                {transactionHash.substring(0, 8)}...{transactionHash.substring(56)}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Network:</span>
              <span className="detail-value">Bitcoin Mainnet</span>
            </div>
            {currentStatus === 'confirming' || currentStatus === 'confirmed' ? (
              <div className="detail-row">
                <span className="detail-label">Confirmations:</span>
                <span className="detail-value">
                  {confirmations}/{requiredConfirmations}
                  {confirmations < requiredConfirmations && (
                    <span className="confirmation-dots">...</span>
                  )}
                </span>
              </div>
            ) : null}
          </div>
          
          <div className="status-timeline">
            {statusSteps.map((step, index) => {
              const isActive = step.key === currentStatus;
              const isCompleted = statusSteps.findIndex(s => s.key === currentStatus) > index;
              
              return (
                <div 
                  key={step.key} 
                  className={`timeline-step ${
                    isActive ? 'active' : isCompleted ? 'completed' : 'pending'
                  }`}
                >
                  <div className="timeline-icon">
                    {isCompleted ? '✓' : step.icon}
                  </div>
                  <div className="timeline-content">
                    <h5>{step.title}</h5>
                    <p>{step.key === 'confirming' ? 
                      `Receiving confirmations (${confirmations}/${requiredConfirmations})` : 
                      step.description
                    }</p>
                  </div>
                </div>
              );
            })}
          </div>
          
          {currentStatus === 'confirmed' && (
            <div className="success-actions">
              <button className="primary-btn" onClick={() => window.location.href = '/dashboard'}>
                View Dashboard
              </button>
              <button className="secondary-btn" onClick={() => {
                document.body.style.overflow = 'unset';
                onClose();
              }}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusNotification;
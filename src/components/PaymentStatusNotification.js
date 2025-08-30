import React, { useState, useEffect } from 'react';
import './PaymentStatusNotification.css';

const PaymentStatusNotification = ({ bookingId, onClose, onStatusUpdate }) => {
  const [currentStatus, setCurrentStatus] = useState('submitted');
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [transactionHash, setTransactionHash] = useState('');
  const [confirmations, setConfirmations] = useState(0);
  const [requiredConfirmations] = useState(3);

  const statusSteps = [
    {
      key: 'submitted',
      title: 'Payment Submitted',
      description: 'Your Bitcoin payment has been submitted to the network',
      icon: '📤',
      duration: 10 // seconds
    },
    {
      key: 'broadcasting',
      title: 'Broadcasting Transaction',
      description: 'Transaction is being broadcast to the Bitcoin network',
      icon: '📡',
      duration: 30
    },
    {
      key: 'pending',
      title: 'Pending Confirmation',
      description: 'Waiting for network confirmations',
      icon: '⏳',
      duration: 120
    },
    {
      key: 'confirming',
      title: 'Confirming Transaction',
      description: `Receiving confirmations (${confirmations}/${requiredConfirmations})`,
      icon: '🔄',
      duration: 60
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

    // Start the payment tracking simulation
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        
        // Update status based on time elapsed
        if (newTime <= 10) {
          setCurrentStatus('submitted');
          setProgress((newTime / 10) * 20);
        } else if (newTime <= 40) {
          setCurrentStatus('broadcasting');
          setProgress(20 + ((newTime - 10) / 30) * 20);
        } else if (newTime <= 160) {
          setCurrentStatus('pending');
          setProgress(40 + ((newTime - 40) / 120) * 30);
        } else if (newTime <= 220) {
          setCurrentStatus('confirming');
          setProgress(70 + ((newTime - 160) / 60) * 25);
          
          // Simulate confirmations
          const confirmationProgress = Math.floor((newTime - 160) / 20);
          setConfirmations(Math.min(confirmationProgress, requiredConfirmations));
        } else {
          setCurrentStatus('confirmed');
          setProgress(100);
          setConfirmations(requiredConfirmations);
          
          // Notify parent component
          if (onStatusUpdate) {
            onStatusUpdate('confirmed');
          }
          
          // Auto close after 5 seconds of confirmation
          if (newTime > 225) {
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
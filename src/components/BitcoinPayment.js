import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import './BitcoinPayment.css';
import PaymentStatusNotification from './PaymentStatusNotification';

const BitcoinPayment = ({ amount, onPaymentComplete, onCancel, bookingId }) => {
  const [copied, setCopied] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [showStatusTracker, setShowStatusTracker] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const btcAddress = "bc1qnrzq2runqy4hk6t837h0q9f0tnx50lxwp2jelg";
  
  const copyAddress = () => {
    navigator.clipboard.writeText(btcAddress).then(() => {
      setCopied(true);
      setAddressCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = btcAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setAddressCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };
  
  const handlePaymentConfirmation = () => {
    if (!addressCopied) {
      // Show modern notification instead of alert
      const notificationData = {
        type: 'warning',
        title: 'Address Required',
        message: 'Please copy the Bitcoin address first before confirming payment.'
      };
      localStorage.setItem('pendingNotification', JSON.stringify(notificationData));
      window.dispatchEvent(new CustomEvent('showNotification', { detail: notificationData }));
      return;
    }
    
    setPaymentConfirmed(true);
    setIsProcessing(true);
    setProcessingProgress(0);
    
    // Simulate processing with progress animation for 7 seconds
    const processingDuration = 7000; // 7 seconds
    const intervalTime = 100; // Update every 100ms
    const totalSteps = processingDuration / intervalTime;
    let currentStep = 0;
    
    const progressInterval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / totalSteps) * 100;
      setProcessingProgress(progress);
      
      if (currentStep >= totalSteps) {
        clearInterval(progressInterval);
        setIsProcessing(false);
        setShowStatusTracker(true);
      }
    }, intervalTime);
  };
  
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  
  const handleStatusUpdate = (status) => {
    if (status === 'confirmed' && !paymentCompleted) {
      // Payment is fully confirmed, proceed with booking completion
      setPaymentCompleted(true);
      onPaymentComplete && onPaymentComplete();
    }
  };
  
  const handleCloseStatusTracker = () => {
    setShowStatusTracker(false);
    // Don't call onPaymentComplete - it should only be called through handleStatusUpdate
    // This prevents duplicate completion calls
  };
  
  return (
    <>
    <div className="bitcoin-payment">
      <div className="payment-header">
        <h3>🪙 Payment Method</h3>
        <p>Send Bitcoin to complete your booking</p>
      </div>
      
      <div className="payment-details">
        <div className="amount-section">
          <label>Amount to Send:</label>
          <div className="amount-display">
            <span className="amount">${amount} USD</span>
            <small>Convert to BTC using current exchange rate</small>
          </div>
        </div>
        
        <div className="address-section">
          <label>Bitcoin Address:</label>
          <div className="address-container">
            <div className="address-display">
              <code>{btcAddress}</code>
            </div>
            <button 
              className={`copy-btn ${copied ? 'copied' : ''}`}
              onClick={copyAddress}
              type="button"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>
        
        <div className="instructions">
          <h4>📋 Payment Instructions:</h4>
          <ol>
            <li>Copy the Bitcoin address above</li>
            <li>Open your preferred crypto wallet or exchange (Coinbase, Binance, etc.)</li>
            <li>Send the equivalent BTC amount to our address</li>
            <li>Watch our comprehensive crypto tutorial series if you need step-by-step guidance</li>
            <li>Click "I've Sent Payment" below once completed</li>
          </ol>
        </div>
        
        <div className="warning">
          <p>⚠️ <strong>Important:</strong> Only send Bitcoin (BTC) to this address. Sending other cryptocurrencies may result in permanent loss.</p>
        </div>
      </div>
      
      <div className="payment-actions">
        <button 
          className="btn-secondary"
          onClick={onCancel}
          type="button"
        >
          Cancel
        </button>
        <button 
          className={`btn-primary ${paymentConfirmed ? 'confirmed' : ''} ${!addressCopied ? 'disabled' : ''}`}
          onClick={handlePaymentConfirmation}
          disabled={paymentConfirmed || !addressCopied}
          type="button"
          title={!addressCopied ? 'Please copy the Bitcoin address first' : ''}
        >
          {paymentConfirmed ? '✓ Payment Confirmed' : !addressCopied ? '📋 Copy Address First' : '💰 I\'ve Sent Payment'}
        </button>
      </div>
    </div>
    
    {isProcessing && (
      <div className="payment-processing-overlay">
        <div className="processing-modal">
          <div className="processing-content">
            <div className="processing-spinner">
              <div className="spinner-ring"></div>
              <div className="spinner-center">
                <span className="bitcoin-icon">₿</span>
              </div>
            </div>
            <h3>Processing Payment...</h3>
            <p>Verifying your Bitcoin transaction on the blockchain</p>
            <div className="processing-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <span className="progress-text">{Math.round(processingProgress)}%</span>
            </div>
            <div className="processing-steps">
              <div className={`step ${processingProgress > 20 ? 'completed' : processingProgress > 0 ? 'active' : ''}`}>
                <span className="step-icon">📡</span>
                <span>Broadcasting transaction</span>
              </div>
              <div className={`step ${processingProgress > 60 ? 'completed' : processingProgress > 40 ? 'active' : ''}`}>
                <span className="step-icon">🔍</span>
                <span>Scanning blockchain</span>
              </div>
              <div className={`step ${processingProgress > 90 ? 'completed' : processingProgress > 80 ? 'active' : ''}`}>
                <span className="step-icon">✅</span>
                <span>Confirming payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
    
    {showStatusTracker && createPortal(
      <PaymentStatusNotification
        bookingId={bookingId || 'BK-' + Date.now()}
        onClose={handleCloseStatusTracker}
        onStatusUpdate={handleStatusUpdate}
      />,
      document.body
    )}
    </>
  );
};

export default BitcoinPayment;
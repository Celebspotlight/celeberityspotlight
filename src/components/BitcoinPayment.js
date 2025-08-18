import React, { useState } from 'react';
import './BitcoinPayment.css';

const BitcoinPayment = ({ amount, onPaymentComplete, onCancel }) => {
  const [copied, setCopied] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  
  const btcAddress = "bc1qnrzq2runqy4hk6t837h0q9f0tnx50lxwp2jelg";
  
  const copyAddress = () => {
    navigator.clipboard.writeText(btcAddress).then(() => {
      setCopied(true);
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
      setTimeout(() => setCopied(false), 3000);
    });
  };
  
  const handlePaymentConfirmation = () => {
    setPaymentConfirmed(true);
    // You can add additional logic here to verify payment
    setTimeout(() => {
      onPaymentComplete && onPaymentComplete();
    }, 1000);
  };
  
  return (
    <div className="bitcoin-payment">
      <div className="payment-header">
        <h3>🪙 Alternative Payment Method</h3>
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
          className={`btn-primary ${paymentConfirmed ? 'confirmed' : ''}`}
          onClick={handlePaymentConfirmation}
          disabled={paymentConfirmed}
          type="button"
        >
          {paymentConfirmed ? '✓ Payment Confirmed' : '💰 I\'ve Sent Payment'}
        </button>
      </div>
    </div>
  );
};

export default BitcoinPayment;
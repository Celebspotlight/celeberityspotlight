import React, { useState } from 'react';

const CookieConsent = ({ onAccept, onDecline }) => {
  const [showConsent, setShowConsent] = useState(
    !localStorage.getItem('cookieConsent')
  );

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowConsent(false);
    onAccept();
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowConsent(false);
    onDecline();
  };

  if (!showConsent) return null;

  return (
    <div className="cookie-consent">
      <p>We use cookies to analyze website traffic and optimize your experience.</p>
      <div className="consent-buttons">
        <button onClick={handleAccept}>Accept</button>
        <button onClick={handleDecline}>Decline</button>
      </div>
    </div>
  );
};

export default CookieConsent;
import React, { useState, useEffect } from 'react';
import './NotificationToast.css';
import ultimateNotificationManager from '../utils/UltimateNotificationManager';

const NotificationToast = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to the Ultimate NotificationManager
    const unsubscribe = ultimateNotificationManager.subscribe((notification) => {
      setNotifications(prev => [...prev, notification]);
      
      // Auto-remove notification after 5 seconds
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    });

    // Legacy support for showNotification events (with ultimate deduplication)
    const handleShowNotification = async (event) => {
      const notification = event.detail;
      if (notification) {
        await window.showUltimateNotification(notification);
      }
    };

    window.addEventListener('showNotification', handleShowNotification);

    return () => {
      unsubscribe();
      window.removeEventListener('showNotification', handleShowNotification);
    };
  }, []);

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div 
          key={notification.id} 
          className={`notification-toast ${notification.type}`}
        >
          <div className="notification-content">
            <div className="notification-header">
              <span className="notification-icon">
                {notification.type === 'success' ? '✅' : 
                 notification.type === 'error' ? '❌' : 
                 notification.type === 'warning' ? '⚠️' : 'ℹ️'}
              </span>
              <h4 className="notification-title">{notification.title}</h4>
              <button 
                className="notification-close"
                onClick={() => removeNotification(notification.id)}
              >
                ×
              </button>
            </div>
            <p className="notification-message">{notification.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;
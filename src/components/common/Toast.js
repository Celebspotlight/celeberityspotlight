import React, { useState, useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'error', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto hide after duration
    const hideTimer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onClose && onClose();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose && onClose();
    }, 300);
  };

  if (!isVisible && !isExiting) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'info':
        return (
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default: // error
        return (
          <svg className="toast-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getFriendlyMessage = (message) => {
    // Convert Firebase errors to user-friendly messages
    if (message.includes('auth/invalid-credential')) {
      return 'Invalid email or password. Please check your credentials and try again.';
    }
    if (message.includes('auth/user-not-found')) {
      return 'No account found with this email address.';
    }
    if (message.includes('auth/wrong-password')) {
      return 'Incorrect password. Please try again.';
    }
    if (message.includes('auth/email-already-in-use')) {
      return 'An account with this email already exists.';
    }
    if (message.includes('auth/weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (message.includes('auth/invalid-email')) {
      return 'Please enter a valid email address.';
    }
    if (message.includes('auth/operation-not-allowed')) {
      return 'This sign-in method is not enabled. Please contact support.';
    }
    if (message.includes('auth/too-many-requests')) {
      return 'Too many failed attempts. Please try again later.';
    }
    if (message.includes('auth/network-request-failed')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Remove "Firebase: Error" prefix if present
    return message.replace(/^Firebase: Error \([^)]+\)\.?\s*/, '').trim() || 'An unexpected error occurred. Please try again.';
  };

  return (
    <div className={`toast toast-${type} ${isVisible ? 'toast-show' : ''} ${isExiting ? 'toast-exit' : ''}`}>
      <div className="toast-content">
        <div className="toast-icon-wrapper">
          {getIcon()}
        </div>
        <div className="toast-message">
          {getFriendlyMessage(message)}
        </div>
        <button className="toast-close" onClick={handleClose} aria-label="Close notification">
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Toast;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { resetPassword } = useAuth();
  const toast = useToast();

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.showError('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.showError('Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    const result = await resetPassword(email);
    
    if (result.success) {
      setIsSuccess(true);
      toast.showSuccess('Password reset email sent! Check your inbox for instructions.');
    } else {
      toast.showError(result.error || 'Failed to send reset email. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter your email address and we'll send you a link to reset your password</p>
        </div>



        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner"></span>
                  Sending Reset Email...
                </>
              ) : (
                'Send Reset Email'
              )}
            </button>

            <div className="auth-actions">
              <Link to="/login" className="back-to-signin-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back to Sign In
              </Link>
            </div>
          </form>
        ) : (
          <div className="success-container">
            <div className="success-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
            </div>
            <h3 className="success-title">Check Your Email</h3>
            <p className="success-message">
              If an account with <strong>{email}</strong> exists, you'll receive a password reset link shortly.
            </p>
            <div className="success-actions">
              <Link to="/login" className="primary-action-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 19-7-7 7-7"/>
                  <path d="M19 12H5"/>
                </svg>
                Back to Sign In
              </Link>
              <button 
                onClick={() => {
                  setIsSuccess(false);
                  setEmail('');
                }} 
                className="secondary-action-btn"
              >
                Try Different Email
              </button>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="auth-link">
              Sign in here
            </Link>
          </p>
          <p>
            Don't have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
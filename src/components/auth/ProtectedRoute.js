import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="auth-loading-container">
        <div className="auth-loading-card">
          <div className="auth-loading-spinner"></div>
          <h3 className="auth-loading-title">Authenticating</h3>
          <p className="auth-loading-text">Please wait while we verify your credentials...</p>
        </div>
        <style>
          {`
          .auth-loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            position: relative;
          }
          .auth-loading-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: 
              radial-gradient(circle at 25% 25%, rgba(37, 99, 235, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, rgba(37, 99, 235, 0.03) 0%, transparent 50%);
            pointer-events: none;
          }
          .auth-loading-card {
            background: white;
            padding: 3rem 2rem;
            border-radius: 16px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            position: relative;
            z-index: 10;
            border: 1px solid #e2e8f0;
            max-width: 400px;
            width: 100%;
            margin: 0 1rem;
          }
          .auth-loading-spinner {
            width: 48px;
            height: 48px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #2563eb;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
          }
          .auth-loading-title {
            color: #0f172a;
            fontSize: 1.25rem;
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            letter-spacing: -0.025em;
          }
          .auth-loading-text {
            color: #64748b;
            fontSize: 0.875rem;
            margin: 0;
            line-height: 1.5;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          `}
        </style>
      </div>
    );
  }

  // If route requires authentication and user is not logged in
  if (requireAuth && !currentUser) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If route requires no authentication (like login/signup) and user is logged in
  if (!requireAuth && currentUser) {
    // Redirect to dashboard or intended page
    const from = location.state?.from?.pathname || '/dashboard';
    return <Navigate to={from} replace />;
  }

  // Render the protected component
  return children;
};

export default ProtectedRoute;
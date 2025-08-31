import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);

  // Add body class management for menu state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    // Prevent body scroll when menu is open
    if (!isMenuOpen) {
      document.body.classList.add('menu-open');
      setIsServicesOpen(false);
      setIsUserMenuOpen(false);
    } else {
      document.body.classList.remove('menu-open');
    }
  };

  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
    setIsUserMenuOpen(false);
    document.body.classList.remove('menu-open');
  }, [location.pathname]);



  const isActive = (path) => {
    return location.pathname === path;
  };

  const isServicesActive = () => {
    return location.pathname === '/personalized-videos' || 
           location.pathname === '/acting-classes' || 
           location.pathname === '/promotions' ||
           location.pathname === '/donations' ||
           location.pathname === '/podcast-requests';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsServicesOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          Celebrity<span>Spotlight</span>
        </Link>
        
        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/celebrities" 
            className={`nav-link ${isActive('/celebrities') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Celebrities
          </Link>
          
          {/* Simple Services Dropdown */}
          <div className="nav-dropdown" ref={dropdownRef}>
            <button 
              className={`nav-link dropdown-toggle ${isServicesActive() ? 'active' : ''}`}
              onClick={() => setIsServicesOpen(!isServicesOpen)}
            >
              Services
              <svg 
                className={`dropdown-chevron ${isServicesOpen ? 'open' : ''}`} 
                width="12" 
                height="12" 
                viewBox="0 0 16 16" 
                fill="currentColor"
              >
                <path d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708z"/>
              </svg>
            </button>
            
            <div className={`dropdown-content ${isServicesOpen ? 'show' : ''}`}>
              <Link 
                to="/personalized-videos" 
                className="dropdown-link"
                onClick={() => {
                  setIsServicesOpen(false);
                  setIsMenuOpen(false);
                }}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 7l-7 5 7 5V7z"/>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <div className="dropdown-text">
                  <div className="dropdown-title">Personalized Videos</div>
                  <div className="dropdown-description">Custom celebrity messages</div>
                </div>
              </Link>
              
              <Link 
                to="/acting-classes" 
                className="dropdown-link"
                onClick={() => {
                  setIsServicesOpen(false);
                  setIsMenuOpen(false);
                }}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75,15.02 15.5,11.75 9.75,8.48"/>
                </svg>
                <div className="dropdown-text">
                  <div className="dropdown-title">Acting Classes</div>
                  <div className="dropdown-description">Learn from professionals</div>
                </div>
              </Link>
              
              <Link 
                to="/promotions" 
                className="dropdown-link"
                onClick={() => {
                  setIsServicesOpen(false);
                  setIsMenuOpen(false);
                }}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                  <path d="M2 17l10 5 10-5"/>
                  <path d="M2 12l10 5 10-5"/>
                </svg>
                <div className="dropdown-text">
                  <div className="dropdown-title">Promotions</div>
                  <div className="dropdown-description">Celebrity endorsements</div>
                </div>
              </Link>

              <Link 
                to="/donations" 
                className="dropdown-link"
                onClick={() => {
                  setIsServicesOpen(false);
                  setIsMenuOpen(false);
                }}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <div className="dropdown-text">
                  <div className="dropdown-title">Donations</div>
                  <div className="dropdown-description">Support causes</div>
                </div>
              </Link>

              {/* ADD THIS MISSING PODCAST LINK */}
              <Link 
                to="/podcast-requests" 
                className="dropdown-link"
                onClick={() => {
                  setIsServicesOpen(false);
                  setIsMenuOpen(false);
                }}
              >
                <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <path d="M12 19v4"/>
                  <path d="M8 23h8"/>
                </svg>
                <div className="dropdown-text">
                  <div className="dropdown-title">Podcast Requests</div>
                  <div className="dropdown-description">Celebrity podcast guests</div>
                </div>
              </Link>
            </div>
          </div>
          
          <Link 
            to="/about" 
            className={`nav-link ${isActive('/about') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className={`nav-link ${isActive('/contact') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Contact
          </Link>
          
          {/* Authentication or User Menu */}
          {currentUser ? (
            <div className="profile-menu" ref={userMenuRef}>
              <button 
                className="profile-toggle"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                data-username={currentUser.displayName || currentUser.email?.split('@')[0] || 'User'}
              >
                <div className="profile-icon user-initial">
                  {(currentUser.displayName || currentUser.email || 'U').charAt(0).toUpperCase()}
                </div>
              </button>
              
              {isUserMenuOpen && (
                <div className="profile-dropdown show">
                  <div className="profile-header">
                    <h4>Manage your profile and bookings</h4>
                  </div>
                  <Link to="/dashboard" className="profile-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <path d="M21 15l-5-5L5 21"></path>
                    </svg>
                    Dashboard
                  </Link>
                  <Link to="/celebrities" className="profile-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    Book Now
                  </Link>
                  <button onClick={handleLogout} className="profile-item sign-out">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"></path>
                      <polyline points="16,17 21,12 16,7"></polyline>
                      <path d="M21 12H9"></path>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-menu">
              <div className="auth-logo-container">
                <button 
                  className="auth-logo-toggle"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-label="Authentication Menu"
                >
                  <svg width="48" height="48" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="logoGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#667eea"/>
                        <stop offset="50%" stopColor="#764ba2"/>
                        <stop offset="100%" stopColor="#f093fb"/>
                      </linearGradient>
                      <linearGradient id="logoGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4facfe"/>
                        <stop offset="100%" stopColor="#00f2fe"/>
                      </linearGradient>
                      <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Main circle background */}
                    <circle cx="100" cy="100" r="90" fill="url(#logoGrad1)" filter="url(#logoGlow)" opacity="0.9"/>
                    
                    {/* User icon */}
                    <circle cx="100" cy="75" r="25" fill="white" opacity="0.9"/>
                    <path d="M65 140 C65 120, 80 105, 100 105 C120 105, 135 120, 135 140 L135 155 L65 155 Z" fill="white" opacity="0.9"/>
                    
                    {/* Decorative elements */}
                    <circle cx="140" cy="60" r="8" fill="url(#logoGrad2)" opacity="0.8"/>
                    <circle cx="60" cy="140" r="6" fill="url(#logoGrad2)" opacity="0.7"/>
                    <circle cx="150" cy="150" r="4" fill="white" opacity="0.6"/>
                    
                    {/* Authentication indicator */}
                    <circle cx="160" cy="40" r="12" fill="#10b981" stroke="white" strokeWidth="2"/>
                    <path d="M155 40 L158 43 L165 36" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  
                  <div className="auth-logo-text">
                    <span className="auth-logo-title">Account</span>
                    <span className="auth-logo-subtitle">Sign In / Sign Up</span>
                  </div>
                  
                  <svg className="auth-dropdown-arrow" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6,9 12,15 18,9"></polyline>
                  </svg>
                </button>
                
                {isUserMenuOpen && (
                  <div className="auth-dropdown show">
                    <div className="auth-dropdown-header">
                      <h4>Welcome to Celebrity Spotlight</h4>
                      <p>Sign in to access exclusive features</p>
                    </div>
                    
                    <div className="auth-dropdown-content">
                      <Link to="/login" className="auth-dropdown-item primary" onClick={() => setIsUserMenuOpen(false)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                          <polyline points="10,17 15,12 10,7"/>
                          <line x1="15" y1="12" x2="3" y2="12"/>
                        </svg>
                        <div className="auth-item-content">
                          <span className="auth-item-title">Sign In</span>
                          <span className="auth-item-desc">Access your account</span>
                        </div>
                      </Link>
                      
                      <Link to="/signup" className="auth-dropdown-item secondary" onClick={() => setIsUserMenuOpen(false)}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="8.5" cy="7" r="4"/>
                          <line x1="20" y1="8" x2="20" y2="14"/>
                          <line x1="23" y1="11" x2="17" y2="11"/>
                        </svg>
                        <div className="auth-item-content">
                          <span className="auth-item-title">Sign Up</span>
                          <span className="auth-item-desc">Create new account</span>
                        </div>
                      </Link>
                      

                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
        
        <div className="header-controls">
          <ThemeToggle />
          <button 
            className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;


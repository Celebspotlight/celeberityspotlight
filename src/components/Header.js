import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Add body class management for menu state
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    
    // Prevent body scroll when menu is open
    if (!isMenuOpen) {
      document.body.classList.add('menu-open');
      setIsServicesOpen(false);
    } else {
      document.body.classList.remove('menu-open');
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
    document.body.classList.remove('menu-open');
  }, [location.pathname]);

  const toggleServices = () => {
    setIsServicesOpen(!isServicesOpen);
  };

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsServicesOpen(false);
  };

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
          
          <Link 
            to="/celebrities" 
            className="book-now-btn"
            onClick={() => setIsMenuOpen(false)}
          >
            Book Now
          </Link>
        </nav>
        
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
};

export default Header;


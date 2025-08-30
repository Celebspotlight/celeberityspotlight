import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button 
      className="theme-toggle unified" 
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className="theme-icon-container">
        {/* Unified Icon that morphs between sun and moon */}
        <svg 
          className={`theme-icon unified-icon ${isDark ? 'moon' : 'sun'}`} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          {/* Sun rays (visible in light mode) */}
          <g className="sun-rays">
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </g>
          
          {/* Center circle/crescent that morphs */}
          <path 
            className="center-shape" 
            d={isDark ? "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" : "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10z"}
          />
        </svg>
      </div>
      
      {/* Background stars for dark mode */}
      <div className="theme-toggle-stars">
        <div className="star star-1"></div>
        <div className="star star-2"></div>
        <div className="star star-3"></div>
      </div>
    </button>
  );
};

export default ThemeToggle;
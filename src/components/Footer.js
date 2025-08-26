import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            {/* Company Section */}
            <div className="footer-section company">
              <h3>Celebrity Spotlight</h3>
              <p>
                Connect with celebrities through personalized video messages and exclusive experiences. 
                Professional, secure, and memorable moments.
              </p>
              <div className="social-links">
                <a href="https://facebook.com" aria-label="Facebook" data-platform="facebook">
                  f
                </a>
                <a href="https://twitter.com" aria-label="Twitter" data-platform="twitter">
                  𝕏
                </a>
                <a href="https://instagram.com" aria-label="Instagram" data-platform="instagram">
                  📷
                </a>
                <a href="https://linkedin.com" aria-label="LinkedIn" data-platform="linkedin">
                  in
                </a>
              </div>
            </div>

            {/* Services */}
            <div className="footer-section">
              <h4>Services</h4>
              <ul>
                <li><a href="/book-video">Video Messages</a></li>
                <li><a href="/promotions">Promotions</a></li>
                <li><a href="/acting-classes">Acting Classes</a></li>
                <li><a href="/donations">Donations</a></li>
                <li><a href="/personalized-videos">Custom Videos</a></li>
              </ul>
            </div>

            {/* Company */}
            <div className="footer-section">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/celebrities">Celebrities</a></li>
                <li><a href="/contact">Contact</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/help">Help Center</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; 2025 Celebrity Spotlight. All rights reserved.</p>
            <div className="footer-links">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
              <a href="/cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
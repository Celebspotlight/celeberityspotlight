import React from 'react';
import './Hero.css';

function Hero() {
  return (
    <section className="hero">
      <div className="hero-background">
        <div className="hero-overlay"></div>
      </div>
      <div className="container">
        <div className="hero-content">
          <div className="hero-badge">
            <span>✨ Premium Celebrity Experiences</span>
          </div>
          <h1 className="hero-title">
            Connect with Your
            <span className="hero-highlight"> Favorite Celebrities</span>
          </h1>
          <p className="hero-subtitle">
            Book exclusive celebrity experiences, VIP events, and personalized encounters with top celebrities, influencers, and public figures worldwide.
          </p>
          <div className="hero-buttons">
            <a href="/celebrities" className="btn btn-primary">
              <span>Explore Celebrities</span>
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="/about" className="btn btn-outline">
              <span>Learn More</span>
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">500+</span>
              <span className="stat-label">Celebrities</span>
            </div>
            <div className="stat">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Happy Fans</span>
            </div>
            <div className="stat">
              <span className="stat-number">50+</span>
              <span className="stat-label">Countries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
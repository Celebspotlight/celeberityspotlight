import React from 'react';
import AnimatedCounter from './AnimatedCounter';
import './About.css';

const About = () => {
  return (
    <section className="about" id="about">
      <div className="container">
        {/* Mission Section */}
        <div className="about-hero">
          <div className="about-hero-content">
            <h2 className="about-title">
              Connecting Fans with Their
              <span className="highlight"> Dream Experiences</span>
            </h2>
            <p className="about-lead">
              We're revolutionizing how fans connect with celebrities through exclusive, 
              authentic experiences that create lasting memories and meaningful connections.
            </p>
          </div>
          <div className="about-hero-image">
            <div className="image-placeholder">
              <svg width="80" height="80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="about-features">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>Verified Experiences</h3>
            <p>Every celebrity and experience is thoroughly vetted and verified for authenticity and quality.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3>Instant Booking</h3>
            <p>Book your dream experience in minutes with our streamlined, secure booking process.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3>Secure & Protected</h3>
            <p>Your personal information and payments are protected with enterprise-grade security.</p>
          </div>
        </div>

        {/* Animated Stats Section */}
        <div className="about-stats">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter end={500} duration={2500} suffix="+" />
              </span>
              <span className="stat-label">Verified Celebrities</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter end={10000} duration={3000} suffix="+" />
              </span>
              <span className="stat-label">Happy Customers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter end={50} duration={2000} suffix="+" />
              </span>
              <span className="stat-label">Countries Served</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">
                <AnimatedCounter end={99.9} duration={2800} suffix="%" />
              </span>
              <span className="stat-label">Satisfaction Rate</span>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="about-mission">
          <div className="mission-content">
            <h3>Our Mission</h3>
            <p>
              To bridge the gap between fans and celebrities by creating meaningful, 
              authentic experiences that go beyond traditional celebrity encounters. We believe 
              every fan deserves the opportunity to connect with their heroes in a personal, 
              memorable way.
            </p>
            <div className="mission-values">
              <div className="value">
                <strong>Authenticity</strong>
                <span>Real connections, genuine experiences</span>
              </div>
              <div className="value">
                <strong>Excellence</strong>
                <span>Premium quality in every interaction</span>
              </div>
              <div className="value">
                <strong>Trust</strong>
                <span>Reliable, secure, and transparent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
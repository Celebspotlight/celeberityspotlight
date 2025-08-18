import React from 'react';
import Hero from './Hero';
import './Home.css';

function Home() {
  return (
    <div className="home">
      <Hero />
      
      {/* Featured Section */}
      <section className="featured-section">
        <div className="container">
          <h2>Why Choose Celebrity Spotlight?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">⭐</div>
              <h3>Verified Celebrities</h3>
              <p>All our celebrities are verified and authentic</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Secure Booking</h3>
              <p>Safe and secure payment processing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Flexible Scheduling</h3>
              <p>Book at your convenience with flexible timing</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💎</div>
              <h3>Premium Experience</h3>
              <p>Unforgettable moments with your favorite stars</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Meet Your Favorite Celebrity?</h2>
          <p>Browse our exclusive roster and book your dream celebrity experience today!</p>
          <button className="cta-button">Browse Celebrities</button>
        </div>
      </section>
    </div>
  );
}

export default Home;
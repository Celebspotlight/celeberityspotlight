import React from 'react';
import About from '../components/About';
import './AboutPage.css';

function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-header">
        <div className="container">
          <h1>About Celebrity Spotlight</h1>
          <p>Learn more about our mission to connect fans with their favorite celebrities</p>
        </div>
      </div>
      <div className="page-content">
        <About />
      </div>
    </div>
  );
}

export default AboutPage;
import React from 'react';
import Services from '../components/Services';
import './ServicesPage.css';

function ServicesPage() {
  return (
    <div className="services-page">
      <div className="page-header">
        <div className="container">
          <h1>Our Services</h1>
          <p>Comprehensive celebrity booking and event management services</p>
        </div>
      </div>
      <Services detailed={true} />
      
      <section className="additional-services">
        <div className="container">
          <h2>Additional Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <h3>Event Planning</h3>
              <p>Complete event planning and coordination services for your celebrity appearances.</p>
            </div>
            <div className="service-card">
              <h3>Security Services</h3>
              <p>Professional security arrangements for celebrity events and experiences.</p>
            </div>
            <div className="service-card">
              <h3>Media Coverage</h3>
              <p>Professional photography and videography services for your events.</p>
            </div>
            <div className="service-card">
              <h3>Venue Coordination</h3>
              <p>Assistance with venue selection and setup for optimal celebrity experiences.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ServicesPage;
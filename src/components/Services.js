import React from 'react';
import './Services.css';

const Services = () => {
  const services = [
    {
      title: "Celebrity Experiences",
      description: "Meet Celebrities",
      detail: "Unforgettable moments with your favorite stars await.",
      icon: "🌟"
    },
    {
      title: "Exclusive Tickets",
      description: "Access top shows and live performances easily.",
      detail: "Get priority access to sold-out events.",
      icon: "🎫"
    },
    {
      title: "Customized Items",
      description: "Unique products inspired by your idols.",
      detail: "Personalized merchandise and memorabilia.",
      icon: "🎁"
    }
  ];

  return (
    // Add id="services" to the main section
    <section className="services" id="services">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <p className="section-subtitle">
          Discover amazing experiences tailored just for you
        </p>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <p className="service-detail">{service.detail}</p>
              <button className="btn service-btn">Learn More</button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
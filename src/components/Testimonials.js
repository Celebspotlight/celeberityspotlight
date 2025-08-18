import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      name: "Jessica",
      text: "Amazing experience meeting my idol!",
      rating: 5
    },
    {
      name: "Samantha Lee",
      text: "Meeting my favorite celebrity was a dream come true, thanks to Celeb Live Access. Unforgettable moments!",
      rating: 5
    },
    {
      name: "James Smith",
      text: "I had a fantastic time at the concert. Celeb Live Access made everything so easy and enjoyable!",
      rating: 5
    }
  ];

  return (
    <section className="testimonials section">
      <div className="container">
        <h2 className="section-title">What Our Fans Say</h2>
        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="star">★</span>
                ))}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <h4 className="testimonial-name">{testimonial.name}</h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
import React, { useState } from 'react';
import { useForm, ValidationError } from '@formspree/react';
import './ContactPage.css';

function ContactPage() {
  const [state, handleSubmit] = useForm("manbkzav"); // Formspree form ID
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
    if (state.succeeded) {
      setFormData({ name: '', email: '', message: '' });
    }
  };

  // Reset form data when submission succeeds
  React.useEffect(() => {
    if (state.succeeded) {
      setFormData({ name: '', email: '', message: '' });
    }
  }, [state.succeeded]);

  return (
    <div className="contact-page">
      <div className="container">
        {/* Compact Header */}
        <div className="contact-header">
          <h1>Contact Us</h1>
          <p>Ready to book your celebrity experience?</p>
        </div>

        <div className="contact-layout">
          {/* Left Side - Contact Info */}
          <div className="contact-sidebar">
            <div className="contact-card">
              <h3>Get in Touch</h3>
              
              <div className="contact-methods">

                
                <div className="contact-method">
                  <span className="method-icon">✉️</span>
                  <div>
                    <strong>Email</strong>
                    <p>infocelebspotlight@gmail.com</p>
                  </div>
                </div>
                
                <div className="contact-method">
                  <span className="method-icon">⏱️</span>
                  <div>
                    <strong>Response</strong>
                    <p>Within 24 hours</p>
                  </div>
                </div>
              </div>
              
              <div className="trust-indicators">
                <div className="indicator">
                  <span className="number">500+</span>
                  <span className="label">Happy Clients</span>
                </div>
                <div className="indicator">
                  <span className="number">24/7</span>
                  <span className="label">Support</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Compact Form */}
          <div className="form-container">
            {state.succeeded && (
              <div className="success-alert">
                ✓ Thank you! We'll get back to you soon.
              </div>
            )}
            
            {state.errors && state.errors.length > 0 && (
              <div className="error-alert" style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', color: 'white', padding: '1rem 1.5rem', borderRadius: '12px', marginBottom: '2rem', fontWeight: '500', textAlign: 'center'}}>
                ⚠️ There was an error sending your message. Please try again.
              </div>
            )}

            <form onSubmit={onSubmit} className="contact-form">
              <div className="form-row">
                <div className="input-group">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                  <ValidationError 
                    prefix="Name" 
                    field="name"
                    errors={state.errors}
                  />
                  <label htmlFor="name">Full Name</label>
                </div>
                
                <div className="input-group">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder=""
                    required
                  />
                  <ValidationError 
                    prefix="Email" 
                    field="email"
                    errors={state.errors}
                  />
                  <label htmlFor="email">Email Address</label>
                </div>
              </div>

              <div className="input-group">
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder=""
                  rows="4"
                  required
                ></textarea>
                <ValidationError 
                  prefix="Message" 
                  field="message"
                  errors={state.errors}
                />
                <label htmlFor="message">Your Message</label>
              </div>

              <button 
                type="submit" 
                className={`submit-button ${state.submitting ? 'loading' : ''}`}
                disabled={state.submitting}
              >
                {state.submitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;
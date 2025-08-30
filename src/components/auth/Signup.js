import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './ModernSignup.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [fieldValidation, setFieldValidation] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Real-time validation
    validateField(name, value);
    

  };
  
  const validateField = (name, value) => {
    const newValidation = { ...fieldValidation };
    
    switch (name) {
      case 'name':
        newValidation.name = value.trim().length >= 2;
        break;
      case 'email':
        newValidation.email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        break;
      case 'password':
        newValidation.password = value.length >= 6;
        break;
      case 'confirmPassword':
        newValidation.confirmPassword = value === formData.password;
        break;
      default:
        break;
    }
    
    setFieldValidation(newValidation);
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLoading) return;
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      const result = await register(
        formData.email,
        formData.password,
        {
          displayName: formData.name,
          firstName: formData.name.split(' ')[0] || '',
          lastName: formData.name.split(' ').slice(1).join(' ') || ''
        }
      );
      
      if (result.success) {
        navigate('/dashboard');
      }
    } catch (err) {
      // Error will be handled by the auth context
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-signup-container">
      <div className="modern-signup-card">
        <div className="modern-signup-header">
          <h2 className="modern-signup-title">Create Account</h2>
          <p className="modern-signup-subtitle">Join us and start your journey today</p>
        </div>



        <form onSubmit={handleSubmit} className="modern-signup-form">
          <div className="modern-input-group">
            <label htmlFor="name" className="modern-input-label">
              Full Name
            </label>
            <div className="modern-input-wrapper">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
                className={`modern-form-input ${
                  errors.name ? 'error' : fieldValidation.name ? 'success' : ''
                }`}
              />
            </div>
            {errors.name && (
              <div className="modern-field-error">
                {errors.name}
              </div>
            )}
          </div>

          <div className="modern-input-group">
            <label htmlFor="email" className="modern-input-label">
              Email Address
            </label>
            <div className="modern-input-wrapper">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email address"
                className={`modern-form-input ${
                  errors.email ? 'error' : fieldValidation.email ? 'success' : ''
                }`}
              />
            </div>
            {errors.email && (
              <div className="modern-field-error">
                {errors.email}
              </div>
            )}
          </div>

          <div className="modern-input-group">
            <label htmlFor="password" className="modern-input-label">
              Password
            </label>
            <div className="modern-password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Password (min. 6 characters)"
                className={`modern-form-input ${
                  errors.password ? 'error' : fieldValidation.password ? 'success' : ''
                }`}
              />
              <button
                type="button"
                className="modern-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            {errors.password && (
              <div className="modern-field-error">
                {errors.password}
              </div>
            )}
          </div>

          <div className="modern-input-group">
            <label htmlFor="confirmPassword" className="modern-input-label">
              Confirm Password
            </label>
            <div className="modern-input-wrapper">
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Confirm your password"
                className={`modern-form-input ${
                  errors.confirmPassword ? 'error' : fieldValidation.confirmPassword ? 'success' : ''
                }`}
              />
            </div>
            {errors.confirmPassword && (
              <div className="modern-field-error">
                {errors.confirmPassword}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="modern-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="modern-loading-spinner"></span>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="modern-signup-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="modern-auth-link">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
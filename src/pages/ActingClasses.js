import React, { useState, useEffect } from 'react';
import ActingClassModal from '../components/ActingClassModal';
import './ActingClasses.css';

const ActingClasses = () => {
  const [celebrities, setCelebrities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassType, setSelectedClassType] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedCoach, setSelectedCoach] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savedScrollPosition, setSavedScrollPosition] = useState(0); // Add this state

  useEffect(() => {
    // Load acting coaches from separate localStorage
    const loadActingCoaches = () => {
      const savedActingCoaches = localStorage.getItem('actingCoaches');
      if (savedActingCoaches) {
        const parsed = JSON.parse(savedActingCoaches);
        setCelebrities(parsed); // Use the same state but load from actingCoaches
      } else {
        setCelebrities([]); // No acting coaches yet
      }
      // ADD THIS LINE TO STOP LOADING
      setLoading(false);
    };
  
    loadActingCoaches();
  
    // Listen for changes to acting coaches localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'actingCoaches') {
        loadActingCoaches();
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
  
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Add effect to handle scroll position when modal opens/closes
  useEffect(() => {
    if (isModalOpen) {
      // Save current scroll position
      setSavedScrollPosition(window.pageYOffset);
      // Scroll to top smoothly
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      // Restore scroll position when modal closes
      if (savedScrollPosition > 0) {
        setTimeout(() => {
          window.scrollTo({ top: savedScrollPosition, behavior: 'smooth' });
        }, 100); // Small delay to ensure modal is fully closed
      }
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, savedScrollPosition]);

  // Filter acting coaches
  const filteredCoaches = celebrities.filter(coach => {
    const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClassType = selectedClassType === 'All' || coach.class_type === selectedClassType;
    const matchesPrice = priceRange === 'All' || 
      (priceRange === 'Under $200' && coach.class_price < 200) ||
      (priceRange === '$200-$400' && coach.class_price >= 200 && coach.class_price <= 400) ||
      (priceRange === 'Over $400' && coach.class_price > 400);
    
    return matchesSearch && matchesClassType && matchesPrice;
  });

  const handleBookClass = (coach) => {
    if (!coach.available) {
      alert('This acting coach is currently unavailable.');
      return;
    }
    setSelectedCoach(coach);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCoach(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading acting coaches...</p>
      </div>
    );
  }

  return (
    <div className="acting-classes-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Acting Classes</h1>
          <p>Learn from professional actors with 1-on-1 or group acting classes</p>
        </div>
      </section>

      {/* Main Section */}
      <section className="main-section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your Acting Coach</h2>
            <p>Browse our verified acting coaches ({celebrities.length} available)</p>
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search acting coaches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={selectedClassType} 
                onChange={(e) => setSelectedClassType(e.target.value)}
              >
                <option value="All">All Class Types</option>
                <option value="Pre-recorded">Pre-recorded</option>
                <option value="Zoom Live">Zoom Live</option>
                <option value="Group Class">Group Class</option>
              </select>
              
              <select 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="All">All Prices</option>
                <option value="Under $200">Under $200</option>
                <option value="$200-$400">$200 - $400</option>
                <option value="Over $400">Over $400</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="results-info">
            <span>{filteredCoaches.length} acting coaches available</span>
          </div>

          {/* Acting Coaches Grid */}
          <div className="coaches-grid">
            {filteredCoaches.length > 0 ? (
              filteredCoaches.map(coach => (
                <div key={coach.id} className={`coach-card ${!coach.available ? 'unavailable' : ''}`}>
                  <div className="coach-image">
                    <div className="placeholder-image">
                      <span>{coach.name.charAt(0)}</span>
                    </div>
                    <div className="class-type-badge">{coach.class_type}</div>
                    {!coach.available && <div className="unavailable-overlay">Unavailable</div>}
                  </div>
                  
                  <div className="coach-info">
                    <h3 className="coach-name">{coach.name}</h3>
                    <div className="coach-specialization">{coach.category} • {coach.class_type}</div>
                    <div className="coach-price">${coach.class_price}</div>
                    <div className="coach-duration">⏱️ {coach.class_duration}</div>
                    <div className="coach-description">{coach.class_description}</div>
                    
                    <button 
                      className={`book-btn ${!coach.available ? 'disabled' : ''}`}
                      onClick={() => handleBookClass(coach)}
                      disabled={!coach.available}
                    >
                      {coach.available ? 'Book Class' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>No acting coaches found</h3>
                <p>Try adjusting your filters</p>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedClassType('All');
                    setPriceRange('All');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Acting Class Booking Modal */}
      {isModalOpen && (
        <ActingClassModal
          coach={selectedCoach}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default ActingClasses;
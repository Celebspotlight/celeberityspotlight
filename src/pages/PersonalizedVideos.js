import React, { useState, useEffect } from 'react';
import PersonalizedVideoModal from '../components/PersonalizedVideoModal';
import './PersonalizedVideos.css';

const PersonalizedVideos = () => {
  const [celebrities, setCelebrities] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); 
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Video services configuration
  const videoServices = {
    birthday: {
      name: 'Birthday Message',
      description: 'Personalized birthday wishes',
      icon: '🎂'
    },
    congratulations: {
      name: 'Congratulations',
      description: 'Celebrate achievements',
      icon: '🎉'
    },
    motivation: {
      name: 'Motivational Message',
      description: 'Inspiring words of encouragement',
      icon: '💪'
    },
    holiday: {
      name: 'Holiday Greetings',
      description: 'Festive holiday messages',
      icon: '🎄'
    },
    custom: {
      name: 'Custom Message',
      description: 'Any special occasion',
      icon: '✨'
    }
  };

  // Function to get celebrity video price
  const getCelebrityVideoPrice = (celebrity, videoType) => {
    return celebrity.price || 100; // Default price if not set
  };

  // Function to generate profile icons
  const generateProfileIcon = (name, category) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
      '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
    ];
    const colorIndex = name.charCodeAt(0) % colors.length;
    
    return {
      letter: firstLetter,
      backgroundColor: colors[colorIndex]
    };
  };

  const CelebrityImage = ({ celebrity }) => {
    if (celebrity.image) {
      return (
        <img 
          src={celebrity.image} 
          alt={celebrity.name}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
      );
    } else {
      const profileIcon = generateProfileIcon(celebrity.name, celebrity.category);
      return (
        <div 
          className="profile-icon"
          style={{
            backgroundColor: profileIcon.backgroundColor,
            color: 'white',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            fontWeight: '600',
            borderRadius: '8px'
          }}
        >
          {profileIcon.letter}
        </div>
      );
    }
  };
  
  useEffect(() => {
    // Load celebrities from localStorage (managed by admin)
    const savedCelebrities = localStorage.getItem('celebrities');
    if (savedCelebrities) {
      setCelebrities(JSON.parse(savedCelebrities));
    }
    setLoading(false);
  }, []);
  
  // Add a storage listener to sync with admin changes
  useEffect(() => {
    const handleStorageChange = () => {
      const savedCelebrities = localStorage.getItem('celebrities');
      if (savedCelebrities) {
        setCelebrities(JSON.parse(savedCelebrities));
      }
    };
  
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Filter celebrities
  const filteredCelebrities = celebrities.filter(celebrity => {
    const matchesSearch = celebrity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || celebrity.category === selectedCategory;
    const matchesPrice = priceRange === 'All' || 
      (priceRange === 'Under $500' && celebrity.price < 500) ||
      (priceRange === '$500-$1000' && celebrity.price >= 500 && celebrity.price <= 1000) ||
      (priceRange === 'Over $1000' && celebrity.price > 1000);
    
    return matchesSearch && matchesCategory && matchesPrice;
  });

  const handleBookVideo = (celebrity) => {
    if (!celebrity.available) {
      alert('This celebrity is currently unavailable.');
      return;
    }
    setSelectedCelebrity(celebrity);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCelebrity(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading celebrities...</p>
      </div>
    );
  }

  return (
    <div className="personalized-videos-page">
      {/* Compact Hero Section */}
      <section className="hero-section">
        <div className="container">
          <h1>Personalized Video Messages</h1>
          <p>Get custom video messages from your favorite celebrities</p>
        </div>
      </section>

      {/* Main Section */}
      <section className="main-section">
        <div className="container">
          <div className="section-header">
            <h2>Choose Your Celebrity</h2>
            <p>Browse our verified celebrities ({celebrities.length} available)</p>
          </div>

          {/* Compact Filters */}
          <div className="filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search celebrities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Music">Music</option>
                <option value="Movies">Movies</option>
                <option value="Sports">Sports</option>
                <option value="TV">TV</option>
                <option value="Comedy">Comedy</option>
              </select>
              
              <select 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
              >
                <option value="All">All Prices</option>
                <option value="Under $500">Under $500</option>
                <option value="$500-$1000">$500 - $1000</option>
                <option value="Over $1000">Over $1000</option>
              </select>
            </div>
          </div>

          {/* Results */}
          <div className="results-info">
            <span>{filteredCelebrities.length} celebrities available</span>
          </div>

          {/* Compact Celebrity Grid */}
          <div className="celebrities-grid">
            {filteredCelebrities.length > 0 ? (
              filteredCelebrities.map(celebrity => (
                <div key={celebrity.id} className={`celebrity-card ${!celebrity.available ? 'unavailable' : ''}`}>
                  <div className="celebrity-image">
                    <CelebrityImage celebrity={celebrity} />
                    <div className="category-badge">{celebrity.category}</div>
                    {!celebrity.available && <div className="unavailable-overlay">Unavailable</div>}
                  </div>
                  
                  <div className="celebrity-info">
                    <h3 className="celebrity-name">{celebrity.name}</h3>
                    <div className="celebrity-rating">★ {celebrity.rating} ({celebrity.totalVideos}+ videos)</div>
                    <div className="celebrity-price">${celebrity.price}</div>
                    <div className="celebrity-delivery">⏱️ {celebrity.responseTime}</div>
                    
                    <button 
                      className={`book-btn ${!celebrity.available ? 'disabled' : ''}`}
                      onClick={() => handleBookVideo(celebrity)}
                      disabled={!celebrity.available}
                    >
                      {celebrity.available ? 'Book Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <h3>No celebrities found</h3>
                <p>Try adjusting your filters</p>
                <button 
                  className="reset-btn"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
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

      {/* Personalized Video Modal */}
      {selectedCelebrity && isModalOpen && (
        <PersonalizedVideoModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          celebrity={selectedCelebrity}
          videoServices={videoServices}
          getCelebrityVideoPrice={getCelebrityVideoPrice}
        />
      )}
    </div>
  );
};

export default PersonalizedVideos;

import React, { useState, useMemo, useEffect } from 'react';
import './Celebrities.css';
import BookingModal from './BookingModal';

const Celebrities = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCelebrity, setSelectedCelebrity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [celebrities, setCelebrities] = useState([]);

  // Load celebrities from localStorage (managed by admin)
  useEffect(() => {
    const savedCelebrities = localStorage.getItem('celebrities');
    if (savedCelebrities) {
      setCelebrities(JSON.parse(savedCelebrities));
    } else {
      // Initialize with default celebrities if localStorage is empty
      resetCelebrityData();
    }
  }, []);

  // Listen for changes in localStorage (when admin updates data)
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

  // IMPORTANT: Make sure this useEffect is commented out or removed:
  // useEffect(() => {
  //   resetCelebrityData(); // This should NEVER be called automatically
  // }, []);

  // Function to generate profile icon with first letter
  // Update the generateProfileIcon function to be consistent
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

  // Add this function to reset celebrity data
  const resetCelebrityData = () => {
    const defaultCelebrities = [
      // Music Artists (all available: true)
      { id: 1, name: "Taylor Swift", category: "Music", price: 800, available: true, image: null },
      { id: 2, name: "Ariana Grande", category: "Music", price: 750, available: true, image: null },
      { id: 3, name: "Ed Sheeran", category: "Music", price: 700, available: true, image: null },
      { id: 4, name: "Billie Eilish", category: "Music", price: 650, available: true, image: null },
      { id: 5, name: "Drake", category: "Music", price: 900, available: true, image: null },
      { id: 6, name: "Adele", category: "Music", price: 850, available: true, image: null },
      { id: 7, name: "Justin Bieber", category: "Music", price: 800, available: true, image: null },
      { id: 8, name: "Dua Lipa", category: "Music", price: 600, available: true, image: null },
      { id: 9, name: "The Weeknd", category: "Music", price: 700, available: true, image: null },
      { id: 10, name: "Olivia Rodrigo", category: "Music", price: 550, available: true, image: null },
      { id: 11, name: "Harry Styles", category: "Music", price: 750, available: true, image: null },
      { id: 12, name: "Beyoncé", category: "Music", price: 1000, available: true, image: null },
      { id: 13, name: "Bruno Mars", category: "Music", price: 700, available: true, image: null },
      { id: 14, name: "Rihanna", category: "Music", price: 900, available: true, image: null },
      { id: 15, name: "Post Malone", category: "Music", price: 650, available: true, image: null },
      { id: 16, name: "Lady Gaga", category: "Music", price: 800, available: true, image: null },
      { id: 17, name: "Shawn Mendes", category: "Music", price: 600, available: true, image: null },
      { id: 18, name: "Katy Perry", category: "Music", price: 650, available: true, image: null },
      { id: 19, name: "John Legend", category: "Music", price: 700, available: true, image: null },
      { id: 20, name: "Alicia Keys", category: "Music", price: 650, available: true, image: null },

      // Movie Stars (all available: true)
      { id: 21, name: "Robert Downey Jr.", category: "Movies", price: 1200, available: true, image: null },
      { id: 22, name: "Dwayne Johnson", category: "Movies", price: 1000, available: true, image: null },
      { id: 23, name: "Scarlett Johansson", category: "Movies", price: 900, available: true, image: null },
      { id: 24, name: "Chris Evans", category: "Movies", price: 850, available: true, image: null },
      { id: 25, name: "Jennifer Lawrence", category: "Movies", price: 800, available: true, image: null },
      { id: 26, name: "Leonardo DiCaprio", category: "Movies", price: 1500, available: true, image: null },
      { id: 27, name: "Emma Stone", category: "Movies", price: 750, available: true, image: null },
      { id: 28, name: "Ryan Reynolds", category: "Movies", price: 900, available: true, image: null },
      { id: 29, name: "Margot Robbie", category: "Movies", price: 800, available: true, image: null },
      { id: 30, name: "Tom Holland", category: "Movies", price: 700, available: true, image: null },
      { id: 31, name: "Zendaya", category: "Movies", price: 750, available: true, image: null },
      { id: 32, name: "Chris Hemsworth", category: "Movies", price: 850, available: true, image: null },
      { id: 33, name: "Anne Hathaway", category: "Movies", price: 700, available: true, image: null },
      { id: 34, name: "Will Smith", category: "Movies", price: 1000, available: true, image: null },
      { id: 35, name: "Gal Gadot", category: "Movies", price: 800, available: true, image: null },
      { id: 36, name: "Ryan Gosling", category: "Movies", price: 850, available: true, image: null },
      { id: 37, name: "Emma Watson", category: "Movies", price: 750, available: true, image: null },
      { id: 38, name: "Mark Wahlberg", category: "Movies", price: 700, available: true, image: null },
      { id: 39, name: "Sandra Bullock", category: "Movies", price: 800, available: true, image: null },
      { id: 40, name: "Keanu Reeves", category: "Movies", price: 1100, available: true, image: null },

      // Sports Stars (only Michael Jordan and Kobe Bryant unavailable)
      { id: 41, name: "LeBron James", category: "Sports", price: 1200, available: true, image: null },
      { id: 42, name: "Cristiano Ronaldo", category: "Sports", price: 1500, available: true, image: null },
      { id: 43, name: "Lionel Messi", category: "Sports", price: 1400, available: true, image: null },
      { id: 44, name: "Serena Williams", category: "Sports", price: 1000, available: true, image: null },
      { id: 45, name: "Stephen Curry", category: "Sports", price: 900, available: true, image: null },
      { id: 46, name: "Tom Brady", category: "Sports", price: 1100, available: true, image: null },
      { id: 47, name: "Usain Bolt", category: "Sports", price: 800, available: true, image: null },
      { id: 48, name: "Michael Jordan", category: "Sports", price: 2000, available: false, image: null },
      { id: 49, name: "Kobe Bryant", category: "Sports", price: 1800, available: false, image: null },
      { id: 50, name: "Tiger Woods", category: "Sports", price: 1300, available: true, image: null },
      { id: 51, name: "Roger Federer", category: "Sports", price: 1200, available: true, image: null },
      { id: 52, name: "Lewis Hamilton", category: "Sports", price: 1000, available: true, image: null },
      { id: 53, name: "Simone Biles", category: "Sports", price: 800, available: true, image: null },
      { id: 54, name: "Kevin Durant", category: "Sports", price: 900, available: true, image: null },
      { id: 55, name: "Neymar Jr.", category: "Sports", price: 1100, available: true, image: null },
      { id: 56, name: "Rafael Nadal", category: "Sports", price: 1000, available: true, image: null },
      { id: 57, name: "Shaquille O'Neal", category: "Sports", price: 800, available: true, image: null },
      { id: 58, name: "Floyd Mayweather", category: "Sports", price: 1500, available: true, image: null },
      { id: 59, name: "Conor McGregor", category: "Sports", price: 1200, available: true, image: null },
      { id: 60, name: "Novak Djokovic", category: "Sports", price: 1000, available: true, image: null },

      // TV Stars (all available: true)
      { id: 61, name: "Ellen DeGeneres", category: "TV", price: 800, available: true, image: null },
      { id: 62, name: "Oprah Winfrey", category: "TV", price: 1500, available: true, image: null },
      { id: 63, name: "Jimmy Fallon", category: "TV", price: 700, available: true, image: null },
      { id: 64, name: "Stephen Colbert", category: "TV", price: 650, available: true, image: null },
      { id: 65, name: "Conan O'Brien", category: "TV", price: 600, available: true, image: null },
      { id: 66, name: "Trevor Noah", category: "TV", price: 550, available: true, image: null },
      { id: 67, name: "John Oliver", category: "TV", price: 500, available: true, image: null },
      { id: 68, name: "Gordon Ramsay", category: "TV", price: 700, available: true, image: null },
      { id: 69, name: "Simon Cowell", category: "TV", price: 650, available: true, image: null },
      { id: 70, name: "Ryan Seacrest", category: "TV", price: 600, available: true, image: null },
      { id: 71, name: "Anderson Cooper", category: "TV", price: 550, available: true, image: null },
      { id: 72, name: "Rachel Maddow", category: "TV", price: 500, available: true, image: null },
      { id: 73, name: "Tucker Carlson", category: "TV", price: 500, available: true, image: null },
      { id: 74, name: "Sean Hannity", category: "TV", price: 500, available: true, image: null },
      { id: 75, name: "Bill Maher", category: "TV", price: 600, available: true, image: null },
      { id: 76, name: "Jon Stewart", category: "TV", price: 700, available: true, image: null },
      { id: 77, name: "David Letterman", category: "TV", price: 800, available: true, image: null },
      { id: 78, name: "Jay Leno", category: "TV", price: 750, available: true, image: null },
      { id: 79, name: "Whoopi Goldberg", category: "TV", price: 600, available: true, image: null },
      { id: 80, name: "Kelly Clarkson", category: "TV", price: 550, available: true, image: null },

      // Social Media Influencers (all available: true)
      { id: 81, name: "MrBeast", category: "Social Media", price: 500, available: true, image: null },
      { id: 82, name: "PewDiePie", category: "Social Media", price: 450, available: true, image: null },
      { id: 83, name: "Charli D'Amelio", category: "Social Media", price: 400, available: true, image: null },
      { id: 84, name: "Addison Rae", category: "Social Media", price: 350, available: true, image: null },
      { id: 85, name: "James Charles", category: "Social Media", price: 400, available: true, image: null },
      { id: 86, name: "Emma Chamberlain", category: "Social Media", price: 350, available: true, image: null },
      { id: 87, name: "Logan Paul", category: "Social Media", price: 500, available: true, image: null },
      { id: 88, name: "Jake Paul", category: "Social Media", price: 450, available: true, image: null },
      { id: 89, name: "David Dobrik", category: "Social Media", price: 400, available: true, image: null },
      { id: 90, name: "Liza Koshy", category: "Social Media", price: 350, available: true, image: null },
      { id: 91, name: "Nikkie de Jager", category: "Social Media", price: 300, available: true, image: null },
      { id: 92, name: "Jeffree Star", category: "Social Media", price: 400, available: true, image: null },
      { id: 93, name: "Tana Mongeau", category: "Social Media", price: 300, available: true, image: null },
      { id: 94, name: "Shane Dawson", category: "Social Media", price: 350, available: true, image: null },
      { id: 95, name: "Bretman Rock", category: "Social Media", price: 300, available: true, image: null },
      { id: 96, name: "Dixie D'Amelio", category: "Social Media", price: 350, available: true, image: null },
      { id: 97, name: "Noah Beck", category: "Social Media", price: 300, available: true, image: null },
      { id: 98, name: "Avani Gregg", category: "Social Media", price: 250, available: true, image: null },
      { id: 99, name: "Bella Poarch", category: "Social Media", price: 300, available: true, image: null },
      { id: 100, name: "Khaby Lame", category: "Social Media", price: 350, available: true, image: null }
    ];
    
    localStorage.setItem('celebrities', JSON.stringify(defaultCelebrities));
    setCelebrities(defaultCelebrities);
    console.log('Celebrity data reset - only Michael Jordan and Kobe Bryant should be sold out');
  };

  // Remove or comment out this useEffect that auto-resets data
  // useEffect(() => {
  //   resetCelebrityData(); // Comment this line out
  // }, []);

  // Get unique categories for filter dropdown
  const categories = ['All', ...new Set(celebrities.map(celeb => celeb.category))];

  // Filter and search logic
  const filteredCelebrities = useMemo(() => {
    return celebrities.filter(celebrity => {
      const matchesSearch = celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           celebrity.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || celebrity.category === selectedCategory;
      
      const matchesPrice = priceRange === 'All' || 
                          (priceRange === 'Under $300' && celebrity.price < 300) ||
                          (priceRange === '$300-$500' && celebrity.price >= 300 && celebrity.price <= 500) ||
                          (priceRange === '$500-$700' && celebrity.price > 500 && celebrity.price <= 700) ||
                          (priceRange === 'Over $700' && celebrity.price > 700);
      
      const matchesAvailability = availabilityFilter === 'All' ||
                                 (availabilityFilter === 'Available' && celebrity.available) ||
                                 (availabilityFilter === 'Sold Out' && !celebrity.available);
      
      return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
    });
  }, [searchTerm, selectedCategory, priceRange, availabilityFilter, celebrities]);

  const handleBookNow = (celebrity) => {
    setSelectedCelebrity(celebrity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCelebrity(null);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setPriceRange('All');
    setAvailabilityFilter('All');
  };

  // Component for profile icon or real image
  const CelebrityImage = ({ celebrity }) => {
    if (celebrity.image) {
      return (
        <img 
          src={celebrity.image} 
          alt={celebrity.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      );
    } else {
      const profileIcon = generateProfileIcon(celebrity.name, celebrity.category);
      return (
        <div 
          className="profile-icon"
          style={{
            backgroundColor: profileIcon.backgroundColor,
            color: profileIcon.textColor,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: '600',
            fontFamily: 'Arial, sans-serif'
          }}
        >
          {profileIcon.letter}
        </div>
      );
    }
  };

  return (
    <>
      <section className="celebrities" id="celebrities">
        <div className="container">
          <h2 className="section-title">
            Meet Your Favorite Celebrities
          </h2>
          <p className="section-subtitle">
            Book exclusive celebrity experiences with top stars
          </p>
          
          {/* Search and Filter Controls */}
          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search celebrities by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <div className="filter-controls">
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              
              <select 
                value={priceRange} 
                onChange={(e) => setPriceRange(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Prices</option>
                <option value="Under $300">Under $300</option>
                <option value="$300-$500">$300 - $500</option>
                <option value="$500-$700">$500 - $700</option>
                <option value="Over $700">Over $700</option>
              </select>
              
              <select 
                value={availabilityFilter} 
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="filter-select"
              >
                <option value="All">All Status</option>
                <option value="Available">Available</option>
                <option value="Sold Out">Sold Out</option>
              </select>
              
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear Filters
              </button>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="results-info">
            <p>Showing {filteredCelebrities.length} of {celebrities.length} celebrities</p>
          </div>
          
          {/* Celebrities Grid */}
          <div className="celebrities-grid">
            {filteredCelebrities.map((celebrity, index) => (
              <div key={celebrity.id} className={`celebrity-card ${!celebrity.available ? 'unavailable' : ''}`}>
                <div className="celebrity-image">
                  <CelebrityImage celebrity={celebrity} />
                  {!celebrity.available && (
                    <div className="sold-out">
                      <span>Sold Out</span>
                    </div>
                  )}
                </div>
                <div className="celebrity-info">
                  <h3 className="celebrity-name">{celebrity.name}</h3>
                  <p className="celebrity-category">{celebrity.category}</p>
                  <p className="celebrity-price">${celebrity.price}</p>
                  <button 
                    className={`celebrity-btn ${!celebrity.available ? 'disabled' : ''}`}
                    onClick={() => handleBookNow(celebrity)}
                    disabled={!celebrity.available}
                  >
                    {celebrity.available ? 'Book Now' : 'Sold Out'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* No Results Message */}
          {filteredCelebrities.length === 0 && (
            <div className="no-results">
              <p>No celebrities found matching your criteria.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </section>
      
      <BookingModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        celebrity={selectedCelebrity}
      />
    </>
  );
};

export default Celebrities;
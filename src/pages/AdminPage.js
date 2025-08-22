import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import visitorTracker from '../services/visitorTracker';
import LiveVisitorTracker from '../components/LiveVisitorTracker';
// import { createPayment } from '../services/paymentService';

const getDefaultCelebrities = () => {
  return [
    // Music Artists
    { id: 1, name: "Taylor Swift", category: "Music", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 2, name: "Ariana Grande", category: "Music", price: 750, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 3, name: "Ed Sheeran", category: "Music", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 4, name: "Billie Eilish", category: "Music", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 5, name: "Drake", category: "Music", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 6, name: "Beyoncé", category: "Music", price: 1000, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 7, name: "Justin Bieber", category: "Music", price: 750, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 8, name: "Dua Lipa", category: "Music", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 9, name: "The Weeknd", category: "Music", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 10, name: "Olivia Rodrigo", category: "Music", price: 550, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 11, name: "Harry Styles", category: "Music", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 12, name: "Adele", category: "Music", price: 850, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 13, name: "Bruno Mars", category: "Music", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 14, name: "Lady Gaga", category: "Music", price: 750, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 15, name: "Shawn Mendes", category: "Music", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 16, name: "Rihanna", category: "Music", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 17, name: "Post Malone", category: "Music", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 18, name: "Selena Gomez", category: "Music", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 19, name: "Katy Perry", category: "Music", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 20, name: "John Legend", category: "Music", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },

    // Movie Stars
    { id: 21, name: "Leonardo DiCaprio", category: "Movies", price: 1200, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 22, name: "Scarlett Johansson", category: "Movies", price: 1000, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 23, name: "Robert Downey Jr.", category: "Movies", price: 1500, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 24, name: "Emma Stone", category: "Movies", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 25, name: "Ryan Reynolds", category: "Movies", price: 1100, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 26, name: "Jennifer Lawrence", category: "Movies", price: 1000, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 27, name: "Chris Evans", category: "Movies", price: 1200, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 28, name: "Margot Robbie", category: "Movies", price: 950, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 29, name: "Tom Holland", category: "Movies", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 30, name: "Zendaya", category: "Movies", price: 850, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 31, name: "Brad Pitt", category: "Movies", price: 1300, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 32, name: "Angelina Jolie", category: "Movies", price: 1200, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 33, name: "Will Smith", category: "Movies", price: 1100, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 34, name: "Gal Gadot", category: "Movies", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 35, name: "Chris Hemsworth", category: "Movies", price: 1000, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 36, name: "Anne Hathaway", category: "Movies", price: 850, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 37, name: "Ryan Gosling", category: "Movies", price: 950, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 38, name: "Emma Watson", category: "Movies", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 39, name: "Mark Wahlberg", category: "Movies", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 40, name: "Reese Witherspoon", category: "Movies", price: 850, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },

    // Sports Stars
    { id: 41, name: "Serena Williams", category: "Sports", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 42, name: "LeBron James", category: "Sports", price: 1000, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 43, name: "Cristiano Ronaldo", category: "Sports", price: 1200, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 44, name: "Lionel Messi", category: "Sports", price: 1200, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 45, name: "Stephen Curry", category: "Sports", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 46, name: "Tom Brady", category: "Sports", price: 1100, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 47, name: "Simone Biles", category: "Sports", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 48, name: "Michael Jordan", category: "Sports", price: 1500, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 49, name: "Usain Bolt", category: "Sports", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 50, name: "Venus Williams", category: "Sports", price: 750, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 51, name: "Kevin Durant", category: "Sports", price: 850, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 52, name: "Naomi Osaka", category: "Sports", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 53, name: "Lewis Hamilton", category: "Sports", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 54, name: "Shaquille O'Neal", category: "Sports", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 55, name: "Tiger Woods", category: "Sports", price: 1000, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 56, name: "Ronda Rousey", category: "Sports", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 57, name: "Floyd Mayweather", category: "Sports", price: 950, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 58, name: "Conor McGregor", category: "Sports", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 59, name: "Kobe Bryant", category: "Sports", price: 1200, available: false, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 60, name: "Alex Morgan", category: "Sports", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },

    // TV Personalities
    { id: 61, name: "Ellen DeGeneres", category: "TV", price: 900, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 62, name: "Oprah Winfrey", category: "TV", price: 1500, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 63, name: "Jimmy Fallon", category: "TV", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 64, name: "Stephen Colbert", category: "TV", price: 750, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 65, name: "Trevor Noah", category: "TV", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 66, name: "Conan O'Brien", category: "TV", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 67, name: "John Oliver", category: "TV", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 68, name: "Anderson Cooper", category: "TV", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 69, name: "Rachel Maddow", category: "TV", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 70, name: "Gordon Ramsay", category: "TV", price: 800, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 71, name: "Dr. Phil", category: "TV", price: 750, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 72, name: "Judge Judy", category: "TV", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 73, name: "Steve Harvey", category: "TV", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 74, name: "Kelly Clarkson", category: "TV", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 75, name: "Ryan Seacrest", category: "TV", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 76, name: "Wendy Williams", category: "TV", price: 550, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 77, name: "James Corden", category: "TV", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 78, name: "Seth Meyers", category: "TV", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 79, name: "Kimmel", category: "TV", price: 700, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 80, name: "Bill Maher", category: "TV", price: 650, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },

    // Social Media Influencers
    { id: 81, name: "MrBeast", category: "Social Media", price: 600, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 82, name: "PewDiePie", category: "Social Media", price: 550, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 83, name: "James Charles", category: "Social Media", price: 400, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 84, name: "Emma Chamberlain", category: "Social Media", price: 350, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 85, name: "David Dobrik", category: "Social Media", price: 450, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 86, name: "Charli D'Amelio", category: "Social Media", price: 500, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 87, name: "Addison Rae", category: "Social Media", price: 450, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 88, name: "Logan Paul", category: "Social Media", price: 500, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 89, name: "Jake Paul", category: "Social Media", price: 480, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 90, name: "Jeffree Star", category: "Social Media", price: 400, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 91, name: "Nikkie de Jager", category: "Social Media", price: 350, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 92, name: "Liza Koshy", category: "Social Media", price: 400, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 93, name: "Tana Mongeau", category: "Social Media", price: 350, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 94, name: "Shane Dawson", category: "Social Media", price: 400, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 95, name: "Bretman Rock", category: "Social Media", price: 300, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 96, name: "Dixie D'Amelio", category: "Social Media", price: 450, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 97, name: "Noah Beck", category: "Social Media", price: 400, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 98, name: "Avani Gregg", category: "Social Media", price: 350, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 99, name: "Chase Hudson", category: "Social Media", price: 380, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' },
    { id: 100, name: "Bella Poarch", category: "Social Media", price: 420, available: true, image: null, is_acting_coach: false, class_type: 'Pre-recorded', class_price: '', class_duration: '', class_description: '' }
  ];
};

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [celebrities, setCelebrities] = useState([]);
  const [filteredCelebrities, setFilteredCelebrities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [availabilityFilter, setAvailabilityFilter] = useState('All');
  const [editingCelebrity, setEditingCelebrity] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [showBookings, setShowBookings] = useState(false);
  const [visitorStats, setVisitorStats] = useState(null);
  const [showVisitorStats, setShowVisitorStats] = useState(false);
  // Add the scroll position state here
  const [scrollPosition, setScrollPosition] = useState(0);
  const [lastDeleted, setLastDeleted] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  // Add a ref to track if modal was just opened
  const [modalJustOpened, setModalJustOpened] = useState(false);
  const [newCelebrity, setNewCelebrity] = useState({
    name: '',
    category: 'Music',
    price: '',
    available: true,
    image: null,
    // New acting coach fields
    is_acting_coach: false,
    class_type: 'Pre-recorded',
    class_price: '',
    class_duration: '',
    class_description: ''
  });
  
  // ADD THESE ACTING COACH STATE VARIABLES:
  const [actingCoaches, setActingCoaches] = useState([]);
  const [filteredActingCoaches, setFilteredActingCoaches] = useState([]);
  const [showActingCoaches, setShowActingCoaches] = useState(false);
  const [editingActingCoach, setEditingActingCoach] = useState(null);
  const [showAddActingCoachForm, setShowAddActingCoachForm] = useState(false);
  const [newActingCoach, setNewActingCoach] = useState({
    name: '',
    class_type: 'Pre-recorded',
    class_price: '',
    class_duration: '',
    class_description: '',
    available: true,
    image: null
  });

  // ADD THESE PERSONALIZED VIDEOS STATE VARIABLES:
  const [personalizedVideos, setPersonalizedVideos] = useState([]);
  const [filteredPersonalizedVideos, setFilteredPersonalizedVideos] = useState([]);
  const [showPersonalizedVideos, setShowPersonalizedVideos] = useState(false);
  const [editingPersonalizedVideo, setEditingPersonalizedVideo] = useState(null);
  const [showAddPersonalizedVideoForm, setShowAddPersonalizedVideoForm] = useState(false);
  const [newPersonalizedVideo, setNewPersonalizedVideo] = useState({
    name: '',
    category: 'Music',
    price: '',
    available: true,
    rating: 4.5,
    totalVideos: 0,
    responseTime: '24 hours',
    image: null
  });

  // Add the useEffect for modal focus management here
  useEffect(() => {
    if (editingCelebrity && modalJustOpened) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const modal = document.querySelector('.modal');
        if (modal) {
          modal.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          // Focus the first input for better UX
          const firstInput = modal.querySelector('input');
          if (firstInput) {
            firstInput.focus();
          }
        }
        setModalJustOpened(false); // Reset the flag
      }, 100);
    }
  }, [editingCelebrity, modalJustOpened]);

  // Load visitor tracking states here
  useEffect(() => {
    const savedCelebrities = localStorage.getItem('celebrities');
    if (savedCelebrities) {
      const parsed = JSON.parse(savedCelebrities);
      setCelebrities(parsed);
    }
    // Remove the else block that auto-resets to default celebrities
    // This allows the admin to start with an empty list if needed

    // Load bookings
    const savedBookings = localStorage.getItem('bookings');
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings));
    }
  }, []);

  // Auto-refresh visitor stats every 30 seconds when viewing stats
  useEffect(() => {
    let interval;
    if (showVisitorStats) {
      const refreshStats = async () => {
        try {
          const stats = await visitorTracker.getCombinedStats();
          setVisitorStats(stats);
        } catch (error) {
          console.error('Failed to refresh visitor stats:', error);
          // Fallback to regular stats
          const fallbackStats = visitorTracker.getVisitorStats();
          setVisitorStats(fallbackStats);
        }
      };
      
      // Initial load
      refreshStats();
      
      // Set up interval
      interval = setInterval(refreshStats, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showVisitorStats]);

  // Filter celebrities based on search and filters
  useEffect(() => {
    let filtered = celebrities.filter(celebrity => {
      const matchesSearch = celebrity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           celebrity.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || celebrity.category === selectedCategory;
      
      const matchesAvailability = availabilityFilter === 'All' ||
                                 (availabilityFilter === 'Available' && celebrity.available) ||
                                 (availabilityFilter === 'Sold Out' && !celebrity.available);
      
      return matchesSearch && matchesCategory && matchesAvailability;
    });
    setFilteredCelebrities(filtered);
  }, [searchTerm, selectedCategory, availabilityFilter, celebrities]);

  // Load acting coaches from separate localStorage
  useEffect(() => {
    const savedActingCoaches = localStorage.getItem('actingCoaches');
    if (savedActingCoaches) {
      const parsed = JSON.parse(savedActingCoaches);
      setActingCoaches(parsed);
    }
  }, []);

  // Save acting coaches to separate localStorage
  useEffect(() => {
    if (actingCoaches.length > 0) {
      localStorage.setItem('actingCoaches', JSON.stringify(actingCoaches));
    }
  }, [actingCoaches]);

  // Filter acting coaches based on search
  useEffect(() => {
    let filtered = actingCoaches.filter(coach => {
      const matchesSearch = coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           coach.class_type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesAvailability = availabilityFilter === 'All' ||
                                 (availabilityFilter === 'Available' && coach.available) ||
                                 (availabilityFilter === 'Sold Out' && !coach.available);
      
      return matchesSearch && matchesAvailability;
    });
    setFilteredActingCoaches(filtered);
  }, [searchTerm, availabilityFilter, actingCoaches]);

  // Load personalized videos from separate localStorage
  useEffect(() => {
    const savedPersonalizedVideos = localStorage.getItem('celebrities');
    if (savedPersonalizedVideos) {
      const parsed = JSON.parse(savedPersonalizedVideos);
      setPersonalizedVideos(parsed);
    }
  }, []);

  // Save personalized videos to separate localStorage
  useEffect(() => {
    if (personalizedVideos.length > 0) {
      localStorage.setItem('celebrities', JSON.stringify(personalizedVideos));
    }
  }, [personalizedVideos]);

  // Filter personalized videos based on search
  useEffect(() => {
    let filtered = personalizedVideos.filter(video => {
      const matchesSearch = video.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           video.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || video.category === selectedCategory;
      
      const matchesAvailability = availabilityFilter === 'All' ||
                                 (availabilityFilter === 'Available' && video.available) ||
                                 (availabilityFilter === 'Sold Out' && !video.available);
      
      return matchesSearch && matchesCategory && matchesAvailability;
    });
    setFilteredPersonalizedVideos(filtered);
  }, [searchTerm, selectedCategory, availabilityFilter, personalizedVideos]);

  // Save celebrities to localStorage whenever celebrities state changes
  useEffect(() => {
    if (celebrities.length > 0) {
      localStorage.setItem('celebrities', JSON.stringify(celebrities));
    }
  }, [celebrities]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Invalid credentials! Use username: admin, password: admin123');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  const handleImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        if (isEditing) {
          setEditingCelebrity({ ...editingCelebrity, image: imageUrl });
        } else {
          setNewCelebrity({ ...newCelebrity, image: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const addCelebrity = (e) => {
    e.preventDefault();
    const id = Date.now();
    const celebrity = {
      ...newCelebrity,
      id,
      price: parseInt(newCelebrity.price)
    };
    setCelebrities([...celebrities, celebrity]);
    setNewCelebrity({
      name: '',
      category: 'Music',
      price: '',
      available: true,
      image: null,
      // Add the missing acting coach fields
      is_acting_coach: false,
      class_type: 'Pre-recorded',
      class_price: '',
      class_duration: '',
      class_description: ''
    });
    setShowAddForm(false);
  };

  const updateCelebrity = (e) => {
    e.preventDefault();
    setCelebrities(celebrities.map(celeb => 
      celeb.id === editingCelebrity.id 
        ? { 
            ...editingCelebrity, 
            price: parseInt(editingCelebrity.price),
            // Ensure acting coach numeric fields are properly converted
            class_price: editingCelebrity.class_price ? parseInt(editingCelebrity.class_price) : '',
            // Ensure boolean field is properly handled
            is_acting_coach: Boolean(editingCelebrity.is_acting_coach)
          }
        : celeb
    ));
    handleCloseEditModal();
  };

  // Add countdown state
  const [undoCountdown, setUndoCountdown] = useState(30);

  const deleteCelebrity = (id) => {
    if (window.confirm('Are you sure you want to delete this celebrity?')) {
      const celebrityToDelete = celebrities.find(celeb => celeb.id === id);
      setLastDeleted(celebrityToDelete);
      setCelebrities(celebrities.filter(celeb => celeb.id !== id));
      setShowUndo(true);
      setUndoCountdown(30);
      
      // Countdown timer
      const countdownInterval = setInterval(() => {
        setUndoCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowUndo(false);
            setLastDeleted(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Store interval ID to clear it if user clicks undo
      window.undoInterval = countdownInterval;
    }
  };
  
  const undoDelete = () => {
    if (lastDeleted) {
      setCelebrities([...celebrities, lastDeleted]);
      setLastDeleted(null);
      setShowUndo(false);
      // Clear the countdown interval
      if (window.undoInterval) {
        clearInterval(window.undoInterval);
      }
    }
  };

  const handleEditCelebrity = (celebrity) => {
    setScrollPosition(window.pageYOffset);
    setEditingCelebrity(celebrity);
    setModalJustOpened(true); // Mark that modal was just opened
  };

  const handleCloseEditModal = () => {
    setEditingCelebrity(null);
    setTimeout(() => {
      window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
    }, 100);
  };

  // Add this function for resetting to latest celebrities
  const resetToLatestCelebrities = () => {
    if (window.confirm('This will update your celebrity list to include all 100 default celebrities. Any custom celebrities you added will be preserved. Continue?')) {
      const currentCustomCelebrities = celebrities.filter(celeb => celeb.id > 1000); // Assuming custom celebrities have IDs > 1000
      const latestDefaults = getDefaultCelebrities();
      const updatedList = [...latestDefaults, ...currentCustomCelebrities];
      setCelebrities(updatedList);
      localStorage.setItem('celebrities', JSON.stringify(updatedList));
      alert('Celebrity list updated successfully! You now have all 100 celebrities.');
    }
  };

  const generateProfileIcon = (name, category) => {
    const firstLetter = name.charAt(0).toUpperCase();
    const colorSchemes = {
      'Music': ['#FF6B9D', '#C44569', '#F8B500', '#00D9FF', '#6C5CE7'],
      'Movies': ['#D63031', '#E74C3C', '#3498DB', '#9B59B6', '#E67E22'],
      'Sports': ['#FF9800', '#4CAF50', '#2196F3', '#FFC107', '#607D8B'],
      'TV': ['#F39C12', '#27AE60', '#E91E63', '#3498DB', '#9B59B6'],
      'Social Media': ['#4CAF50', '#2196F3', '#E91E63', '#FFC107', '#9C27B0'],
      'Acting': ['#8E44AD', '#3498DB', '#E74C3C', '#F39C12', '#27AE60']
    };
    
    const colors = colorSchemes[category] || colorSchemes['Acting'];
    const colorIndex = firstLetter.charCodeAt(0) % colors.length;
    const backgroundColor = colors[colorIndex];
    
    return { letter: firstLetter, backgroundColor };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setAvailabilityFilter('All');
  };

  // Personalized Video Management Functions
  const addPersonalizedVideo = (e) => {
    e.preventDefault();
    const id = Date.now();
    const video = {
      ...newPersonalizedVideo,
      id,
      price: parseInt(newPersonalizedVideo.price),
      rating: parseFloat(newPersonalizedVideo.rating),
      totalVideos: parseInt(newPersonalizedVideo.totalVideos)
    };
    setPersonalizedVideos([...personalizedVideos, video]);
    setNewPersonalizedVideo({
      name: '',
      category: 'Music',
      price: '',
      available: true,
      rating: 4.5,
      totalVideos: 0,
      responseTime: '24 hours',
      image: null
    });
    setShowAddPersonalizedVideoForm(false);
  };

  const updatePersonalizedVideo = (e) => {
    e.preventDefault();
    setPersonalizedVideos(personalizedVideos.map(video =>
      video.id === editingPersonalizedVideo.id
        ? {
            ...editingPersonalizedVideo,
            price: parseInt(editingPersonalizedVideo.price),
            rating: parseFloat(editingPersonalizedVideo.rating),
            totalVideos: parseInt(editingPersonalizedVideo.totalVideos)
          }
        : video
    ));
    setEditingPersonalizedVideo(null);
  };

  const deletePersonalizedVideo = (id) => {
    if (window.confirm('Are you sure you want to delete this personalized video celebrity?')) {
      setPersonalizedVideos(personalizedVideos.filter(video => video.id !== id));
    }
  };

  const handleEditPersonalizedVideo = (video) => {
    setEditingPersonalizedVideo(video);
  };

  const handlePersonalizedVideoImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        if (isEditing) {
          setEditingPersonalizedVideo({ ...editingPersonalizedVideo, image: imageUrl });
        } else {
          setNewPersonalizedVideo({ ...newPersonalizedVideo, image: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Acting Coach Management Functions
  const addActingCoach = (e) => {
    e.preventDefault();
    const id = Date.now();
    const coach = {
      ...newActingCoach,
      id,
      class_price: parseInt(newActingCoach.class_price)
    };
    setActingCoaches([...actingCoaches, coach]);
    setNewActingCoach({
      name: '',
      class_type: 'Pre-recorded',
      class_price: '',
      class_duration: '',
      class_description: '',
      available: true,
      image: null
    });
    setShowAddActingCoachForm(false);
  };

  const updateActingCoach = (e) => {
    e.preventDefault();
    setActingCoaches(actingCoaches.map(coach => 
      coach.id === editingActingCoach.id 
        ? { 
            ...editingActingCoach, 
            class_price: parseInt(editingActingCoach.class_price)
          }
        : coach
    ));
    setEditingActingCoach(null);
  };

  const deleteActingCoach = (id) => {
    if (window.confirm('Are you sure you want to delete this acting coach?')) {
      setActingCoaches(actingCoaches.filter(coach => coach.id !== id));
    }
  };

  const handleEditActingCoach = (coach) => {
    setEditingActingCoach(coach);
  };

  const handleActingCoachImageUpload = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        if (isEditing) {
          setEditingActingCoach({ ...editingActingCoach, image: imageUrl });
        } else {
          setNewActingCoach({ ...newActingCoach, image: imageUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Get unique categories for filter dropdown
  const categories = ['All', ...new Set(celebrities.map(celeb => celeb.category))];

  // Check if user was previously authenticated
  useEffect(() => {
    const authStatus = localStorage.getItem('adminAuth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h2>Admin Login</h2>
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="login-btn">Login</button>
          </form>
          <p className="login-hint">Hint: username: admin, password: admin123</p>
        </div>
      </div>
      );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Celebrity Management Dashboard</h1>
        <div className="header-actions">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      {/* New Navigation Tabs */}
      <div className="admin-navigation">
        <div className="nav-tabs">
          <button 
            onClick={() => {
              setShowVisitorStats(false);
              setShowBookings(false);
              setShowActingCoaches(false);
              setShowPersonalizedVideos(false);
            }}
            className={`nav-tab ${!showVisitorStats && !showBookings && !showActingCoaches && !showPersonalizedVideos ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Celebrities</span>
            <span className="nav-count">{celebrities.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowBookings(!showBookings);
              setShowVisitorStats(false);
              setShowActingCoaches(false);
              setShowPersonalizedVideos(false);
            }}
            className={`nav-tab ${showBookings ? 'active' : ''}`}
          >
            <span className="nav-icon">📅</span>
            <span className="nav-label">Bookings</span>
            <span className="nav-count">{bookings.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowActingCoaches(!showActingCoaches);
              setShowBookings(false);
              setShowVisitorStats(false);
              setShowPersonalizedVideos(false);
            }}
            className={`nav-tab ${showActingCoaches ? 'active' : ''}`}
          >
            <span className="nav-icon">🎭</span>
            <span className="nav-label">Acting Coaches</span>
            <span className="nav-count">{actingCoaches.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowPersonalizedVideos(!showPersonalizedVideos);
              setShowBookings(false);
              setShowVisitorStats(false);
              setShowActingCoaches(false);
            }}
            className={`nav-tab ${showPersonalizedVideos ? 'active' : ''}`}
          >
            <span className="nav-icon">🎬</span>
            <span className="nav-label">Video Messages</span>
            <span className="nav-count">{personalizedVideos.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowVisitorStats(!showVisitorStats);
              setShowBookings(false);
              setShowActingCoaches(false);
              setShowPersonalizedVideos(false);
            }}
            className={`nav-tab ${showVisitorStats ? 'active' : ''}`}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-label">Analytics</span>
            <span className="nav-count">{visitorStats?.totalVisitors || 0}</span>
          </button>
        </div>
      </div>

      {/* Professional Undo Notification */}
      {showUndo && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '16px 20px',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          zIndex: 9999,
          minWidth: '320px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{
                fontSize: '18px',
                fontWeight: '600'
              }}>Celebrity Deleted</span>
              <span style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500'
              }}>{undoCountdown}s</span>
            </div>
            <button 
              onClick={() => {
                setShowUndo(false);
                if (window.undoInterval) clearInterval(window.undoInterval);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '18px',
                cursor: 'pointer',
                padding: '4px'
              }}
            >×</button>
          </div>
          
          <div style={{
            fontSize: '14px',
            opacity: '0.9',
            marginBottom: '12px'
          }}>
            "{lastDeleted?.name}" has been removed
          </div>
          
          {/* Progress bar */}
          <div style={{
            width: '100%',
            height: '3px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '2px',
            marginBottom: '12px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${(undoCountdown / 30) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #ff6b6b, #feca57)',
              transition: 'width 1s linear',
              borderRadius: '2px'
            }}></div>
          </div>
          
          <button 
            onClick={undoDelete}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              width: '100%'
            }}
            onMouseOver={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.15)';
            }}
          >
            ↶ UNDO DELETE
          </button>
        </div>
      )}

      {!showBookings && !showVisitorStats && !showActingCoaches && !showPersonalizedVideos ? (
        <>
          <div className="admin-controls">
            <button 
              onClick={() => setShowAddForm(true)} 
              className="add-celebrity-btn"
            >
              Add New Celebrity
            </button>
            <button 
              onClick={resetToLatestCelebrities}
              className="btn btn-secondary"
              style={{ marginLeft: '10px' }}
            >
              Update to Latest Celebrity List (100)
            </button>
            <div className="stats">
              <span>Total Celebrities: {celebrities.length}</span>
              <span>Available: {celebrities.filter(c => c.available).length}</span>
              <span>Sold Out: {celebrities.filter(c => !c.available).length}</span>
              <span>Showing: {filteredCelebrities.length}</span>
            </div>
          </div>

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
        </>
      ) : showActingCoaches ? (
        <>
          <div className="admin-controls">
            <button 
              onClick={() => setShowAddActingCoachForm(true)} 
              className="add-celebrity-btn"
            >
              Add New Acting Coach
            </button>
          </div>

          {/* Add Acting Coach Form */}
          {showAddActingCoachForm && (
            <div className="modal">
              <div className="modal-content">
                <h3>Add New Acting Coach</h3>
                <form onSubmit={addActingCoach}>
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={newActingCoach.name}
                      onChange={(e) => setNewActingCoach({ ...newActingCoach, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Type:</label>
                    <select
                      value={newActingCoach.class_type}
                      onChange={(e) => setNewActingCoach({ ...newActingCoach, class_type: e.target.value })}
                    >
                      <option value="Pre-recorded">Pre-recorded</option>
                      <option value="Live 1-on-1">Live 1-on-1</option>
                      <option value="Group Class">Group Class</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Class Price ($):</label>
                    <input
                      type="number"
                      value={newActingCoach.class_price}
                      onChange={(e) => setNewActingCoach({ ...newActingCoach, class_price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Duration (minutes):</label>
                    <input
                      type="number"
                      value={newActingCoach.class_duration}
                      onChange={(e) => setNewActingCoach({ ...newActingCoach, class_duration: e.target.value })}
                      placeholder="e.g., 60"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Description:</label>
                    <textarea
                      value={newActingCoach.class_description}
                      onChange={(e) => setNewActingCoach({ ...newActingCoach, class_description: e.target.value })}
                      placeholder="Describe the acting class..."
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>Available:</label>
                    <input
                      type="checkbox"
                      checked={newActingCoach.available}
                      onChange={(e) => setNewActingCoach({ ...newActingCoach, available: e.target.checked })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleActingCoachImageUpload(e, false)}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-btn">Add Acting Coach</button>
                    <button type="button" onClick={() => setShowAddActingCoachForm(false)} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Acting Coach Modal */}
          {editingActingCoach && (
            <div className="modal">
              <div className="modal-content">
                <h3>Edit Acting Coach</h3>
                <form onSubmit={updateActingCoach}>
                  <div className="form-group">
                    <label>Name:</label>
                    <input
                      type="text"
                      value={editingActingCoach.name}
                      onChange={(e) => setEditingActingCoach({ ...editingActingCoach, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Type:</label>
                    <select
                      value={editingActingCoach.class_type}
                      onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_type: e.target.value })}
                    >
                      <option value="Pre-recorded">Pre-recorded</option>
                      <option value="Live 1-on-1">Live 1-on-1</option>
                      <option value="Group Class">Group Class</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Class Price ($):</label>
                    <input
                      type="number"
                      value={editingActingCoach.class_price}
                      onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_price: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Duration (minutes):</label>
                    <input
                      type="number"
                      value={editingActingCoach.class_duration}
                      onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_duration: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Description:</label>
                    <textarea
                      value={editingActingCoach.class_description}
                      onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_description: e.target.value })}
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label>Available:</label>
                    <input
                      type="checkbox"
                      checked={editingActingCoach.available}
                      onChange={(e) => setEditingActingCoach({ ...editingActingCoach, available: e.target.checked })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Profile Image:</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleActingCoachImageUpload(e, true)}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="save-btn">Update Acting Coach</button>
                    <button type="button" onClick={() => setEditingActingCoach(null)} className="cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Acting Coaches Table */}
          <div className="celebrities-table">
            <table>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Class Type</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredActingCoaches.map((coach) => (
                  <tr key={coach.id}>
                    <td>
                      {coach.image ? (
                        <img src={coach.image} alt={coach.name} className="table-image" />
                      ) : (
                        <div className="table-profile-icon" style={{
                          backgroundColor: generateProfileIcon(coach.name, 'Acting').backgroundColor,
                          color: 'white'
                        }}>
                          {generateProfileIcon(coach.name, 'Acting').letter}
                        </div>
                      )}
                    </td>
                    <td>{coach.name}</td>
                    <td>{coach.class_type}</td>
                    <td>${coach.class_price}</td>
                    <td>{coach.class_duration} min</td>
                    <td>
                      <span className={`status ${coach.available ? 'available' : 'sold-out'}`}>
                        {coach.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleEditActingCoach(coach)} 
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteActingCoach(coach.id)} 
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredActingCoaches.length === 0 && (
              <div className="no-results">
                <p>No acting coaches found.</p>
              </div>
            )}
          </div>
        </>
      ) : showPersonalizedVideos ? (
        <>
          <div className="admin-controls">
            <button 
              onClick={() => setShowAddPersonalizedVideoForm(true)} 
              className="add-celebrity-btn"
            >
              Add New Personalized Video Celebrity
            </button>
            <div className="stats">
              <span>Total Celebrities: {personalizedVideos.length}</span>
              <span>Available: {personalizedVideos.filter(v => v.available).length}</span>
              <span>Unavailable: {personalizedVideos.filter(v => !v.available).length}</span>
              <span>Showing: {filteredPersonalizedVideos.length}</span>
            </div>
          </div>

          {/* Add Personalized Video Form */}
          {showAddPersonalizedVideoForm && (
            <div className="modal-overlay" onClick={() => setShowAddPersonalizedVideoForm(false)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Add New Personalized Video Celebrity</h3>
                <form onSubmit={addPersonalizedVideo}>
                  <input
                    type="text"
                    placeholder="Celebrity Name"
                    value={newPersonalizedVideo.name}
                    onChange={(e) => setNewPersonalizedVideo({...newPersonalizedVideo, name: e.target.value})}
                    required
                  />
                  <select
                    value={newPersonalizedVideo.category}
                    onChange={(e) => setNewPersonalizedVideo({...newPersonalizedVideo, category: e.target.value})}
                  >
                    <option value="Music">Music</option>
                    <option value="Movies">Movies</option>
                    <option value="TV">TV</option>
                    <option value="Sports">Sports</option>
                    <option value="Comedy">Comedy</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    value={newPersonalizedVideo.price}
                    onChange={(e) => setNewPersonalizedVideo({...newPersonalizedVideo, price: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="Rating (1-5)"
                    value={newPersonalizedVideo.rating}
                    onChange={(e) => setNewPersonalizedVideo({...newPersonalizedVideo, rating: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Total Videos"
                    value={newPersonalizedVideo.totalVideos}
                    onChange={(e) => setNewPersonalizedVideo({...newPersonalizedVideo, totalVideos: e.target.value})}
                    required
                  />
                  <select
                    value={newPersonalizedVideo.responseTime}
                    onChange={(e) => setNewPersonalizedVideo({...newPersonalizedVideo, responseTime: e.target.value})}
                  >
                    <option value="24 hours">24 hours</option>
                    <option value="48 hours">48 hours</option>
                    <option value="72 hours">72 hours</option>
                  </select>
                  <label>
                    <input
                      type="checkbox"
                      checked={newPersonalizedVideo.available}
                      onChange={(e) => setNewPersonalizedVideo({...newPersonalizedVideo, available: e.target.checked})}
                    />
                    Available
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePersonalizedVideoImageUpload(e, false)}
                  />
                  {newPersonalizedVideo.image && (
                    <div className="form-group">
                      <label>Image Preview:</label>
                      <img 
                        src={newPersonalizedVideo.image} 
                        alt="Preview" 
                        className="image-preview"
                      />
                    </div>
                  )}
                  <div className="modal-actions">
                    <button type="button" onClick={() => setShowAddPersonalizedVideoForm(false)}>Cancel</button>
                    <button type="submit" className="save-btn">Add Celebrity</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Personalized Video Modal */}
          {editingPersonalizedVideo && (
            <div className="modal-overlay" onClick={() => setEditingPersonalizedVideo(null)}>
              <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>Edit Personalized Video Celebrity</h3>
                <form onSubmit={updatePersonalizedVideo}>
                  <input
                    type="text"
                    placeholder="Celebrity Name"
                    value={editingPersonalizedVideo.name}
                    onChange={(e) => setEditingPersonalizedVideo({...editingPersonalizedVideo, name: e.target.value})}
                    required
                  />
                  <select
                    value={editingPersonalizedVideo.category}
                    onChange={(e) => setEditingPersonalizedVideo({...editingPersonalizedVideo, category: e.target.value})}
                  >
                    <option value="Music">Music</option>
                    <option value="Movies">Movies</option>
                    <option value="TV">TV</option>
                    <option value="Sports">Sports</option>
                    <option value="Comedy">Comedy</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Price"
                    value={editingPersonalizedVideo.price}
                    onChange={(e) => setEditingPersonalizedVideo({...editingPersonalizedVideo, price: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    placeholder="Rating (1-5)"
                    value={editingPersonalizedVideo.rating}
                    onChange={(e) => setEditingPersonalizedVideo({...editingPersonalizedVideo, rating: e.target.value})}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Total Videos"
                    value={editingPersonalizedVideo.totalVideos}
                    onChange={(e) => setEditingPersonalizedVideo({...editingPersonalizedVideo, totalVideos: e.target.value})}
                    required
                  />
                  <select
                    value={editingPersonalizedVideo.responseTime}
                    onChange={(e) => setEditingPersonalizedVideo({...editingPersonalizedVideo, responseTime: e.target.value})}
                  >
                    <option value="24 hours">24 hours</option>
                    <option value="48 hours">48 hours</option>
                    <option value="72 hours">72 hours</option>
                  </select>
                  <label>
                    <input
                      type="checkbox"
                      checked={editingPersonalizedVideo.available}
                      onChange={(e) => setEditingPersonalizedVideo({...editingPersonalizedVideo, available: e.target.checked})}
                    />
                    Available
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePersonalizedVideoImageUpload(e, true)}
                  />
                  {editingPersonalizedVideo.image && (
                    <div className="form-group">
                      <label>Image Preview:</label>
                      <img 
                        src={editingPersonalizedVideo.image} 
                        alt="Preview" 
                        className="image-preview"
                      />
                    </div>
                  )}
                  <div className="modal-actions">
                    <button type="button" onClick={() => setEditingPersonalizedVideo(null)}>Cancel</button>
                    <button type="submit" className="save-btn">Update Celebrity</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Personalized Videos Table */}
          <div className="celebrities-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Rating</th>
                  <th>Total Videos</th>
                  <th>Response Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonalizedVideos.map((video) => (
                  <tr key={video.id}>
                    <td>{video.name}</td>
                    <td>{video.category}</td>
                    <td>${video.price}</td>
                    <td>★ {video.rating}</td>
                    <td>{video.totalVideos}</td>
                    <td>{video.responseTime}</td>
                    <td>
                      <span className={`status ${video.available ? 'available' : 'unavailable'}`}>
                        {video.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => handleEditPersonalizedVideo(video)} className="edit-btn">Edit</button>
                      <button onClick={() => deletePersonalizedVideo(video.id)} className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPersonalizedVideos.length === 0 && (
              <div className="no-data">
                <p>No personalized video celebrities found.</p>
              </div>
            )}
          </div>
        </>
      ) : showVisitorStats ? (
        <div className="visitor-stats-section">
          <div className="stats-header">
            <h2>Visitor Analytics Dashboard</h2>
            <button 
              onClick={async () => {
                try {
                  const stats = await visitorTracker.getCombinedStats();
                  setVisitorStats(stats);
                } catch (error) {
                  console.error('Failed to refresh visitor stats:', error);
                  // Fallback to regular stats
                  const fallbackStats = visitorTracker.getVisitorStats();
                  setVisitorStats(fallbackStats);
                }
              }}
              className="refresh-btn"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.64A9 9 0 0 1 3.51 15" />
              </svg>
              Refresh Data
            </button>
          </div>
          
          <LiveVisitorTracker />
          
          {visitorStats ? (
            <div className="stats-grid">
              <div className="stat-card primary">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>Total Visitors</h3>
                  <p className="stat-number">{visitorStats.totalVisitors || 0}</p>
                  <span className="stat-label">Unique visitors</span>
                </div>
              </div>
              <div className="stat-card secondary">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>Total Visits</h3>
                  <p className="stat-number">{visitorStats.totalVisits || 0}</p>
                  <span className="stat-label">Page views</span>
                </div>
              </div>
              <div className="stat-card tertiary">
                <div className="stat-icon">⏱️</div>
                <div className="stat-content">
                  <h3>Avg. Session Time</h3>
                  <p className="stat-number">{visitorStats.averageTimeOnSite || 0}s</p>
                  <span className="stat-label">Time on site</span>
                </div>
              </div>
              <div className="stat-card quaternary">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>Bounce Rate</h3>
                  <p className="stat-number">{visitorStats.bounceRate || 0}%</p>
                  <span className="stat-label">Single page visits</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-stats">
              <p>Loading visitor statistics...</p>
              <button 
                onClick={() => {
                  const stats = visitorTracker.getVisitorStats();
                  setVisitorStats(stats);
                }}
                className="load-stats-btn"
              >
                Load Stats
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bookings-section">
          <h2>Booking Management</h2>
          <div className="bookings-stats">
            <span>Total Bookings: {bookings.length}</span>
            <span>Pending: {bookings.filter(b => b.status === 'pending').length}</span>
            <span>Confirmed: {bookings.filter(b => b.status === 'confirmed').length}</span>
          </div>
          
          <div className="bookings-table">
            <table>
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Celebrity</th>
                  <th>Date & Time</th>
                  <th>Package</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>
                      <div className="booking-id-cell">
                        <span>{booking.id}</span>
                        <button 
                          onClick={() => copyToClipboard(booking.id)}
                          className="copy-btn"
                          title="Copy Booking ID"
                        >
                          📋
                        </button>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>
                          {booking.formData?.firstName || booking.firstName || 'N/A'} {booking.formData?.lastName || booking.lastName || 'N/A'}
                        </strong>
                        <br />
                        <small>{booking.formData?.email || booking.email || 'N/A'}</small>
                      </div>
                    </td>
                    <td>{booking.celebrity?.name || 'N/A'}</td>
                    <td>
                      {booking.formData?.date || booking.date || 'N/A'} at {booking.formData?.time || booking.time || 'N/A'}
                    </td>
                    <td>{booking.formData?.package || booking.package || booking.podcastType || 'N/A'}</td>
                    <td>${booking.total || booking.price || 0}</td>
                    <td>
                      <span className={`status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <button className="view-btn">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {bookings.length === 0 && (
              <div className="no-bookings">
                <p>No bookings found.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Celebrity Form */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Celebrity</h3>
            <form onSubmit={addCelebrity}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newCelebrity.name}
                  onChange={(e) => setNewCelebrity({ ...newCelebrity, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={newCelebrity.category}
                  onChange={(e) => setNewCelebrity({ ...newCelebrity, category: e.target.value })}
                >
                  <option value="Music">Music</option>
                  <option value="Movies">Movies</option>
                  <option value="Sports">Sports</option>
                  <option value="TV">TV</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price ($):</label>
                <input
                  type="number"
                  value={newCelebrity.price}
                  onChange={(e) => setNewCelebrity({ ...newCelebrity, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Available:</label>
                <input
                  type="checkbox"
                  checked={newCelebrity.available}
                  onChange={(e) => setNewCelebrity({ ...newCelebrity, available: e.target.checked })}
                />
              </div>
              <div className="form-group">
                <label>Profile Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, false)}
                />
                {newCelebrity.image && (
                  <img src={newCelebrity.image} alt="Preview" className="image-preview" />
                )}
              </div>
              
              {/* Acting Coach Section */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={newCelebrity.is_acting_coach}
                    onChange={(e) => setNewCelebrity({ ...newCelebrity, is_acting_coach: e.target.checked })}
                  />
                  Is Acting Coach
                </label>
              </div>
              
              {/* Show acting coach fields only if is_acting_coach is true */}
              {newCelebrity.is_acting_coach && (
                <>
                  <div className="form-group">
                    <label>Class Type:</label>
                    <select
                      value={newCelebrity.class_type}
                      onChange={(e) => setNewCelebrity({ ...newCelebrity, class_type: e.target.value })}
                    >
                      <option value="Pre-recorded">Pre-recorded</option>
                      <option value="Live 1-on-1">Live 1-on-1</option>
                      <option value="Group Class">Group Class</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Class Price ($):</label>
                    <input
                      type="number"
                      value={newCelebrity.class_price}
                      onChange={(e) => setNewCelebrity({ ...newCelebrity, class_price: e.target.value })}
                      placeholder="e.g., 150"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Duration (minutes):</label>
                    <input
                      type="number"
                      value={newCelebrity.class_duration}
                      onChange={(e) => setNewCelebrity({ ...newCelebrity, class_duration: e.target.value })}
                      placeholder="e.g., 60"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Description:</label>
                    <textarea
                      value={newCelebrity.class_description}
                      onChange={(e) => setNewCelebrity({ ...newCelebrity, class_description: e.target.value })}
                      placeholder="Describe the acting class, teaching style, experience level, etc."
                      rows="4"
                    />
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Add Celebrity</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Celebrity Form */}
      {editingCelebrity && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Edit Celebrity</h3>
            <form onSubmit={updateCelebrity}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editingCelebrity.name}
                  onChange={(e) => setEditingCelebrity({ ...editingCelebrity, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category:</label>
                <select
                  value={editingCelebrity.category}
                  onChange={(e) => setEditingCelebrity({ ...editingCelebrity, category: e.target.value })}
                >
                  <option value="Music">Music</option>
                  <option value="Movies">Movies</option>
                  <option value="Sports">Sports</option>
                  <option value="TV">TV</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>
              <div className="form-group">
                <label>Price ($):</label>
                <input
                  type="number"
                  value={editingCelebrity.price}
                  onChange={(e) => setEditingCelebrity({ ...editingCelebrity, price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Available:</label>
                <input
                  type="checkbox"
                  checked={editingCelebrity.available}
                  onChange={(e) => setEditingCelebrity({ ...editingCelebrity, available: e.target.checked })}
                />
              </div>
              <div className="form-group">
                <label>Profile Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, true)}
                />
                {editingCelebrity.image ? (
                  <img src={editingCelebrity.image} alt="Preview" className="image-preview" />
                ) : (
                  <div className="profile-icon-preview" style={{
                    backgroundColor: generateProfileIcon(editingCelebrity.name, editingCelebrity.category).backgroundColor,
                    color: 'white'
                  }}>
                    {generateProfileIcon(editingCelebrity.name, editingCelebrity.category).letter}
                  </div>
                )}
              </div>
              
              {/* Acting Coach Section */}
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={editingCelebrity.is_acting_coach || false}
                    onChange={(e) => setEditingCelebrity({ ...editingCelebrity, is_acting_coach: e.target.checked })}
                  />
                  Is Acting Coach
                </label>
              </div>
              
              {/* Show acting coach fields only if is_acting_coach is true */}
              {editingCelebrity.is_acting_coach && (
                <>
                  <div className="form-group">
                    <label>Class Type:</label>
                    <select
                      value={editingCelebrity.class_type || 'Pre-recorded'}
                      onChange={(e) => setEditingCelebrity({ ...editingCelebrity, class_type: e.target.value })}
                    >
                      <option value="Pre-recorded">Pre-recorded</option>
                      <option value="Live 1-on-1">Live 1-on-1</option>
                      <option value="Group Class">Group Class</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Class Price ($):</label>
                    <input
                      type="number"
                      value={editingCelebrity.class_price || ''}
                      onChange={(e) => setEditingCelebrity({ ...editingCelebrity, class_price: e.target.value })}
                      placeholder="e.g., 150"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Duration (minutes):</label>
                    <input
                      type="number"
                      value={editingCelebrity.class_duration || ''}
                      onChange={(e) => setEditingCelebrity({ ...editingCelebrity, class_duration: e.target.value })}
                      placeholder="e.g., 60"
                    />
                  </div>
                  <div className="form-group">
                    <label>Class Description:</label>
                    <textarea
                      value={editingCelebrity.class_description || ''}
                      onChange={(e) => setEditingCelebrity({ ...editingCelebrity, class_description: e.target.value })}
                      placeholder="Describe the acting class, teaching style, experience level, etc."
                      rows="4"
                    />
                  </div>
                </>
              )}
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Update Celebrity</button>
                <button type="button" onClick={handleCloseEditModal} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Acting Coach Form */}
      {showAddActingCoachForm && (
        <div className="modal-overlay" onClick={() => setShowAddActingCoachForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add New Acting Coach</h3>
            <form onSubmit={addActingCoach}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={newActingCoach.name}
                  onChange={(e) => setNewActingCoach({ ...newActingCoach, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Class Type:</label>
                <select
                  value={newActingCoach.class_type}
                  onChange={(e) => setNewActingCoach({ ...newActingCoach, class_type: e.target.value })}
                >
                  <option value="Pre-recorded">Pre-recorded</option>
                  <option value="Live 1-on-1">Live 1-on-1</option>
                  <option value="Group Class">Group Class</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
              <div className="form-group">
                <label>Class Price ($):</label>
                <input
                  type="number"
                  value={newActingCoach.class_price}
                  onChange={(e) => setNewActingCoach({ ...newActingCoach, class_price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Class Duration (minutes):</label>
                <input
                  type="number"
                  value={newActingCoach.class_duration}
                  onChange={(e) => setNewActingCoach({ ...newActingCoach, class_duration: e.target.value })}
                  placeholder="e.g., 60"
                />
              </div>
              <div className="form-group">
                <label>Class Description:</label>
                <textarea
                  value={newActingCoach.class_description}
                  onChange={(e) => setNewActingCoach({ ...newActingCoach, class_description: e.target.value })}
                  placeholder="Describe the acting class, teaching style, experience level, etc."
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Available:</label>
                <input
                  type="checkbox"
                  checked={newActingCoach.available}
                  onChange={(e) => setNewActingCoach({ ...newActingCoach, available: e.target.checked })}
                />
              </div>
              <div className="form-group">
                <label>Profile Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleActingCoachImageUpload(e, false)}
                />
                {newActingCoach.image && (
                  <img src={newActingCoach.image} alt="Preview" className="image-preview" />
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Add Acting Coach</button>
                <button type="button" onClick={() => setShowAddActingCoachForm(false)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Acting Coach Form */}
      {editingActingCoach && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Acting Coach</h3>
            <form onSubmit={updateActingCoach}>
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editingActingCoach.name}
                  onChange={(e) => setEditingActingCoach({ ...editingActingCoach, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Class Type:</label>
                <select
                  value={editingActingCoach.class_type}
                  onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_type: e.target.value })}
                >
                  <option value="Pre-recorded">Pre-recorded</option>
                  <option value="Live 1-on-1">Live 1-on-1</option>
                  <option value="Group Class">Group Class</option>
                  <option value="Workshop">Workshop</option>
                </select>
              </div>
              <div className="form-group">
                <label>Class Price ($):</label>
                <input
                  type="number"
                  value={editingActingCoach.class_price}
                  onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_price: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Class Duration (minutes):</label>
                <input
                  type="number"
                  value={editingActingCoach.class_duration}
                  onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_duration: e.target.value })}
                  placeholder="e.g., 60"
                />
              </div>
              <div className="form-group">
                <label>Class Description:</label>
                <textarea
                  value={editingActingCoach.class_description}
                  onChange={(e) => setEditingActingCoach({ ...editingActingCoach, class_description: e.target.value })}
                  placeholder="Describe the acting class, teaching style, experience level, etc."
                  rows="4"
                />
              </div>
              <div className="form-group">
                <label>Available:</label>
                <input
                  type="checkbox"
                  checked={editingActingCoach.available}
                  onChange={(e) => setEditingActingCoach({ ...editingActingCoach, available: e.target.checked })}
                />
              </div>
              <div className="form-group">
                <label>Profile Image:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleActingCoachImageUpload(e, true)}
                />
                {editingActingCoach.image ? (
                  <img src={editingActingCoach.image} alt="Preview" className="image-preview" />
                ) : (
                  <div className="profile-icon-preview" style={{
                    backgroundColor: generateProfileIcon(editingActingCoach.name, 'Acting').backgroundColor,
                    color: 'white'
                  }}>
                    {generateProfileIcon(editingActingCoach.name, 'Acting').letter}
                  </div>
                )}
              </div>
              
              <div className="form-actions">
                <button type="submit" className="save-btn">Update Acting Coach</button>
                <button type="button" onClick={() => setEditingActingCoach(null)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Celebrities Table */}
      {!showBookings && !showActingCoaches && (
        <div className="celebrities-table">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCelebrities.map((celebrity) => (
                <tr key={celebrity.id}>
                  <td>
                    {celebrity.image ? (
                      <img src={celebrity.image} alt={celebrity.name} className="table-image" />
                      
                    ) : (
                      
                      <div className="table-profile-icon" style={{
                        backgroundColor: generateProfileIcon(celebrity.name, celebrity.category).backgroundColor,
                        color: 'white'
                      }}>
                        {generateProfileIcon(celebrity.name, celebrity.category).letter}
                      </div>
                    )}
                  </td>
                  <td>{celebrity.name}</td>
                  <td>{celebrity.category}</td>
                  <td>${celebrity.price}</td>
                  <td>
                    <span className={`status ${celebrity.available ? 'available' : 'sold-out'}`}>
                      {celebrity.available ? 'Available' : 'Sold Out'}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleEditCelebrity(celebrity)} 
                      className="edit-btn"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteCelebrity(celebrity.id)} 
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredCelebrities.length === 0 && (
            <div className="no-results">
              <p>No celebrities found matching your criteria.</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminPage;



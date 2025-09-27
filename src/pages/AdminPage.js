import React, { useState, useEffect } from 'react';
import './AdminPage.css';
import '../styles/ModernTable.css';
import '../styles/UserSidebar.css';
import '../styles/PaymentsTable.css';
import visitorTracker from '../services/visitorTracker';
import LiveVisitorTracker from '../components/LiveVisitorTracker';
import { db } from '../services/firebase';
import { collection, getDocs, doc, updateDoc, query, where, addDoc, getDoc, deleteDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import authService from '../services/authService';
import { migrateActingCoachesToFirebase, refreshActingCoachesFromFirebase } from '../utils/migrateActingCoaches';
import { createAdminUser } from '../utils/createAdminUser';
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
  // Test function to manually refresh pending payments
  window.testLoadPendingPayments = async () => {
    try {
      const donationsCollection = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsCollection);
      const allDonations = donationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Loading all donations from Firebase
      
      const pendingDonations = allDonations.filter(donation => 
        donation.status === 'pending' || 
        donation.status === 'pending_payment' || 
        donation.status === 'pending_bitcoin_payment'
      );
      
      // Filtering pending donations
      return { allDonations, pendingDonations };
    } catch (error) {
      console.error('Test load failed:', error);
      return { error: error.message };
    }
  };

  // Clean up old localStorage data on component mount
  const cleanupOldData = () => {
    try {
      const currentTime = Date.now();
      const thirtyDaysAgo = currentTime - (30 * 24 * 60 * 60 * 1000); // 30 days in milliseconds
      
      // Note: Bookings are now managed exclusively through Firebase database
      
      // Clean old booking drafts
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('booking-draft-')) {
          const draftData = localStorage.getItem(key);
          try {
            const draft = JSON.parse(draftData);
            if (draft.lastModified && new Date(draft.lastModified).getTime() < thirtyDaysAgo) {
              localStorage.removeItem(key);
            }
          } catch (e) {
            // Remove invalid draft data
            localStorage.removeItem(key);
          }
        }
      });
      
      // Clean old payment debug logs
      const debugLogs = JSON.parse(localStorage.getItem('paymentDebugLogs') || '[]');
      const recentLogs = debugLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime();
        return logTime > thirtyDaysAgo;
      });
      
      if (recentLogs.length !== debugLogs.length) {
        localStorage.setItem('paymentDebugLogs', JSON.stringify(recentLogs));
      }
      
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
    }
  };
  
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

  // Migration state
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState('');

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

  // USER MANAGEMENT STATE VARIABLES:
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUsers, setShowUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  // PAYMENT CONFIRMATION STATE VARIABLES:
  const [pendingPayments, setPendingPayments] = useState([]);
  const [filteredPendingPayments, setFilteredPendingPayments] = useState([]);
  // Initialize recently confirmed payments from localStorage to persist across refreshes
  const [recentlyConfirmedPayments, setRecentlyConfirmedPayments] = useState(() => {
    try {
      const stored = localStorage.getItem('recentlyConfirmedPayments');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only keep payments confirmed in the last 24 hours to prevent reappearance
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        const filtered = parsed.filter(item => item.timestamp > twentyFourHoursAgo);
        return new Set(filtered.map(item => item.paymentId));
      }
    } catch (error) {
      console.error('Error loading recently confirmed payments from localStorage:', error);
    }
    return new Set();
  });
  const [showPendingPayments, setShowPendingPayments] = useState(false);
  const [paymentSearchTerm, setPaymentSearchTerm] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [expandedUserRows, setExpandedUserRows] = useState(new Set());
  const [expandedPaymentRows, setExpandedPaymentRows] = useState(new Set());

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
    // Clean up old data first
    cleanupOldData();
    
    // Set up Firebase real-time listener for celebrities
    const unsubscribe = onSnapshot(
      collection(db, 'celebrities'),
      (snapshot) => {
        try {
          const firebaseCelebrities = snapshot.docs.map(doc => ({
            firebaseId: doc.id,
            ...doc.data()
          }));
          
          // Always start with existing celebrities (from localStorage or defaults)
          const savedCelebrities = localStorage.getItem('celebrities');
          let allCelebrities = [];
          
          if (savedCelebrities) {
            allCelebrities = JSON.parse(savedCelebrities);
          } else {
            // Initialize with default celebrities if none exist
            allCelebrities = getDefaultCelebrities();
          }
          
          // Add Firebase celebrities, avoiding duplicates
          if (firebaseCelebrities.length > 0) {
            firebaseCelebrities.forEach(fbCeleb => {
              const existsInLocal = allCelebrities.some(localCeleb => localCeleb.id === fbCeleb.id);
              if (!existsInLocal) {
                allCelebrities.push(fbCeleb);
              } else {
                // Update existing celebrity with Firebase data if it exists
                const index = allCelebrities.findIndex(localCeleb => localCeleb.id === fbCeleb.id);
                if (index !== -1) {
                  allCelebrities[index] = { ...allCelebrities[index], ...fbCeleb };
                }
              }
            });
          }
          
          setCelebrities(allCelebrities);
          localStorage.setItem('celebrities', JSON.stringify(allCelebrities));
        } catch (error) {
          console.error('Error processing Firebase celebrities:', error);
          // Fallback to localStorage on error
          const savedCelebrities = localStorage.getItem('celebrities');
          if (savedCelebrities) {
            const parsed = JSON.parse(savedCelebrities);
            setCelebrities(parsed);
          } else {
            const defaultCelebrities = getDefaultCelebrities();
            setCelebrities(defaultCelebrities);
            localStorage.setItem('celebrities', JSON.stringify(defaultCelebrities));
          }
        }
      },
      (error) => {
        console.error('Firebase listener error:', error);
        // Fallback to localStorage on listener error
        const savedCelebrities = localStorage.getItem('celebrities');
        if (savedCelebrities) {
          const parsed = JSON.parse(savedCelebrities);
          setCelebrities(parsed);
        } else {
          const defaultCelebrities = getDefaultCelebrities();
          setCelebrities(defaultCelebrities);
          localStorage.setItem('celebrities', JSON.stringify(defaultCelebrities));
        }
      }
    );

    // Load all bookings from both localStorage and Firebase
    loadAllBookings();
    
    // Load pending payments on component mount
    loadPendingPayments();
    
    // Cleanup function to unsubscribe from Firebase listener
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
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

  // Load acting coaches from Firebase and localStorage
  const loadActingCoaches = async () => {
    console.log('🔄 Loading acting coaches...');
    
    try {
      // Check Firebase configuration
      if (!db) {
        console.warn('⚠️ Firebase not configured, falling back to localStorage');
        throw new Error('Firebase not configured');
      }
      
      // Load from Firebase first
      console.log('📡 Attempting to load from Firebase...');
      const actingCoachesCollection = collection(db, 'actingCoaches');
      const querySnapshot = await getDocs(actingCoachesCollection);
      
      if (!querySnapshot.empty) {
        const firebaseCoaches = querySnapshot.docs.map(doc => ({
          firebaseId: doc.id,
          ...doc.data()
        }));
        console.log(`✅ Loaded ${firebaseCoaches.length} acting coaches from Firebase`);
        setActingCoaches(firebaseCoaches);
        // Sync to localStorage for offline access
        localStorage.setItem('actingCoaches', JSON.stringify(firebaseCoaches));
        return;
      } else {
        console.log('ℹ️ No acting coaches found in Firebase, checking localStorage...');
      }
    } catch (error) {
      console.error('❌ Error loading acting coaches from Firebase:', error);
      console.log('🔄 Falling back to localStorage...');
    }
    
    // Fallback to localStorage
    try {
      const savedActingCoaches = localStorage.getItem('actingCoaches');
      if (savedActingCoaches) {
        const parsed = JSON.parse(savedActingCoaches);
        console.log(`📱 Loaded ${parsed.length} acting coaches from localStorage`);
        setActingCoaches(parsed);
      } else {
        console.log('ℹ️ No acting coaches found in localStorage either');
        setActingCoaches([]);
      }
    } catch (error) {
      console.error('❌ Error loading from localStorage:', error);
      setActingCoaches([]);
    }
  };
  
  useEffect(() => {
    loadActingCoaches();
  }, [loadActingCoaches]);

  // Auto-sync acting coaches to localStorage when state changes
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
    const savedPersonalizedVideos = localStorage.getItem('personalizedVideos');
    if (savedPersonalizedVideos) {
      const parsed = JSON.parse(savedPersonalizedVideos);
      setPersonalizedVideos(parsed);
    } else {
      // Initialize with default celebrities for personalized videos if none exist
      const defaultCelebrities = getDefaultCelebrities();
      setPersonalizedVideos(defaultCelebrities);
      localStorage.setItem('personalizedVideos', JSON.stringify(defaultCelebrities));
    }
  }, []);

  // Save personalized videos to separate localStorage
  useEffect(() => {
    if (personalizedVideos.length > 0) {
      localStorage.setItem('personalizedVideos', JSON.stringify(personalizedVideos));
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

  const handleLogin = async (e) => {
    e.preventDefault();
    const adminUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'SecureAdminPass2024!';
    
    if (loginForm.username === adminUsername && loginForm.password === adminPassword) {
      try {
        // Also authenticate with Firebase using a dedicated admin email
        const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'admin@meetandgreet.com';
        const firebasePassword = process.env.REACT_APP_ADMIN_FIREBASE_PASSWORD || adminPassword;
        
        let result = await authService.login(adminEmail, firebasePassword);
        
        // If login fails, try to create the admin user
        if (!result.success && result.error.includes('user-not-found')) {
          console.log('🔄 Admin user not found, creating admin account...');
          const createResult = await createAdminUser();
          
          if (createResult.success) {
            console.log('✅ Admin user created, attempting login again...');
            result = await authService.login(adminEmail, firebasePassword);
          } else {
            console.error('❌ Failed to create admin user:', createResult.error);
          }
        }
        
        if (result.success) {
          console.log('✅ Admin authenticated with Firebase successfully');
        } else {
          console.warn('⚠️ Firebase authentication failed, but proceeding with local auth:', result.error);
        }
      } catch (error) {
        console.warn('⚠️ Firebase authentication error, but proceeding with local auth:', error);
      }
      
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Invalid credentials!');
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      console.log('Admin signed out from Firebase successfully');
    } catch (error) {
      console.warn('Firebase logout error:', error);
    }
    
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

  const addCelebrity = async (e) => {
    e.preventDefault();
    const id = Date.now();
    const celebrity = {
      ...newCelebrity,
      id,
      price: parseInt(newCelebrity.price)
    };
    
    // Update local state first for immediate UI feedback
    setCelebrities([...celebrities, celebrity]);
    
    // Save to Firebase for real-time synchronization
    try {
      await addDoc(collection(db, 'celebrities'), {
        ...celebrity,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Celebrity saved to Firebase successfully');
    } catch (error) {
      console.error('Error saving celebrity to Firebase:', error);
      // Don't fail the entire process if Firebase save fails
    }
    
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

  const updateCelebrity = async (e) => {
    e.preventDefault();
    const updatedCelebrity = {
      ...editingCelebrity, 
      price: parseInt(editingCelebrity.price),
      // Ensure acting coach numeric fields are properly converted
      class_price: editingCelebrity.class_price ? parseInt(editingCelebrity.class_price) : '',
      // Ensure boolean field is properly handled
      is_acting_coach: Boolean(editingCelebrity.is_acting_coach)
    };
    
    // Update local state first for immediate UI feedback
    setCelebrities(celebrities.map(celeb => 
      celeb.id === editingCelebrity.id ? updatedCelebrity : celeb
    ));
    
    // Update in Firebase for real-time synchronization
    try {
      const celebritiesQuery = query(
        collection(db, 'celebrities'),
        where('id', '==', editingCelebrity.id)
      );
      const querySnapshot = await getDocs(celebritiesQuery);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updatedCelebrity,
          updatedAt: new Date()
        });
        console.log('Celebrity updated in Firebase successfully');
      }
    } catch (error) {
      console.error('Error updating celebrity in Firebase:', error);
      // Don't fail the entire process if Firebase update fails
    }
    
    handleCloseEditModal();
  };

  // Add countdown state
  const [undoCountdown, setUndoCountdown] = useState(30);

  const deleteCelebrity = async (id) => {
    if (window.confirm('Are you sure you want to delete this celebrity?')) {
      const celebrityToDelete = celebrities.find(celeb => celeb.id === id);
      setLastDeleted(celebrityToDelete);
      setCelebrities(celebrities.filter(celeb => celeb.id !== id));
      setShowUndo(true);
      setUndoCountdown(30);
      
      // Delete from Firebase for real-time synchronization
      try {
        const celebritiesQuery = query(
          collection(db, 'celebrities'),
          where('id', '==', id)
        );
        const querySnapshot = await getDocs(celebritiesQuery);
        
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await deleteDoc(docRef);
          console.log('Celebrity deleted from Firebase successfully');
        }
      } catch (error) {
        console.error('Error deleting celebrity from Firebase:', error);
        // Don't fail the entire process if Firebase delete fails
      }
      
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
  
  const undoDelete = async () => {
    if (lastDeleted) {
      setCelebrities([...celebrities, lastDeleted]);
      
      // Restore to Firebase for real-time synchronization
      try {
        await addDoc(collection(db, 'celebrities'), {
          ...lastDeleted,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('Celebrity restored to Firebase successfully');
      } catch (error) {
        console.error('Error restoring celebrity to Firebase:', error);
        // Don't fail the entire process if Firebase restore fails
      }
      
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

  const toggleUserRow = (userId) => {
    const newExpanded = new Set(expandedUserRows);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUserRows(newExpanded);
  };

  const togglePaymentRow = (paymentId) => {
    const newExpanded = new Set(expandedPaymentRows);
    if (newExpanded.has(paymentId)) {
      newExpanded.delete(paymentId);
    } else {
      newExpanded.add(paymentId);
    }
    setExpandedPaymentRows(newExpanded);
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
  const addActingCoach = async (e) => {
    e.preventDefault();
    const id = Date.now();
    const coach = {
      ...newActingCoach,
      id,
      class_price: parseInt(newActingCoach.class_price),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      // Update local state first for immediate UI feedback
      setActingCoaches([...actingCoaches, coach]);
      
      // Save to Firebase for real-time synchronization
      await addDoc(collection(db, 'actingCoaches'), {
        ...coach,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Acting coach saved to Firebase successfully');
      
      // Also save to localStorage for backup/offline access
      const updatedCoaches = [...actingCoaches, coach];
      localStorage.setItem('actingCoaches', JSON.stringify(updatedCoaches));
      
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
      
      // Dispatch custom event to notify other components with detailed data
      window.dispatchEvent(new CustomEvent('actingCoachesUpdated', {
        detail: { coaches: updatedCoaches, action: 'add', newCoach: coach }
      }));
      
      // Force trigger storage-like event for same-window updates
      window.dispatchEvent(new CustomEvent('actingCoachesStorageUpdate', {
        detail: { coaches: updatedCoaches }
      }));
      
      alert('Acting coach added successfully!');
    } catch (error) {
      console.error('Error adding acting coach:', error);
      alert('Failed to add acting coach. Please try again.');
    }
  };

  const updateActingCoach = async (e) => {
    e.preventDefault();
    
    try {
      const updatedCoach = {
        ...editingActingCoach,
        class_price: parseInt(editingActingCoach.class_price),
        updatedAt: new Date().toISOString()
      };
      
      // Update local state first for immediate UI feedback
      setActingCoaches(actingCoaches.map(coach => 
        coach.id === editingActingCoach.id ? updatedCoach : coach
      ));
      
      // Update in Firebase for real-time synchronization
      const actingCoachesQuery = query(
        collection(db, 'actingCoaches'),
        where('id', '==', editingActingCoach.id)
      );
      const querySnapshot = await getDocs(actingCoachesQuery);
      
      if (!querySnapshot.empty) {
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, {
          ...updatedCoach,
          updatedAt: new Date()
        });
        console.log('Acting coach updated in Firebase successfully');
      }
      
      // Also update localStorage for backup/offline access
      const updatedCoaches = actingCoaches.map(coach => 
        coach.id === editingActingCoach.id ? updatedCoach : coach
      );
      localStorage.setItem('actingCoaches', JSON.stringify(updatedCoaches));
      
      setEditingActingCoach(null);
      
      // Dispatch custom event to notify other components with detailed data
      window.dispatchEvent(new CustomEvent('actingCoachesUpdated', {
        detail: { coaches: updatedCoaches, action: 'update', updatedCoach }
      }));
      
      // Force trigger storage-like event for same-window updates
      window.dispatchEvent(new CustomEvent('actingCoachesStorageUpdate', {
        detail: { coaches: updatedCoaches }
      }));
      
      alert('Acting coach updated successfully!');
    } catch (error) {
      console.error('Error updating acting coach:', error);
      alert('Failed to update acting coach. Please try again.');
    }
  };

  const deleteActingCoach = async (id) => {
    if (window.confirm('Are you sure you want to delete this acting coach?')) {
      try {
        // Update local state first for immediate UI feedback
        const updatedCoaches = actingCoaches.filter(coach => coach.id !== id);
        setActingCoaches(updatedCoaches);
        
        // Delete from Firebase for real-time synchronization
        const actingCoachesQuery = query(
          collection(db, 'actingCoaches'),
          where('id', '==', id)
        );
        const querySnapshot = await getDocs(actingCoachesQuery);
        
        if (!querySnapshot.empty) {
          const docRef = querySnapshot.docs[0].ref;
          await deleteDoc(docRef);
          console.log('Acting coach deleted from Firebase successfully');
        }
        
        // Also update localStorage for backup/offline access
        localStorage.setItem('actingCoaches', JSON.stringify(updatedCoaches));
        
        // Dispatch custom event to notify other components with detailed data
        window.dispatchEvent(new CustomEvent('actingCoachesUpdated', {
          detail: { coaches: updatedCoaches, action: 'delete', deletedId: id }
        }));
        
        // Force trigger storage-like event for same-window updates
        window.dispatchEvent(new CustomEvent('actingCoachesStorageUpdate', {
          detail: { coaches: updatedCoaches }
        }));
        
        alert('Acting coach deleted successfully!');
      } catch (error) {
        console.error('Error deleting acting coach:', error);
        alert('Failed to delete acting coach. Please try again.');
      }
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

  // MIGRATION FUNCTIONS
  const handleMigrateActingCoaches = async () => {
    setIsMigrating(true);
    setMigrationStatus('Starting migration...');
    
    try {
      const result = await migrateActingCoachesToFirebase();
      
      if (result.success) {
        setMigrationStatus(`✅ ${result.message}`);
        
        // Refresh the acting coaches data
        await loadActingCoaches();
        
        setTimeout(() => {
          setMigrationStatus('');
        }, 5000);
      } else {
        setMigrationStatus(`❌ ${result.message}`);
        setTimeout(() => {
          setMigrationStatus('');
        }, 10000);
      }
    } catch (error) {
      console.error('Migration error:', error);
      setMigrationStatus(`❌ Migration failed: ${error.message}`);
      setTimeout(() => {
        setMigrationStatus('');
      }, 10000);
    } finally {
      setIsMigrating(false);
    }
  };

  const handleRefreshFromFirebase = async () => {
    setIsMigrating(true);
    setMigrationStatus('Refreshing from Firebase...');
    
    try {
      const result = await refreshActingCoachesFromFirebase();
      
      if (result.success) {
        setMigrationStatus(`✅ ${result.message}`);
        
        // Update local state with fresh data
        setActingCoaches(result.coaches);
        setFilteredActingCoaches(result.coaches);
        
        setTimeout(() => {
          setMigrationStatus('');
        }, 5000);
      } else {
        setMigrationStatus(`❌ ${result.message}`);
        setTimeout(() => {
          setMigrationStatus('');
        }, 10000);
      }
    } catch (error) {
      console.error('Refresh error:', error);
      setMigrationStatus(`❌ Refresh failed: ${error.message}`);
      setTimeout(() => {
        setMigrationStatus('');
      }, 10000);
    } finally {
      setIsMigrating(false);
    }
  };

  // USER MANAGEMENT FUNCTIONS
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      
      if (usersSnapshot.empty) {
        console.warn('No users found in Firestore');
      }
      
      const usersList = await Promise.all(usersSnapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userData = {
          id: doc.id,
          ...data,
          // Handle both Timestamp and ISO string formats
          createdAt: data.createdAt?.toDate ? data.createdAt : data.createdAt
        };
        
        // Load user's bookings and donations
        try {
          // Load bookings
          const bookingsCollection = collection(db, 'bookings');
          const userBookingsQuery = query(
            bookingsCollection,
            where('userId', '==', doc.id)
          );
          const userBookingsSnapshot = await getDocs(userBookingsQuery);
          
          const userBookings = [];
          if (!userBookingsSnapshot.empty) {
            userBookingsSnapshot.docs.forEach(bookingDoc => {
              userBookings.push({
                id: bookingDoc.id,
                ...bookingDoc.data(),
                type: 'booking'
              });
            });
          }
          
          // Load donations
          const donationsCollection = collection(db, 'donations');
          const userDonationsQuery = query(
            donationsCollection,
            where('userId', '==', doc.id)
          );
          const userDonationsSnapshot = await getDocs(userDonationsQuery);
          
          const userDonations = [];
          if (!userDonationsSnapshot.empty) {
            userDonationsSnapshot.docs.forEach(donationDoc => {
              userDonations.push({
                id: donationDoc.id,
                ...donationDoc.data(),
                type: 'donation'
              });
            });
          }
          
          // Combine and sort all user activities
          const allUserActivities = [...userBookings, ...userDonations]
            .sort((a, b) => {
              const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
              const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
              return dateB - dateA;
            });
          
          userData.bookings = userBookings;
          userData.donations = userDonations;
          userData.allActivities = allUserActivities;
          
          if (allUserActivities.length > 0) {
            const latestActivity = allUserActivities[0];
            // Check both status and paymentStatus to determine the latest activity status
            // Priority: completed > confirmed > pending
            if (latestActivity.status === 'completed' || latestActivity.bookingStatus === 'completed') {
              userData.latestBookingStatus = 'completed';
            } else if (latestActivity.status === 'confirmed' || latestActivity.paymentStatus === 'confirmed') {
              userData.latestBookingStatus = 'confirmed';
            } else {
              userData.latestBookingStatus = latestActivity.paymentStatus || latestActivity.status || 'pending';
            }
            userData.hasBookings = true;
          } else {
            userData.latestBookingStatus = 'no-bookings';
            userData.hasBookings = false;
          }
        } catch (error) {
          console.error('Error loading user activities for user:', doc.id, error);
          userData.latestBookingStatus = 'error';
          userData.hasBookings = false;
          userData.bookings = [];
          userData.donations = [];
          userData.allActivities = [];
        }
        
        // User found in Firebase
        return userData;
      }));
      
      setUsers(usersList);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      
      // Provide specific troubleshooting based on error type
      if (error.code === 'permission-denied') {
        console.error('🚫 PERMISSION DENIED - Firestore security rules are blocking access');
        console.error('💡 SOLUTION: Update Firestore rules to allow read access');
      } else if (error.code === 'unavailable') {
        console.error('🌐 NETWORK ERROR - Cannot connect to Firestore');
        console.error('💡 SOLUTION: Check internet connection and Firebase config');
      }
      
      alert('Failed to load users from Firebase: ' + error.message + '\n\nCheck console for detailed troubleshooting.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const deleteUser = async (userId, userEmail) => {
    if (!window.confirm(`Are you sure you want to delete user ${userEmail}? This action cannot be undone and will remove all associated data including bookings.`)) {
      return;
    }

    try {
      // Deleting user from Firebase
      
      // Delete user account and all associated data
      const result = await authService.deleteUserAccount(userId);
      
      if (result.success) {
        // User deleted successfully
        alert('User account and all associated data have been deleted successfully.');
        
        // Refresh the users list
        await loadUsers();
        
        // Also refresh bookings and pending payments to reflect changes
        await loadAllBookings();
        await loadPendingPayments();
      } else {
        console.error('❌ Failed to delete user:', result.error);
        alert('Failed to delete user: ' + result.error);
      }
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('Error deleting user: ' + error.message);
    }
  };

  const loadAllBookings = async () => {
    try {
      // Load bookings from Firebase database
      const bookingsCollection = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsCollection);
      const firebaseBookings = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        type: doc.data().type || 'booking' // Ensure type is set
      }));
      
      // Load donations from Firebase database
      const donationsCollection = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsCollection);
      const firebaseDonations = donationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(),
        type: 'donation' // Mark as donation type
      }));
      
      // Show ALL bookings in the bookings tab as a complete history/database
      const allBookings = firebaseBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      // Update bookings with ALL bookings for complete history
      setBookings(allBookings);
      
      // Note: pendingPayments is handled by loadPendingPayments() function with proper filtering
      // Removed setPendingPayments from here to avoid conflicts with detailed filtering logic
      
      // Loaded bookings and donations from database
    } catch (error) {
      console.error('Error loading bookings from database:', error);
      // Set empty arrays if database fails
      setBookings([]);
      setPendingPayments([]);
    }
  };

  // Temporary function to reset all bookings to pending status
  // eslint-disable-next-line no-unused-vars
  const resetAllBookingsToPending = async () => {
    try {
      const bookingsCollection = collection(db, 'bookings');
      const allBookingsSnapshot = await getDocs(bookingsCollection);
      
      const updatePromises = allBookingsSnapshot.docs.map(async (docSnapshot) => {
        const bookingData = docSnapshot.data();
        if (bookingData.paymentStatus !== 'pending') {
          await updateDoc(doc(db, 'bookings', docSnapshot.id), {
            paymentStatus: 'pending'
          });
        }
      });
      
      await Promise.all(updatePromises);
      // All bookings reset to pending status
      
      // Reload data
      await loadAllBookings();
      await loadPendingPayments();
    } catch (error) {
      console.error('Error resetting bookings:', error);
    }
  };

  // Function to clear all existing pending payments from Firebase
  const clearAllPendingPayments = async () => {
    if (!window.confirm('Are you sure you want to DELETE ALL existing pending payments? This action cannot be undone!')) {
      return;
    }
    
    try {
      // Clear pending bookings
      const bookingsCollection = collection(db, 'bookings');
      const pendingQuery = query(
        bookingsCollection,
        where('paymentStatus', '==', 'pending')
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      
      const deleteBookingPromises = pendingSnapshot.docs.map(async (docSnapshot) => {
        await deleteDoc(doc(db, 'bookings', docSnapshot.id));
        // Deleted pending booking
      });
      
      // Clear pending donations
      const donationsCollection = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsCollection);
      const pendingDonations = donationsSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.status === 'pending' || data.status === 'pending_payment' || data.status === 'pending_bitcoin_payment';
      });
      
      const deleteDonationPromises = pendingDonations.map(async (docSnapshot) => {
        await deleteDoc(doc(db, 'donations', docSnapshot.id));
        // Deleted pending donation
      });
      
      await Promise.all([...deleteBookingPromises, ...deleteDonationPromises]);
      // Deleted pending bookings and donations from Firebase
      
      // Reload data
      await loadAllBookings();
      await loadPendingPayments();
      
      alert(`Successfully deleted ${pendingSnapshot.docs.length} pending bookings and ${pendingDonations.length} pending donations from Firebase`);
    } catch (error) {
      console.error('Error clearing pending payments:', error);
      alert('Error clearing pending payments. Check console for details.');
    }
  };
  
  // Function to remove duplicate donations from Firebase
  const removeDuplicateDonations = async () => {
    if (!window.confirm('Are you sure you want to remove duplicate donations? This will keep only the latest version of each duplicate.')) {
      return;
    }
    
    try {
      const donationsCollection = collection(db, 'donations');
      const donationsSnapshot = await getDocs(donationsCollection);
      const allDonations = donationsSnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      
      // Group donations by their original ID (like DONATE1756680388529)
      const donationGroups = {};
      allDonations.forEach(donation => {
        const originalId = donation.id || donation.docId;
        if (!donationGroups[originalId]) {
          donationGroups[originalId] = [];
        }
        donationGroups[originalId].push(donation);
      });
      
      // Find duplicates and mark older ones for deletion
      const toDelete = [];
      Object.values(donationGroups).forEach(group => {
        if (group.length > 1) {
          // Sort by creation date, keep the newest
          group.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
            return dateB - dateA;
          });
          
          // Mark all but the first (newest) for deletion
          for (let i = 1; i < group.length; i++) {
            toDelete.push(group[i].docId);
          }
        }
      });
      
      if (toDelete.length === 0) {
        alert('No duplicate donations found.');
        return;
      }
      
      // Delete duplicates
      const deletePromises = toDelete.map(async (docId) => {
        await deleteDoc(doc(db, 'donations', docId));
        // Deleted duplicate donation
      });
      
      await Promise.all(deletePromises);
      // Deleted duplicate donations from Firebase
      
      // Reload data
      await loadAllBookings();
      await loadPendingPayments();
      
      alert(`Successfully removed ${toDelete.length} duplicate donations from Firebase`);
    } catch (error) {
      console.error('Error removing duplicate donations:', error);
      alert('Error removing duplicate donations. Check console for details.');
    }
  };

  const loadPendingPayments = async (recentlyConfirmedSet = null) => {
    setLoadingPayments(true);
    try {
      // Loading pending payments
      
      // Load pending bookings using Firestore query for better performance and accuracy
      // Use multiple attempts to handle Firestore consistency issues
      let bookingsSnapshot;
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        attempts++;
        // Loading pending bookings
        
        const bookingsCollection = collection(db, 'bookings');
        const pendingBookingsQuery = query(bookingsCollection, where('paymentStatus', '==', 'pending'));
        bookingsSnapshot = await getDocs(pendingBookingsQuery);
        
        // Found pending bookings in Firestore
        
        // If this is not the first attempt, add a small delay
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        break; // For now, don't retry - just log the attempt
      }
      
      const firebaseBookings = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          type: data.type || 'booking'
        };
      }).filter(booking => {
        // Debug logging for each booking
        // Filtering booking data
        
        // Only include truly pending bookings - exclude confirmed and completed
        // If ANY status field indicates confirmation or completion, exclude the item
        const isConfirmed = booking.paymentStatus === 'confirmed' || 
                           booking.status === 'confirmed' || 
                           booking.bookingStatus === 'confirmed' ||
                           booking.confirmedAt;
        const isCompleted = booking.paymentStatus === 'completed' || 
                           booking.status === 'completed' || 
                           booking.bookingStatus === 'completed' ||
                           booking.completedAt;
        const isPending = booking.paymentStatus === 'pending' || 
                         booking.paymentStatus === 'submitted' || 
                         booking.paymentStatus === 'pending_payment' ||
                         booking.paymentStatus === 'pending_bitcoin_payment' ||
                         booking.status === 'pending' ||
                         booking.status === 'pending_payment';
        
        // Additional check for recently confirmed payments to prevent reappearing
        const confirmedSet = recentlyConfirmedSet || recentlyConfirmedPayments;
        const isRecentlyConfirmed = confirmedSet.has(booking.id) || 
                                   confirmedSet.has(booking.originalId) ||
                                   confirmedSet.has(booking.bookingId) ||
                                   (booking.paymentId && confirmedSet.has(booking.paymentId));
        
        const shouldInclude = !isConfirmed && !isCompleted && !isRecentlyConfirmed && isPending;
        
        // Booking filter result processed
        if (isRecentlyConfirmed) {
          // Excluding recently confirmed booking
          return false;
        }
        
        return shouldInclude;
      });
      
      // Load pending donations using Firestore query for better performance and accuracy
      const donationsCollection = collection(db, 'donations');
      const pendingDonationsQuery = query(donationsCollection, where('paymentStatus', '==', 'pending'));
      const donationsSnapshot = await getDocs(pendingDonationsQuery);
      // Found pending donations in Firestore
      const firebaseDonations = donationsSnapshot.docs
        .map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
            type: 'donation'
          };
        })
        .filter(donation => {
          // Debug logging for each donation
          // Filtering donation
          
          // Defensive filtering: exclude donations that are confirmed or completed in ANY way
          // Return false (exclude) if ANY of these conditions are true:
          if (donation.status === 'confirmed' || 
              donation.paymentStatus === 'confirmed' ||
              donation.status === 'completed' || 
              donation.paymentStatus === 'completed' ||
              donation.confirmedAt ||
              donation.completedAt) {
            // Excluding confirmed/completed donation
            return false;
          }
          
          // Only include if it has pending-like status
          const isPending = donation.status === 'pending' || 
                           donation.status === 'pending_payment' || 
                           donation.status === 'pending_bitcoin_payment' ||
                           donation.paymentStatus === 'pending' ||
                           donation.paymentStatus === 'pending_payment' ||
                           donation.paymentStatus === 'submitted';
          
          // Donation filter result processed
          
          // Additional filter: exclude recently confirmed payments
          const confirmedSet = recentlyConfirmedSet || recentlyConfirmedPayments;
          const isRecentlyConfirmed = confirmedSet.has(donation.id) || 
                                     confirmedSet.has(donation.donationId) ||
                                     (donation.paymentId && confirmedSet.has(donation.paymentId));
          if (isRecentlyConfirmed) {
            // Excluding recently confirmed donation
            return false;
          }
          
          return isPending;
        });
      
      // Enhanced duplicate removal logic - bookings and donations are already properly filtered
      const allPendingPayments = [...firebaseBookings, ...firebaseDonations];
      const uniquePayments = [];
      const seenIdentifiers = new Set();
      
      allPendingPayments.forEach(payment => {
        // Normalize ID to use Firestore document ID consistently
        // For donations, ensure we use the Firestore doc.id as the primary identifier
        if (payment.type === 'donation') {
          // The payment.id should already be the Firestore doc.id from the mapping above
          // But let's ensure consistency by logging any mismatches
          const firestoreDocId = payment.id; // This comes from doc.id in the mapping
          const originalDonationId = payment.donationId;
          
          if (originalDonationId && originalDonationId !== firestoreDocId) {
            // ID mismatch detected for donation
          }
          
          // Ensure the payment uses the Firestore doc ID as its primary ID
          payment.id = firestoreDocId;
        }
        
        // Create unique identifier based on multiple criteria
        const userEmail = payment.userEmail || payment.donorInfo?.email || payment.personalInfo?.email || payment.formData?.email;
        const amount = payment.amount || payment.total || payment.pricing?.total || 0;
        const campaignId = payment.campaign?.id || payment.celebrity?.id || 'unknown';
        const primaryId = payment.id; // Use the normalized Firestore doc ID
        
        // Create composite key for duplicate detection
        const uniqueKey = `${userEmail}-${amount}-${campaignId}-${payment.type}`;
        const timeKey = Math.floor(new Date(payment.createdAt).getTime() / 60000); // Group by minute
        const compositeKey = `${uniqueKey}-${timeKey}`;
        
        // Also check for exact ID matches using the primary ID
        const hasExactId = seenIdentifiers.has(primaryId);
        const hasCompositeMatch = seenIdentifiers.has(compositeKey);
        
        if (!hasExactId && !hasCompositeMatch) {
          uniquePayments.push(payment);
          seenIdentifiers.add(primaryId);
          seenIdentifiers.add(compositeKey);
        } else {
          // Duplicate payment filtered out
        }
      });
      
      // Sort by creation date
      const sortedPayments = uniquePayments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setPendingPayments(sortedPayments);
    } catch (error) {
      console.error('Error loading pending payments from database:', error);
      setPendingPayments([]);
    } finally {
      setLoadingPayments(false);
    }
  };

  // Notification function for payment approval
  const sendPaymentApprovalNotification = async (booking) => {
    try {
      // Add notification to Firebase for in-app notifications
      // Build notification data object conditionally
      const notificationData = {
        userId: booking.userId,
        type: 'payment_approved',
        title: 'Payment Approved!',
        message: booking.type === 'acting_class' 
          ? `Your payment for Acting Coach ${booking.actingCoach || booking.coach?.name || 'session'} has been approved. Your acting class booking is now confirmed!`
          : booking.type === 'promotion'
            ? `Your payment for ${booking.service?.title || booking.celebrity?.name || 'Brand Ambassador Program'} has been approved. Your promotion booking is now confirmed!`
            : `Your payment for ${booking.celebrity?.name || 'your booking'} has been approved. Your booking is now confirmed!`,
        bookingId: booking.id,
        data: {
          type: booking.type,
          bookingType: booking.type,
          ...(booking.type === 'acting_class' && {
            actingCoach: booking.actingCoach || booking.coach?.name,
            className: booking.className
          }),
          ...(booking.type === 'promotion' && {
            serviceTitle: booking.service?.title,
            promotionType: booking.service?.title || 'Brand Ambassador Program'
          }),
          ...(booking.celebrity?.name && {
            celebrityName: booking.celebrity?.name
          })
        },
        createdAt: new Date(),
        read: false
      };
      
      // Store notification in Firebase
      await addDoc(collection(db, 'notifications'), notificationData);
      
      // Payment approval notification sent successfully
    } catch (error) {
      console.error('Error sending payment approval notification:', error);
    }
  };

  // Notification function for order completion
  const sendOrderCompletionNotification = async (booking) => {
    try {
      // Add notification to Firebase for in-app notifications
      const notificationData = {
        userId: booking.userId,
        type: 'order_completed',
        title: 'Order Completed!',
        message: booking.type === 'acting_class' 
          ? `Your acting class with ${booking.actingCoach || booking.coach?.name || 'Acting Coach'} has been completed. Thank you for your booking!`
          : booking.type === 'promotion'
            ? `Your ${booking.service?.title || 'Brand Ambassador Program'} booking has been completed. Thank you for your order!`
            : `Your booking with ${booking.celebrity?.name || 'the celebrity'} has been completed. Thank you for your order!`,
        bookingId: booking.id,
        data: {
          type: booking.type,
          bookingType: booking.type,
          ...(booking.type === 'acting_class' && {
            actingCoach: booking.actingCoach || booking.coach?.name,
            className: booking.className
          }),
          ...(booking.type === 'promotion' && {
            serviceTitle: booking.service?.title,
            promotionType: booking.service?.title || 'Brand Ambassador Program'
          }),
          ...(booking.celebrity?.name && {
            celebrityName: booking.celebrity?.name
          })
        },
        createdAt: new Date(),
        read: false
      };
      
      // Store notification in Firebase
      await addDoc(collection(db, 'notifications'), notificationData);
      
      // Order completion notification sent successfully
    } catch (error) {
      console.error('Error sending order completion notification:', error);
    }
  };

  const confirmPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to approve this payment?')) return;
    
    try {
      // Attempting to approve payment
      
      // First, try to find the payment in bookings collection
      let paymentData = null;
      let isBooking = true;
      let actualDocId = paymentId;
      
      try {
        const bookingDoc = doc(db, 'bookings', paymentId);
        const bookingSnapshot = await getDoc(bookingDoc);
        if (bookingSnapshot.exists()) {
          paymentData = bookingSnapshot.data();
          // Found payment in bookings collection
        }
      } catch (error) {
        // Payment not found in bookings, checking donations
      }
      
      // If not found in bookings, check donations collection
      if (!paymentData) {
        try {
          const donationDoc = doc(db, 'donations', paymentId);
          const donationSnapshot = await getDoc(donationDoc);
          if (donationSnapshot.exists()) {
            paymentData = donationSnapshot.data();
            isBooking = false;
          }
        } catch (error) {
          // Payment not found in donations
        }
      }
      
      // If still not found, try to find by original ID in bookings collection
      if (!paymentData) {
        try {
          const bookingsCollection = collection(db, 'bookings');
          const bookingsSnapshot = await getDocs(bookingsCollection);
          
          for (const docSnapshot of bookingsSnapshot.docs) {
            const data = docSnapshot.data();
            if (data.id === paymentId || data.bookingId === paymentId) {
              paymentData = data;
              actualDocId = docSnapshot.id;
              isBooking = true;
              // Found booking by original ID
              break;
            }
          }
        } catch (error) {
          // Error searching bookings by original ID
        }
      }
      
      // If still not found, try to find by original donation ID in donations
      if (!paymentData) {
        try {
          // Searching donations by original ID
          const donationsCollection = collection(db, 'donations');
          const donationsSnapshot = await getDocs(donationsCollection);
          
          for (const docSnapshot of donationsSnapshot.docs) {
            const data = docSnapshot.data();
            if (data.id === paymentId || data.donationId === paymentId) {
              paymentData = data;
              actualDocId = docSnapshot.id;
              isBooking = false;
              // Found donation by original ID
              break;
            }
          }
        } catch (error) {
          // Error searching donations by original ID
        }
      }
      
      if (!paymentData) {
        console.error('Payment not found anywhere. ID searched:', paymentId);
        throw new Error('Payment not found in either bookings or donations collection');
      }
      
      // Found payment data
      
      // Update the appropriate collection using the correct document ID
      if (isBooking) {
        const bookingDoc = doc(db, 'bookings', actualDocId);
        const updateData = {
          paymentStatus: 'confirmed',
          bookingStatus: 'confirmed',
          status: 'confirmed',
          confirmedAt: new Date(),
          confirmedBy: 'admin'
        };
        // Updating booking with doc ID
        try {
          await updateDoc(bookingDoc, updateData);
          // Successfully updated booking
          
          // Verify the update
          const verifyDoc = await getDoc(bookingDoc);
          if (verifyDoc.exists()) {
            const verifiedData = verifyDoc.data();
            // Verified booking update
            if (verifiedData.paymentStatus !== 'confirmed') {
              throw new Error(`Update failed: paymentStatus is ${verifiedData.paymentStatus}, expected 'confirmed'`);
            }
          } else {
            throw new Error('Document not found after update');
          }
        } catch (updateError) {
          console.error('Failed to update booking:', updateError);
          throw updateError;
        }
      } else {
        const donationDoc = doc(db, 'donations', actualDocId);
        const updateData = {
          status: 'confirmed',
          paymentStatus: 'confirmed',
          confirmedAt: new Date(),
          confirmedBy: 'admin'
        };
        // Updating donation with doc ID
        try {
          await updateDoc(donationDoc, updateData);
          // Successfully updated donation
          
          // Verify the update
          const verifyDoc = await getDoc(donationDoc);
          if (verifyDoc.exists()) {
            const verifiedData = verifyDoc.data();
            // Verified donation update
            if (verifiedData.paymentStatus !== 'confirmed') {
              throw new Error(`Update failed: paymentStatus is ${verifiedData.paymentStatus}, expected 'confirmed'`);
            }
          } else {
            throw new Error('Document not found after update');
          }
        } catch (updateError) {
          console.error('Failed to update donation:', updateError);
          throw updateError;
        }
      }
      
      // Send notification to user
      if (paymentData) {
        await sendPaymentApprovalNotification({ id: paymentId, ...paymentData, type: isBooking ? 'booking' : 'donation' });
      }
      
      const paymentType = isBooking ? 'booking' : 'donation';
      alert(`${paymentType.charAt(0).toUpperCase() + paymentType.slice(1)} payment approved successfully! The ${paymentType} is now confirmed and notification sent to user.`);
      
      // Enhanced Firestore consistency handling with multiple verification attempts
      // Waiting for Firestore propagation with verification
      let verificationAttempts = 0;
      const maxVerificationAttempts = 5;
      let isConsistent = false;
      
      while (verificationAttempts < maxVerificationAttempts && !isConsistent) {
        verificationAttempts++;
        // Verification attempt in progress
        
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second intervals
        
        try {
          const verifyDoc = await getDoc(doc(db, isBooking ? 'bookings' : 'donations', actualDocId));
          if (verifyDoc.exists()) {
            const verifyData = verifyDoc.data();
            
            // Checking document state
            
            // Check if the document is consistently updated
            if (verifyData.paymentStatus === 'confirmed' && 
                verifyData.status === 'confirmed' && 
                verifyData.confirmedAt) {
              isConsistent = true;
              // Document consistency verified
            } else {
              // Document not yet consistent, retrying
            }
          }
        } catch (verifyError) {
          console.error(`Verification attempt ${verificationAttempts} failed:`, verifyError);
        }
      }
      
      if (!isConsistent) {
        console.warn('⚠️ Document consistency could not be verified after all attempts');
        console.warn('⚠️ Proceeding with data refresh despite potential inconsistency');
      }
      
      // Force clear pending payments cache first
      // Clearing pending payments cache before refresh
      setPendingPayments([]);
      
      // Add payment to recently confirmed list to prevent reappearance
      // Adding payment to recently confirmed list
      // Also add the actual document ID and any original booking ID to prevent reappearance
      const idsToTrack = [paymentId, actualDocId];
      if (paymentData.id && paymentData.id !== paymentId) {
        idsToTrack.push(paymentData.id);
      }
      if (paymentData.bookingId && paymentData.bookingId !== paymentId) {
        idsToTrack.push(paymentData.bookingId);
      }
      // Tracking IDs for recently confirmed
      const updatedRecentlyConfirmed = new Set([...recentlyConfirmedPayments, ...idsToTrack]);
      setRecentlyConfirmedPayments(updatedRecentlyConfirmed);
      
      // Persist to localStorage with timestamp for cross-refresh persistence
      try {
        const stored = localStorage.getItem('recentlyConfirmedPayments');
        let storedPayments = [];
        if (stored) {
          storedPayments = JSON.parse(stored);
        }
        
        // Add new payment IDs with timestamp
        idsToTrack.forEach(id => {
          storedPayments.push({
            paymentId: id,
            timestamp: Date.now()
          });
        });
        
        // Clean up old entries (older than 24 hours)
        const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
        storedPayments = storedPayments.filter(item => item.timestamp > twentyFourHoursAgo);
        
        localStorage.setItem('recentlyConfirmedPayments', JSON.stringify(storedPayments));
        // Payment persisted to localStorage for cross-refresh protection
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      // Refresh all data to reflect changes with delays between calls
      // Refreshing data after payment confirmation
      await loadAllBookings();
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadPendingPayments(updatedRecentlyConfirmed);
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadUsers();
      
      // Payment confirmation process completed
      // Pending payments after refresh logged
      // Recently confirmed payments logged
    } catch (error) {
      console.error('Error approving payment:', error);
      alert('Failed to approve payment. Please try again.');
    }
  };

  const markOrderCompleted = async (orderId) => {
    if (!window.confirm('Are you sure you want to mark this order as completed?')) return;
    
    try {
      // Attempting to mark order as completed
      
      // First, try to find the order in bookings collection
      let orderData = null;
      let isBooking = true;
      let actualDocId = orderId;
      
      try {
        const bookingDoc = doc(db, 'bookings', orderId);
        const bookingSnapshot = await getDoc(bookingDoc);
        if (bookingSnapshot.exists()) {
          orderData = bookingSnapshot.data();
          // Found order in bookings collection
        }
      } catch (error) {
        // Order not found in bookings, checking donations
      }
      
      // If not found in bookings, check donations collection
      if (!orderData) {
        try {
          const donationDoc = doc(db, 'donations', orderId);
          const donationSnapshot = await getDoc(donationDoc);
          if (donationSnapshot.exists()) {
            orderData = donationSnapshot.data();
            isBooking = false;
            // Found order in donations collection
          }
        } catch (error) {
          // Order not found in donations either
        }
      }
      
      // If still not found, try to find by original ID
      if (!orderData) {
        try {
          // Searching by original ID
          const bookingsCollection = collection(db, 'bookings');
          const bookingsSnapshot = await getDocs(bookingsCollection);
          
          for (const docSnapshot of bookingsSnapshot.docs) {
            const data = docSnapshot.data();
            if (data.id === orderId || data.bookingId === orderId) {
              orderData = data;
              actualDocId = docSnapshot.id;
              isBooking = true;
              // Found booking by original ID
              break;
            }
          }
          
          // If not found in bookings, search donations
          if (!orderData) {
            const donationsCollection = collection(db, 'donations');
            const donationsSnapshot = await getDocs(donationsCollection);
            
            for (const docSnapshot of donationsSnapshot.docs) {
              const data = docSnapshot.data();
              if (data.id === orderId || data.donationId === orderId) {
                orderData = data;
                actualDocId = docSnapshot.id;
                isBooking = false;
                // Found donation by original ID
                break;
              }
            }
          }
        } catch (error) {
          // Error searching by original ID
        }
      }
      
      if (!orderData) {
        console.error('Order not found anywhere. ID searched:', orderId);
        throw new Error('Order not found in either bookings or donations collection');
      }
      
      // Update the appropriate collection using the correct document ID
      if (isBooking) {
        const bookingDoc = doc(db, 'bookings', actualDocId);
        await updateDoc(bookingDoc, {
          status: 'completed',
          bookingStatus: 'completed',
          paymentStatus: 'completed',
          completedAt: new Date(),
          completedBy: 'admin'
        });
        // Updated booking with doc ID
      } else {
        const donationDoc = doc(db, 'donations', actualDocId);
        await updateDoc(donationDoc, {
          status: 'completed',
          paymentStatus: 'completed',
          completedAt: new Date(),
          completedBy: 'admin'
        });
        // Updated donation with doc ID
      }
      
      // Send completion notification to user
      await sendOrderCompletionNotification(orderData);
      
      // Add a small delay to ensure Firestore changes have propagated
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh all data to reflect changes
      await loadAllBookings();
      await loadPendingPayments();
      await loadUsers();
      
      const orderType = isBooking ? 'booking' : 'donation';
      alert(`${orderType.charAt(0).toUpperCase() + orderType.slice(1)} marked as completed successfully!`);
    } catch (error) {
      console.error('Error marking order as completed:', error);
      alert('Failed to mark order as completed. Please try again.');
    }
  };

  // Removed unused viewUserDetails function

  const closeUserModal = () => {
    setShowUserModal(false);
    setSelectedUser(null);
  };



  // Filter users based on search
  useEffect(() => {
    let filtered = users.filter(user => {
      const searchLower = userSearchTerm.toLowerCase();
      return (
        user.email?.toLowerCase().includes(searchLower) ||
        user.displayName?.toLowerCase().includes(searchLower) ||
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredUsers(filtered);
  }, [userSearchTerm, users]);

  // Filter pending payments based on search
  useEffect(() => {
    let filtered = pendingPayments.filter(payment => {
      const searchLower = paymentSearchTerm.toLowerCase();
      return (
        payment.celebrityName?.toLowerCase().includes(searchLower) ||
        payment.userEmail?.toLowerCase().includes(searchLower) ||
        payment.id?.toLowerCase().includes(searchLower)
      );
    });
    setFilteredPendingPayments(filtered);
  }, [paymentSearchTerm, pendingPayments]);

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
          {/* Login credentials are configured via environment variables */}
        </div>
      </div>
      );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-content">
          <div className="admin-title-section">
            <div className="admin-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div className="admin-title-text">
              <h1>Celebrity Management Dashboard</h1>
              <p className="admin-subtitle">Manage your celebrity roster, bookings, and analytics</p>
            </div>
          </div>
          <div className="header-actions">
            <div className="admin-stats-quick">
              <div className="quick-stat">
                <span className="stat-number">{celebrities.length}</span>
                <span className="stat-label">Celebrities</span>
              </div>
              <div className="quick-stat">
                <span className="stat-number">{bookings.length}</span>
                <span className="stat-label">Bookings</span>
              </div>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                <polyline points="16,17 21,12 16,7"/>
                <path d="M21 12H9"/>
              </svg>
              Logout
            </button>
          </div>
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
              setShowUsers(false);
              setShowPendingPayments(false);
            }}
            className={`nav-tab ${!showVisitorStats && !showBookings && !showActingCoaches && !showPersonalizedVideos && !showUsers && !showPendingPayments ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-label">Celebrities</span>
            <span className="nav-count">{celebrities.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowBookings(true);
              setShowVisitorStats(false);
              setShowActingCoaches(false);
              setShowPersonalizedVideos(false);
              setShowUsers(false);
              setShowPendingPayments(false);
              loadAllBookings();
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
              setShowUsers(false);
              setShowPendingPayments(false);
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
              setShowUsers(false);
              setShowPendingPayments(false);
            }}
            className={`nav-tab ${showPersonalizedVideos ? 'active' : ''}`}
          >
            <span className="nav-icon">🎬</span>
            <span className="nav-label">Video Messages</span>
            <span className="nav-count">{personalizedVideos.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowUsers(true);
              setShowBookings(false);
              setShowVisitorStats(false);
              setShowActingCoaches(false);
              setShowPersonalizedVideos(false);
              setShowPendingPayments(false);
              // Users tab clicked - calling loadUsers()
              loadUsers();
            }}
            className={`nav-tab ${showUsers ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-label">Users</span>
            <span className="nav-count">{users.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowPendingPayments(true);
              setShowBookings(false);
              setShowVisitorStats(false);
              setShowActingCoaches(false);
              setShowPersonalizedVideos(false);
              setShowUsers(false);
              loadPendingPayments();
            }}
            className={`nav-tab ${showPendingPayments ? 'active' : ''}`}
          >
            <span className="nav-icon">💳</span>
            <span className="nav-label">Pending Payments</span>
            <span className="nav-count">{pendingPayments.length}</span>
          </button>
          
          <button 
            onClick={() => {
              setShowVisitorStats(!showVisitorStats);
              setShowBookings(false);
              setShowActingCoaches(false);
              setShowPersonalizedVideos(false);
              setShowUsers(false);
              setShowPendingPayments(false);
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

      {!showBookings && !showPendingPayments && !showActingCoaches && !showPersonalizedVideos && !showUsers && !showVisitorStats ? (
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

          {/* Celebrities Grid */}
          <div className="celebrities-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCelebrities.map((celebrity) => (
                  <tr key={celebrity.id}>
                    <td>{celebrity.name}</td>
                    <td>{celebrity.category}</td>
                    <td>${celebrity.price}</td>
                    <td>
                      <span className={`status ${celebrity.available ? 'available' : 'unavailable'}`}>
                        {celebrity.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      {celebrity.is_acting_coach ? (
                        <span className="type-badge acting-coach">Acting Coach</span>
                      ) : (
                        <span className="type-badge celebrity">Celebrity</span>
                      )}
                    </td>
                    <td>
                      <button onClick={() => handleEditCelebrity(celebrity)} className="edit-btn">Edit</button>
                      <button onClick={() => deleteCelebrity(celebrity.id)} className="delete-btn">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredCelebrities.length === 0 && (
              <div className="no-results">
                <p>No celebrities found.</p>
              </div>
            )}
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
            <button 
              onClick={handleMigrateActingCoaches}
              className="add-celebrity-btn"
              disabled={isMigrating}
              style={{ marginLeft: '10px', backgroundColor: '#28a745' }}
            >
              {isMigrating ? 'Migrating...' : 'Sync to Firebase'}
            </button>
            <button 
              onClick={handleRefreshFromFirebase}
              className="add-celebrity-btn"
              disabled={isMigrating}
              style={{ marginLeft: '10px', backgroundColor: '#17a2b8' }}
            >
              {isMigrating ? 'Loading...' : 'Refresh from Firebase'}
            </button>
          </div>

          {/* Migration Status */}
          {migrationStatus && (
            <div className="migration-status" style={{
              padding: '10px',
              margin: '10px 0',
              borderRadius: '5px',
              backgroundColor: migrationStatus.includes('✅') ? '#d4edda' : '#f8d7da',
              color: migrationStatus.includes('✅') ? '#155724' : '#721c24',
              border: `1px solid ${migrationStatus.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {migrationStatus}
            </div>
          )}

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
      ) : showBookings ? (
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
                  <th>Date & Time / Payment</th>
                  <th>Package</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={`main-booking-${booking.id || booking.bookingId || index}`}>
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
                          {booking.type === 'donation' 
                            ? (booking.donorInfo?.firstName || booking.donorName?.split(' ')[0] || 'Anonymous') + ' ' + (booking.donorInfo?.lastName || booking.donorName?.split(' ').slice(1).join(' ') || 'Donor')
                            : booking.type === 'acting_class'
                            ? (booking.customerInfo?.fullName || 'N/A')
                            : (booking.personalInfo?.firstName || booking.formData?.firstName || booking.firstName || 'N/A') + ' ' + (booking.personalInfo?.lastName || booking.formData?.lastName || booking.lastName || 'N/A')
                          }
                        </strong>
                        <br />
                        <small>
                          {booking.type === 'donation' 
                            ? (booking.donorInfo?.email || booking.personalInfo?.email || booking.formData?.email || booking.userEmail || booking.email || 'N/A')
                            : booking.type === 'acting_class'
                            ? (booking.customerInfo?.email || booking.userEmail || 'N/A')
                            : (booking.personalInfo?.email || booking.formData?.email || booking.userEmail || booking.email || 'N/A')
                          }
                        </small>
                      </div>
                    </td>
                    <td>
                      {booking.type === 'donation' 
                        ? `Donation - ${typeof booking.campaign === 'string' ? booking.campaign : (booking.campaign?.title || 'General Fund')}`
                        : booking.type === 'acting_class'
                        ? `Acting Coach - ${booking.coach?.name || 'N/A'}`
                        : (booking.celebrity?.name || 'N/A')
                      }
                    </td>
                    <td>
                      {booking.type === 'donation' 
                        ? 'N/A'
                        : (() => {
                            // Handle different booking types with different date/time field structures
                            let date, time;
                            
                            if (booking.type === 'acting_class') {
                              // Acting class bookings store date/time in customerInfo.preferredDateTime
                              const preferredDateTime = booking.customerInfo?.preferredDateTime;
                              if (preferredDateTime) {
                                // Split preferredDateTime if it contains both date and time
                                if (preferredDateTime.includes('T')) {
                                  const dateTime = new Date(preferredDateTime);
                                  date = dateTime.toISOString().split('T')[0];
                                  time = dateTime.toTimeString().split(' ')[0].substring(0, 5);
                                } else {
                                  date = preferredDateTime;
                                }
                              }
                              // Also check for startDate field
                              date = date || booking.startDate;
                            } else {
                              // Regular bookings use sessionDetails or formData
                              date = booking.sessionDetails?.date || booking.formData?.date || booking.date || booking.eventDate;
                              time = booking.sessionDetails?.time || booking.formData?.time || booking.time || booking.eventTime;
                            }
                            
                            if (date && time) {
                              // Format date if it's a valid date
                              const formattedDate = new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                              return `${formattedDate} at ${time}`;
                            } else if (date) {
                              const formattedDate = new Date(date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              });
                              return `${formattedDate} (Time TBD)`;
                            } else if (time) {
                              return `Date TBD at ${time}`;
                            } else {
                              // Show payment/booking creation date when no scheduled date is available
                              const paymentDate = booking.createdAt || booking.paymentDate || booking.timestamp;
                              if (paymentDate) {
                                const formattedPaymentDate = paymentDate.seconds 
                                  ? new Date(paymentDate.seconds * 1000).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) + ' at ' + new Date(paymentDate.seconds * 1000).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  : new Date(paymentDate).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    }) + ' at ' + new Date(paymentDate).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    });
                                return formattedPaymentDate;
                              }
                              return 'Date & Time TBD';
                            }
                          })()
                      }
                    </td>
                    <td>
                      {booking.type === 'donation' 
                        ? 'Donation'
                        : booking.type === 'acting_class'
                        ? (booking.coach?.packageName || booking.sessionDetails?.package || booking.formData?.package || booking.package || 'Acting Class Package')
                        : (booking.sessionDetails?.packageName || booking.sessionDetails?.package || booking.formData?.package || booking.package || booking.podcastType || (booking.service && typeof booking.service === 'object' ? booking.service.title || booking.service.name : booking.service) || 'Standard Package')
                      }
                    </td>
                    <td>
                      ${booking.type === 'donation' 
                        ? (booking.amount || 0)
                        : (booking.pricing?.total || booking.total || booking.price || 0)
                      }
                    </td>
                    <td>
                      <span className={`status ${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td>
                      <div className="booking-actions">
                        <button className="view-btn">View Details</button>
                        {booking.status !== 'completed' && booking.bookingStatus !== 'completed' && booking.paymentStatus !== 'completed' && (
                          <button 
                            onClick={() => markOrderCompleted(booking.id)}
                            className="complete-btn"
                            title="Mark as completed"
                          >
                            Complete
                          </button>
                        )}
                      </div>
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
      ) : showUsers ? (
        <div className="users-section">
          <h2>User Management</h2>
          <div className="users-stats">
            <span>Total Users: {users.length}</span>
            <span>Active: {users.filter(u => u.isActive !== false).length}</span>
            <span>Inactive: {users.filter(u => u.isActive === false).length}</span>
          </div>
          
          <div className="search-filters">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          
          {loadingUsers ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="users-table modern-table">
              <table>
                <thead>
                  <tr>
                    <th>User Info</th>
                    <th>Contact</th>
                    <th>Registration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <React.Fragment key={user.id}>
                      <tr className={`user-row ${expandedUserRows.has(user.id) ? 'expanded' : ''}`}>
                        <td>
                          <div className="user-info-cell">
                            <div className="user-avatar">
                              {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || ''}
                            </div>
                            <div className="user-details">
                              <strong className="user-name">{user.firstName} {user.lastName}</strong>
                              <div className="user-id">ID: {user.id.substring(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="contact-cell">
                            <div className="email">{user.email}</div>
                            <div className="phone">{user.phone || 'No phone'}</div>
                          </div>
                        </td>
                        <td>
                          <div className="registration-cell">
                            <div className="date">
                              {user.createdAt ? (
                                user.createdAt.seconds ? 
                                  new Date(user.createdAt.seconds * 1000).toLocaleDateString() :
                                  new Date(user.createdAt).toLocaleDateString()
                              ) : 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`status-badge ${
                            user.latestBookingStatus === 'confirmed' ? 'confirmed' :
                            user.latestBookingStatus === 'pending' ? 'pending' :
                            user.latestBookingStatus === 'completed' ? 'completed' :
                            user.latestBookingStatus === 'no-bookings' ? 'no-bookings' :
                            user.isActive !== false ? 'active' : 'inactive'
                          }`}>
                            {
                              user.latestBookingStatus === 'confirmed' ? 'Payment Approved' :
                              user.latestBookingStatus === 'pending' ? 'Awaiting Approval' :
                              user.latestBookingStatus === 'completed' ? 'Order Completed' :
                              user.latestBookingStatus === 'no-bookings' ? 'No Bookings' :
                              user.isActive !== false ? 'Active' : 'Inactive'
                            }
                          </span>
                        </td>
                        <td>
                          <div className="user-actions">
                            <button 
                              onClick={() => toggleUserRow(user.id)} 
                              className="expand-btn"
                              title={expandedUserRows.has(user.id) ? 'Collapse details' : 'Expand details'}
                            >
                              {expandedUserRows.has(user.id) ? '▼' : '▶'}
                            </button>
                            <button 
                              onClick={() => deleteUser(user.id, user.email)} 
                              className="delete-btn"
                              title="Delete user account and all data"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedUserRows.has(user.id) && (
                        <tr className="expanded-details">
                          <td colSpan="5">
                            <div className="user-expanded-content">
                              <div className="details-grid">
                                <div className="detail-section">
                                  <h4>Personal Information</h4>
                                  <div className="detail-item">
                                    <span className="label">Full Name:</span>
                                    <span className="value">{user.firstName} {user.lastName}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">Email:</span>
                                    <span className="value">{user.email}</span>
                                    <button onClick={() => copyToClipboard(user.email)} className="copy-btn-small">📋</button>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">Phone:</span>
                                    <span className="value">{user.phone || 'Not provided'}</span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">User ID:</span>
                                    <span className="value">{user.id}</span>
                                    <button onClick={() => copyToClipboard(user.id)} className="copy-btn-small">📋</button>
                                  </div>
                                </div>
                                <div className="detail-section">
                                  <h4>Account Details</h4>
                                  <div className="detail-item">
                                    <span className="label">Registration Date:</span>
                                    <span className="value">
                                      {user.createdAt ? (
                                        user.createdAt.seconds ? 
                                          new Date(user.createdAt.seconds * 1000).toLocaleString() :
                                          new Date(user.createdAt).toLocaleString()
                                      ) : 'N/A'}
                                    </span>
                                  </div>
                                  <div className="detail-item">
                                    <span className="label">Account Status:</span>
                                    <span className={`value status-badge ${user.isActive !== false ? 'active' : 'inactive'}`}>
                                      {user.isActive !== false ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                                <div className="detail-section">
                                  <h4>Booking History</h4>
                                  {user.bookingError ? (
                                    <div className="booking-error">
                                      <p className="error-message">⚠️ {user.bookingError}</p>
                                      <p className="error-help">Please check your Firebase connection and try refreshing the page.</p>
                                    </div>
                                  ) : user.bookings && user.bookings.length > 0 ? (
                                    <div className="booking-history-table">
                                      <table className="bookings-table">
                                        <thead>
                                          <tr>
                                            <th>Booking ID</th>
                                            <th>Celebrity</th>
                                            <th>Date</th>
                                            <th>Package</th>
                                            <th>Amount</th>
                                            <th>Status</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {user.bookings.slice(0, 5).map((booking, index) => (
                                            <tr key={`user-${user.id}-booking-${booking.id || booking.bookingId || index}`}>
                                              <td>#{(booking.id || booking.bookingId || 'N/A').substring(0, 8)}</td>
                                              <td>
                                                {booking.type === 'acting_class' 
                                                  ? `Acting Coach - ${booking.coach?.name || 'Unknown Coach'}` 
                                                  : booking.celebrity?.name || 'N/A'
                                                }
                                              </td>
                                              <td>{booking.sessionDetails?.date || booking.date || 'N/A'}</td>
                                              <td>{booking.package || booking.podcastType || 'Standard'}</td>
                                              <td>${booking.pricing?.total || booking.total || 0}</td>
                                              <td>
                                                <span className={`status ${booking.paymentStatus || 'pending'}`}>
                                                  {booking.paymentStatus || 'pending'}
                                                </span>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                      {user.bookings.length > 5 && (
                                        <div className="booking-count-note">
                                          Showing 5 of {user.bookings.length} bookings
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="no-bookings">
                                      <p>No booking history available</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="no-users">
                  <p>No users found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : showPendingPayments ? (
        <div className="pending-payments-section">
          <div className="payments-header">
            <h2>Pending Payments</h2>
            <div className="payments-summary">
              <div className="summary-card">
                <div className="summary-number">{pendingPayments.length}</div>
                <div className="summary-label">Pending</div>
              </div>
              <div className="summary-card">
                <div className="summary-number">${pendingPayments.reduce((sum, p) => sum + (p.total || p.price || 0), 0).toLocaleString()}</div>
                <div className="summary-label">Total Value</div>
              </div>
            </div>
          </div>
          
          <div className="payments-controls">
            <button 
              onClick={resetAllBookingsToPending}
              className="reset-btn"
              style={{marginBottom: '10px', backgroundColor: '#ff6b6b', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px'}}
            >
              Reset All to Pending (Debug)
            </button>
            <button 
              onClick={clearAllPendingPayments}
              className="clear-btn"
              style={{marginBottom: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px'}}
            >
              Clear All Pending Payments
            </button>
            <button 
              onClick={removeDuplicateDonations}
              className="remove-duplicates-btn"
              style={{marginBottom: '10px', backgroundColor: '#ffc107', color: 'black', padding: '8px 16px', border: 'none', borderRadius: '4px', cursor: 'pointer'}}
            >
              Remove Duplicate Donations
            </button>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search by customer name or booking ID..."
                value={paymentSearchTerm}
                onChange={(e) => setPaymentSearchTerm(e.target.value)}
                className="search-input-modern"
              />
            </div>
          </div>
          
          {loadingPayments ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading payments...</p>
            </div>
          ) : (
            <div className="payments-container">
              {(() => {
                // Group payments by customer
                const groupedPayments = filteredPendingPayments.reduce((groups, payment) => {
                  // Enhanced customer info extraction for both bookings and donations
                  let firstName, lastName, email, phone;
                  
                  if (payment.type === 'donation') {
                    // For donations, check donation-specific fields with enhanced extraction
                    const fullName = payment.personalInfo?.fullName || payment.formData?.fullName || payment.donorName || '';
                    const nameParts = fullName.trim().split(' ');
                    
                    firstName = payment.donorInfo?.firstName || payment.personalInfo?.firstName || payment.formData?.firstName || payment.firstName || nameParts[0] || 'Anonymous';
                    lastName = payment.donorInfo?.lastName || payment.personalInfo?.lastName || payment.formData?.lastName || payment.lastName || nameParts.slice(1).join(' ') || 'Donor';
                    email = payment.donorInfo?.email || payment.personalInfo?.email || payment.formData?.email || payment.userEmail || payment.email || 'N/A';
                    phone = payment.donorInfo?.phone || payment.personalInfo?.phone || payment.formData?.phone || payment.phone || 'N/A';
                  } else if (payment.type === 'podcast_booking' || payment.type === 'podcast_request') {
                    // For podcast requests, check contactInfo field specifically
                    firstName = payment.contactInfo?.firstName || payment.podcastDetails?.hostName?.split(' ')[0] || payment.customerInfo?.firstName || payment.personalInfo?.firstName || payment.formData?.firstName || payment.firstName || 'Unknown';
                    lastName = payment.contactInfo?.lastName || payment.podcastDetails?.hostName?.split(' ').slice(1).join(' ') || payment.customerInfo?.lastName || payment.personalInfo?.lastName || payment.formData?.lastName || payment.lastName || 'Host';
                    email = payment.contactInfo?.email || payment.customerInfo?.email || payment.personalInfo?.email || payment.formData?.email || payment.userEmail || payment.email || 'N/A';
                    phone = payment.contactInfo?.phone || payment.customerInfo?.phone || payment.personalInfo?.phone || payment.formData?.phone || payment.phone || 'N/A';
                  } else {
                    // For other bookings, use existing logic with acting class support
                    firstName = payment.customerInfo?.firstName || payment.personalInfo?.firstName || payment.formData?.firstName || payment.firstName || 'Unknown';
                    lastName = payment.customerInfo?.lastName || payment.personalInfo?.lastName || payment.formData?.lastName || payment.lastName || 'Customer';
                    email = payment.customerInfo?.email || payment.personalInfo?.email || payment.formData?.email || payment.userEmail || payment.email || 'N/A';
                    phone = payment.customerInfo?.phone || payment.personalInfo?.phone || payment.formData?.phone || payment.phone || 'N/A';
                  }
                  
                  const customerKey = `${firstName} ${lastName}`;
                  if (!groups[customerKey]) {
                    groups[customerKey] = {
                      customer: {
                        name: customerKey,
                        email: email,
                        phone: phone
                      },
                      payments: []
                    };
                  }
                  groups[customerKey].payments.push(payment);
                  return groups;
                }, {});
                
                return Object.entries(groupedPayments).map(([customerKey, group]) => (
                  <div key={customerKey} className="customer-payment-group">
                    <div className="customer-header">
                      <div className="customer-info">
                        <h3 className="customer-name">{group.customer.name}</h3>
                        <div className="customer-details">
                          <span className="customer-email">{group.customer.email}</span>
                          {group.customer.phone !== 'N/A' && (
                            <span className="customer-phone">{group.customer.phone}</span>
                          )}
                        </div>
                      </div>
                      <div className="customer-summary">
                        <div className="payment-count">{group.payments.length} booking{group.payments.length > 1 ? 's' : ''}</div>
                        <div className="total-amount">${group.payments.reduce((sum, p) => sum + (p.pricing?.total || p.total || p.price || 0), 0).toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div className="customer-payments">
                      {group.payments.map((payment, index) => (
                        <div key={`${payment.type || 'booking'}-${payment.id || payment.donationId || payment.bookingId}-${index}-${payment.createdAt?.getTime?.() || Date.now()}`} className="payment-item">
                          <div className="payment-main">
                            <div className="payment-info">
                              <div className="booking-reference">#{payment.id.substring(0, 8)}</div>
                              <div className="celebrity-name">
                                {payment.type === 'donation' 
                                  ? `Donation - ${typeof payment.campaign === 'string' ? payment.campaign : (payment.campaign?.title || payment.campaign?.name || 'General Fund')}` 
                                  : payment.type === 'acting_class'
                                    ? `Acting Coach - ${payment.coach?.name || 'N/A'}`
                                    : payment.type === 'promotion'
                                      ? `Promotion - ${payment.service?.title || payment.celebrity?.name || 'Brand Ambassador Program'}`
                                      : (payment.celebrity?.name || 'N/A')
                                }
                              </div>
                              <div className="session-details">
                                <span className="package-type">
                                  {payment.type === 'donation' 
                                    ? `$${payment.amount || payment.totalAmount || 0} Donation to ${payment.campaign?.title || payment.campaign?.name || 'General Fund'}` 
                                    : payment.type === 'promotion'
                                      ? (payment.service?.title || payment.sessionDetails?.package || payment.formData?.package || payment.package || 'Brand Ambassador Program')
                                      : (payment.sessionDetails?.package || payment.formData?.package || payment.package || payment.podcastType || 'Standard Package')
                                  }
                                </span>
                                <span className="session-date">
                                  {payment.type === 'donation' 
                                    ? (payment.createdAt ? (
                                        payment.createdAt.seconds ? 
                                          new Date(payment.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + new Date(payment.createdAt.seconds * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) :
                                          new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + new Date(payment.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                      ) : 'N/A')
                                    : payment.type === 'acting_class'
                                      ? (payment.createdAt ? (
                                          payment.createdAt.seconds ? 
                                            'Paid on ' + new Date(payment.createdAt.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + new Date(payment.createdAt.seconds * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) :
                                            'Paid on ' + new Date(payment.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) + ' at ' + new Date(payment.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                        ) : 'Payment date N/A')
                                      : `${payment.sessionDetails?.date || payment.formData?.date || payment.date || 'TBD'} ${payment.sessionDetails?.time || payment.formData?.time || payment.time ? 'at ' + (payment.sessionDetails?.time || payment.formData?.time || payment.time) : ''}`
                                  }
                                </span>
                              </div>
                            </div>
                            <div className="payment-actions">
                              <div className="payment-amount">
                                ${payment.type === 'donation' 
                                  ? (payment.totalAmount || payment.amount || 0) 
                                  : (payment.pricing?.total || payment.total || payment.price || 0)
                                }
                              </div>
                              <button 
                                className="approve-payment-btn"
                                onClick={() => confirmPayment(payment.id)}
                                title="Approve Payment"
                              >
                                Approve
                              </button>
                              <button 
                                className="view-details-btn"
                                onClick={() => togglePaymentRow(payment.id)}
                                title={expandedPaymentRows.has(payment.id) ? 'Hide details' : 'View details'}
                              >
                                {expandedPaymentRows.has(payment.id) ? 'Less' : 'More'}
                              </button>
                            </div>
                          </div>
                          
                          {expandedPaymentRows.has(payment.id) && (
                            <div className="payment-details">
                              <div className="details-row">
                                <div className="detail-group">
                                  <label>Session Time</label>
                                  <span>{payment.sessionDetails?.time || payment.formData?.time || payment.time || 'Time TBD'}</span>
                                </div>
                                <div className="detail-group">
                                  <label>Duration</label>
                                  <span>{payment.sessionDetails?.duration ? `${payment.sessionDetails.duration} min` : payment.packageName || 'Standard Package'}</span>
                                </div>
                                <div className="detail-group">
                                  <label>Location</label>
                                  <span>{payment.sessionDetails?.location || 'Virtual'}</span>
                                </div>
                                <div className="detail-group">
                                  <label>Payment Method</label>
                                  <span>{payment.paymentMethod || 'Credit Card'}</span>
                                </div>
                              </div>
                              
                              {(payment.specialRequests?.requests || payment.formData?.specialRequests) && (
                                <div className="special-requests-section">
                                  <label>Special Requests</label>
                                  <p>{payment.specialRequests?.requests || payment.formData?.specialRequests}</p>
                                </div>
                              )}
                              
                              <div className="booking-metadata">
                                <span>Booking ID: {payment.id}</span>
                                <span>Created: {payment.createdAt ? (
                                  payment.createdAt.seconds ? 
                                    new Date(payment.createdAt.seconds * 1000).toLocaleDateString() :
                                    new Date(payment.createdAt).toLocaleDateString()
                                ) : 'N/A'}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ));
              })()}
              
              {filteredPendingPayments.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">💳</div>
                  <h3>No pending payments</h3>
                  <p>All payments have been processed or no bookings require approval.</p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>User Details</h3>
            <div className="user-details">
              <div className="detail-row">
                <span className="detail-label">Name:</span>
                <span className="detail-value">{selectedUser.firstName} {selectedUser.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">{selectedUser.phone || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Registration Date:</span>
                <span className="detail-value">
                  {selectedUser.createdAt ? (
                    selectedUser.createdAt.seconds ? 
                      new Date(selectedUser.createdAt.seconds * 1000).toLocaleString() :
                      new Date(selectedUser.createdAt).toLocaleString()
                  ) : 'N/A'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status ${selectedUser.isActive !== false ? 'active' : 'inactive'}`}>
                  {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">User ID:</span>
                <span className="detail-value">{selectedUser.id}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setShowUserModal(false)} 
                className="cancel-btn"
              >
                Close
              </button>
            </div>
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

      {/* User Details Sidebar */}
      {showUserModal && selectedUser && (
        <div className="sidebar-overlay" onClick={closeUserModal}>
          <div className="user-sidebar" onClick={(e) => e.stopPropagation()}>
            <div className="sidebar-header">
              <h3>User Details</h3>
              <button onClick={closeUserModal} className="close-btn">×</button>
            </div>
            
            <div className="sidebar-content">
              <div className="user-basic-info">
                <div className="user-avatar">
                  {selectedUser.firstName?.charAt(0) || 'U'}
                </div>
                <h4>{selectedUser.firstName} {selectedUser.lastName}</h4>
                <p className="user-email">{selectedUser.email}</p>
              </div>

              <div className="user-quick-stats">
                <div className="quick-stat">
                  <span className="stat-value">{selectedUser.bookings?.length || 0}</span>
                  <span className="stat-label">Bookings</span>
                </div>
                <div className="quick-stat">
                  <span className="stat-value">{selectedUser.donations?.length || 0}</span>
                  <span className="stat-label">Donations</span>
                </div>
                <div className="quick-stat">
                  <span className="stat-value">
                    ${(
                      (selectedUser.bookings?.reduce((sum, booking) => 
                        sum + (booking.pricing?.total || booking.total || 0), 0
                      ) || 0) +
                      (selectedUser.donations?.reduce((sum, donation) => 
                        sum + (donation.amount || 0), 0
                      ) || 0)
                    )}
                  </span>
                  <span className="stat-label">Total Spent</span>
                </div>
              </div>

              <div className="user-info-list">
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`value status-badge ${selectedUser.isActive !== false ? 'active' : 'inactive'}`}>
                    {selectedUser.isActive !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Joined:</span>
                  <span className="value">
                    {selectedUser.createdAt ? (
                      selectedUser.createdAt.seconds ? 
                        new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString() :
                        new Date(selectedUser.createdAt).toLocaleDateString()
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Phone:</span>
                  <span className="value">{selectedUser.phone || 'Not provided'}</span>
                </div>
              </div>

              {selectedUser.allActivities && selectedUser.allActivities.length > 0 && (
                <div className="recent-activities">
                  <h5>Recent Activities</h5>
                  <div className="activity-list">
                    {selectedUser.allActivities.slice(0, 5).map((activity, index) => (
                      <div key={`activity-${selectedUser.id}-${activity.id || activity.bookingId || index}`} className="activity-item">
                        <div className="activity-info">
                          <span className="activity-type">
                            {activity.type === 'donation' ? '💝' : '🎭'} 
                            {activity.type === 'donation' 
                              ? activity.campaign?.title || 'Donation'
                              : activity.celebrity?.name || 'Booking'
                            }
                          </span>
                          <span className="activity-date">
                            {activity.type === 'donation'
                              ? (activity.createdAt?.toDate?.() || new Date(activity.createdAt)).toLocaleDateString()
                              : activity.sessionDetails?.date || activity.date || 'N/A'
                            }
                          </span>
                          <span className="activity-amount">
                            ${activity.type === 'donation' 
                              ? activity.amount || 0
                              : activity.pricing?.total || activity.total || 0
                            }
                          </span>
                        </div>
                        <div className="activity-status">
                          <span className={`status ${activity.paymentStatus || activity.status}`}>
                            {activity.paymentStatus || activity.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedUser.donations && selectedUser.donations.length > 0 && (
                <div className="donation-history">
                  <h5>Donation History</h5>
                  <div className="donation-list">
                    {selectedUser.donations.map((donation) => (
                      <div key={donation.id} className="donation-item">
                        <div className="donation-info">
                          <span className="campaign-name">{donation.campaign?.title || 'Charitable Donation'}</span>
                          <span className="donation-date">
                            {(donation.createdAt?.toDate?.() || new Date(donation.createdAt)).toLocaleDateString()}
                          </span>
                          <span className="donation-amount">${donation.amount || 0}</span>
                        </div>
                        <div className="donation-status">
                          <span className={`status ${donation.status}`}>
                            {donation.status || 'pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default AdminPage;



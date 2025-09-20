import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { db } from '../../services/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser, updateProfile: updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileMessage, setProfileMessage] = useState('');
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Ensure body scroll is restored when Dashboard mounts
  useEffect(() => {
    document.body.style.overflow = 'unset';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
  }, []);

  // Safety timeout to prevent infinite loading
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        setIsLoading(false);
        setMessage('Loading took longer than expected. Please try refreshing the page.');
      }, 8000); // 8 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);

  // Load bookings from localStorage immediately
  const loadLocalBookings = useCallback(() => {
    try {
      // Use only the unified bookings localStorage array
      const savedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      const savedDonations = JSON.parse(localStorage.getItem('donations') || '[]');
      
      // Combine bookings and donations
      const allLocalBookings = [...savedBookings, ...savedDonations];
      
      // If we have a current user, filter by userId, otherwise show all local bookings
      const userBookings = currentUser?.uid 
        ? allLocalBookings.filter(booking => booking.userId === currentUser.uid)
        : allLocalBookings;
      
      const formattedBookings = userBookings.map((booking, index) => ({
        id: booking.id || booking.bookingId || `local-${booking.type || 'booking'}-${Date.now()}-${index}`,
        ...booking,
        service: booking.celebrity?.name || booking.service || 'Celebrity Experience',
        date: booking.sessionDetails?.date || booking.date || '',
        time: booking.sessionDetails?.time || booking.time || '',
        status: booking.status || 'pending',
        total: booking.pricing?.total || booking.total || booking.amount || booking.price || booking.celebrity?.price || 0,
        package: booking.sessionDetails?.packageName || booking.package || 'Basic Package',
        paymentStatus: booking.paymentStatus || 'pending'
      }));
      
      // Remove duplicates based on multiple criteria
      const uniqueBookings = formattedBookings.filter((booking, index, self) => {
        const currentKey = booking.bookingId || booking.id;
        const currentType = booking.type;
        const currentService = booking.service || booking.className;
        const currentCreatedAt = booking.createdAt;
        
        return index === self.findIndex(b => {
          const compareKey = b.bookingId || b.id;
          const compareType = b.type;
          const compareService = b.service || b.className;
          const compareCreatedAt = b.createdAt;
          
          // Primary match: same booking ID
          if (currentKey && compareKey && currentKey === compareKey) {
            return true;
          }
          
          // Secondary match: same type, service, and created within 1 minute
          if (currentType === compareType && 
              currentService === compareService && 
              currentCreatedAt && compareCreatedAt) {
            const timeDiff = Math.abs(new Date(currentCreatedAt).getTime() - new Date(compareCreatedAt).getTime());
            return timeDiff < 60000; // 1 minute
          }
          
          return false;
        });
      });
      
      setBookings(uniqueBookings);
    } catch (error) {
      console.error('Error loading local bookings:', error);
    }
  }, [currentUser?.uid]);

  const loadUserBookings = useCallback(async () => {
    if (!currentUser?.uid) {
      // Load local bookings if no user is authenticated yet
      loadLocalBookings();
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Fetch bookings from Firebase (without orderBy to avoid index requirement)
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', currentUser.uid)
      );
      
      const querySnapshot = await getDocs(bookingsQuery);
      const userBookings = [];
      
      querySnapshot.forEach((doc) => {
        const bookingData = doc.data();
        userBookings.push({
          id: doc.id,
          ...bookingData,
          // Format data for display
          service: bookingData.type === 'acting_class' 
            ? `Acting Class - ${bookingData.coach?.name || 'Unknown Coach'}` 
            : bookingData.celebrity?.name || bookingData.service || 'Celebrity Experience',
          date: bookingData.sessionDetails?.date || bookingData.date || '',
          time: bookingData.sessionDetails?.time || bookingData.time || '',
          status: bookingData.status || 'pending',
          total: bookingData.pricing?.total || bookingData.total || bookingData.amount || bookingData.price || bookingData.celebrity?.price || 0,
          package: bookingData.sessionDetails?.packageName || 'Basic Package',
          paymentStatus: bookingData.paymentStatus || 'pending'
        });
      });
      
      // Fetch donations from Firebase
      const donationsQuery = query(
        collection(db, 'donations'),
        where('userId', '==', currentUser.uid)
      );
      
      const donationsSnapshot = await getDocs(donationsQuery);
      const userDonations = [];
      
      donationsSnapshot.forEach((doc) => {
        const donationData = doc.data();
        userDonations.push({
          id: doc.id,
          ...donationData,
          // Format data for display
          service: donationData.campaign?.title || 'Charitable Donation',
          date: '',
          time: '',
          status: donationData.status || 'pending',
          total: donationData.amount || donationData.total || donationData.price || 0,
          package: 'Donation',
          paymentStatus: donationData.paymentStatus || 'pending'
        });
      });
      
      // Combine bookings and donations
      const allUserData = [...userBookings, ...userDonations];
      
      // Sort by createdAt descending (client-side)
      allUserData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      });
      
      // Merge with local bookings to ensure nothing is lost
      const localBookings = JSON.parse(localStorage.getItem('bookings') || '[]')
        .filter(booking => booking.userId === currentUser.uid)
        .map(booking => ({
          id: booking.id || booking.bookingId,
          ...booking,
          service: booking.type === 'acting_class' 
            ? `Acting Class - ${booking.coach?.name || 'Unknown Coach'}` 
            : booking.celebrity?.name || booking.service || 'Celebrity Experience',
          date: booking.sessionDetails?.date || booking.date || '',
          time: booking.sessionDetails?.time || booking.time || '',
          status: booking.status || 'pending',
          total: booking.pricing?.total || booking.total || 0,
          package: booking.sessionDetails?.packageName || booking.package || 'Basic Package',
          paymentStatus: booking.paymentStatus || 'pending'
        }));
      
      // Combine Firebase and local bookings
      const allBookings = [...allUserData, ...localBookings];
      
      // Remove duplicates based on bookingId
      const uniqueBookings = allBookings.filter((booking, index, self) => 
        index === self.findIndex(b => (b.bookingId || b.id) === (booking.bookingId || booking.id))
      );
      
      setBookings(uniqueBookings);
      
      // Update localStorage with merged data (unified storage)
      localStorage.setItem('bookings', JSON.stringify(uniqueBookings));
      
    } catch (error) {
      console.error('Error loading bookings from Firebase:', error);
      
      // Fallback to local bookings if Firebase fails
      loadLocalBookings();
      
      // Provide more specific error messages
      if (error.code === 'permission-denied') {
        setMessage('Access denied. Please check your permissions.');
      } else if (error.code === 'unavailable') {
        setMessage('Server temporarily unavailable. Showing local bookings.');
      } else {
        setMessage('Connection issue detected. Showing local bookings.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentUser?.uid, loadLocalBookings]);

  useEffect(() => {
    if (currentUser?.uid) {
      setProfileData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        phone: currentUser.phoneNumber || '',
        address: currentUser.address || ''
      });
    }
  }, [currentUser?.uid, currentUser?.displayName, currentUser?.email, currentUser?.phoneNumber, currentUser?.address]);

  // Load local bookings immediately on mount
  useEffect(() => {
    loadLocalBookings();
  }, [loadLocalBookings]);

  // Load user bookings when auth state changes
  useEffect(() => {
    if (currentUser?.uid) {
      loadUserBookings();
    }
  }, [currentUser?.uid, loadUserBookings]);

  // Clear messages when all payments are confirmed
  useEffect(() => {
    const hasPendingPayments = bookings.some(b => 
      b.status === 'pending' || 
      b.status === 'pending_payment' || 
      b.paymentStatus === 'submitted'
    );
    
    if (!hasPendingPayments && (message || profileMessage)) {
      // Clear messages after a delay if no pending payments
      const timer = setTimeout(() => {
        setMessage('');
        setProfileMessage('');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [bookings, message, profileMessage]);

  // Listen for real-time booking and donation updates
  useEffect(() => {
    if (!currentUser?.uid) return;

    let currentBookingsData = [];
    let currentDonationsData = [];

    const updateCombinedData = () => {
      const allData = [...currentBookingsData, ...currentDonationsData];
      
      // Sort by createdAt descending (client-side)
      allData.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      });
      
      setBookings(allData);
      // Update localStorage with real-time data (unified storage)
      localStorage.setItem('bookings', JSON.stringify(allData));
    };

    const bookingsQuery = query(
      collection(db, 'bookings'),
      where('userId', '==', currentUser.uid)
    );

    const donationsQuery = query(
      collection(db, 'donations'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribeBookings = onSnapshot(bookingsQuery, (snapshot) => {
      currentBookingsData = [];
      snapshot.forEach((doc) => {
        const bookingData = doc.data();
        currentBookingsData.push({
          id: doc.id,
          ...bookingData,
          service: bookingData.celebrity?.name || 'Celebrity Experience',
          date: bookingData.sessionDetails?.date || '',
          time: bookingData.sessionDetails?.time || '',
          status: bookingData.status || 'pending',
          total: bookingData.pricing?.total || 0,
          package: bookingData.sessionDetails?.packageName || 'Basic Package',
          paymentStatus: bookingData.paymentStatus || 'pending'
        });
      });
      updateCombinedData();
    });

    const unsubscribeDonations = onSnapshot(donationsQuery, (snapshot) => {
      currentDonationsData = [];
      snapshot.forEach((doc) => {
        const donationData = doc.data();
        currentDonationsData.push({
          id: doc.id,
          ...donationData,
          service: donationData.campaign?.title || 'Charitable Donation',
          date: '',
          time: '',
          status: donationData.status || 'pending',
          total: donationData.amount || 0,
          package: 'Donation',
          paymentStatus: donationData.paymentStatus || 'pending'
        });
      });
      updateCombinedData();
    });

    return () => {
      unsubscribeBookings();
      unsubscribeDonations();
    };
  }, [currentUser?.uid]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!currentUser?.uid) return;

    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notificationsList = [];
      let unreadCounter = 0;

      snapshot.forEach((doc) => {
        const notificationData = { id: doc.id, ...doc.data() };
        notificationsList.push(notificationData);
        if (!notificationData.read) {
          unreadCounter++;
        }
      });
      
      // Sort notifications by createdAt descending (client-side)
      notificationsList.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date(0);
        return dateB - dateA;
      });

      setNotifications(notificationsList);
      setUnreadCount(unreadCounter);

      // Show toast notification for new payment approvals and order completions
      notificationsList.forEach(notification => {
        if ((notification.type === 'payment_approved' || notification.type === 'order_completed') && !notification.read) {
          // Extract booking details from notification data
          let bookingDescription = 'your booking';
          
          if (notification.data) {
            // Check if it's an acting class booking
            if (notification.data.type === 'acting_class' || notification.data.bookingType === 'acting_class') {
              const coachName = notification.data.actingCoach || notification.data.coach || 'Acting Coach';
              bookingDescription = `your acting class with ${coachName}`;
            }
            // Check if it's a celebrity meet & greet
            else if (notification.data.celebrityName || notification.data.celebrity?.name) {
              const celebrityName = notification.data.celebrityName || notification.data.celebrity?.name;
              bookingDescription = `your booking for ${celebrityName}`;
            }
            // Check if it's a class enrollment
            else if (notification.data.type === 'class_enrollment') {
              const className = notification.data.className || 'class';
              bookingDescription = `your enrollment for ${className}`;
            }
          }
          
          if (notification.type === 'payment_approved') {
            setMessage(`🎉 Payment Approved! ${bookingDescription.charAt(0).toUpperCase() + bookingDescription.slice(1)} has been confirmed.`);
          } else if (notification.type === 'order_completed') {
            setMessage(`✅ Order Completed! ${bookingDescription.charAt(0).toUpperCase() + bookingDescription.slice(1)} has been completed.`);
          }
          
          // Auto-refresh bookings to show updated status (debounced)
          if (!window.dashboardRefreshTimeout) {
            window.dashboardRefreshTimeout = setTimeout(() => {
              loadUserBookings();
              window.dashboardRefreshTimeout = null;
            }, 2000);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [currentUser?.uid]);



  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const result = await updateUserProfile({
        displayName: profileData.displayName,
        phoneNumber: profileData.phone,
        address: profileData.address
      });

      if (result.success) {
        setProfileMessage('Profile updated successfully!');
                setTimeout(() => setProfileMessage(''), 3000);
        setIsEditing(false);
      } else {
        setProfileMessage(result.error || 'Failed to update profile');
                setTimeout(() => setProfileMessage(''), 5000);
      }
    } catch (error) {
      setProfileMessage('Failed to update profile');
              setTimeout(() => setProfileMessage(''), 5000);
    }

    setIsLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    
    // Handle Firestore Timestamp objects
    if (dateString && typeof dateString === 'object') {
      try {
        if (dateString.toDate) {
          // Firebase Timestamp with toDate method
          return dateString.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } else if (dateString.seconds) {
          // Firestore Timestamp format with seconds
          const date = new Date(dateString.seconds * 1000);
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }
      } catch (error) {
        console.warn('Error converting Firestore timestamp:', error);
        return 'Date unavailable';
      }
    }
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date string:', dateString);
      return 'Date unavailable';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#48bb78';
      case 'completed': return '#22c55e';
      case 'pending': return '#ed8936';
      case 'cancelled': return '#f56565';
      default: return '#718096';
    }
  };

  return (
    <div className="user-management">
      <section className="hero-section-modern">
        <div className="container">
          <div className="hero-content-modern">
            <div className="hero-main-content">
              <div className="user-profile-section">
                <div className="user-avatar">
                  <div className="avatar-circle">
                    {currentUser?.displayName ? 
                      currentUser.displayName.split(' ').map(name => name.charAt(0)).join('').substring(0, 2).toUpperCase() :
                      currentUser?.email?.charAt(0).toUpperCase() || 'U'
                    }
                  </div>
                  <div className="user-status">
                    <span className="status-indicator active"></span>
                  </div>
                  <button onClick={() => setActiveTab('profile')} className="edit-icon-btn" title="Edit Profile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                </div>
                <div className="user-info">
                  <h1 className="user-greeting">
                    Welcome back, {currentUser?.displayName ? currentUser.displayName.split(' ')[0] : currentUser?.email?.split('@')[0] || 'there'}!
                  </h1>
                  <p className="user-subtitle">Manage your celebrity bookings and profile</p>
                  <div className="profile-completeness">
                    <div className="completeness-bar">
                      <div className="completeness-fill" style={{width: `${(() => {
                        let completeness = 20; // Base for having an account
                        if (profileData.email || currentUser?.email) completeness += 20;
                        if (profileData.displayName || currentUser?.displayName) completeness += 30;
                        if (profileData.phone || currentUser?.phoneNumber) completeness += 30;
                        return Math.min(completeness, 100);
                      })()}%`}}></div>
                    </div>
                    <span className="completeness-text">
                      Profile {(() => {
                        let completeness = 20; // Base for having an account
                        if (profileData.email || currentUser?.email) completeness += 20;
                        if (profileData.displayName || currentUser?.displayName) completeness += 30;
                        if (profileData.phone || currentUser?.phoneNumber) completeness += 30;
                        return Math.min(completeness, 100);
                      })()}% complete
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <div className="management-content">
        <div className="management-sidebar">
          <nav className="management-nav">
            <button
              className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <span className="nav-icon">📊</span>
              Overview
            </button>
            <button
              className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <span className="nav-icon">📦</span>
              My Orders
            </button>
            <button
              className={`nav-item ${activeTab === 'videos' ? 'active' : ''}`}
              onClick={() => setActiveTab('videos')}
            >
              <span className="nav-icon">🎬</span>
              Personalized Videos
            </button>
            <button
              className={`nav-item ${activeTab === 'celebrity-bookings' ? 'active' : ''}`}
              onClick={() => setActiveTab('celebrity-bookings')}
            >
              <span className="nav-icon">⭐</span>
              Celebrity Bookings
            </button>
            <button
              className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <span className="nav-icon">🔔</span>
              Notifications
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={`nav-item ${activeTab === 'class-enrollments' ? 'active' : ''}`}
              onClick={() => setActiveTab('class-enrollments')}
            >
              <span className="nav-icon">🎭</span>
              Class Enrollments
            </button>
            <button
              className={`nav-item ${activeTab === 'podcast-requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('podcast-requests')}
            >
              <span className="nav-icon">🎙️</span>
              Podcast Requests
            </button>
            <button
              className={`nav-item ${activeTab === 'promotions' ? 'active' : ''}`}
              onClick={() => setActiveTab('promotions')}
            >
              <span className="nav-icon">🎉</span>
              Promotions
            </button>
            <button
              className={`nav-item ${activeTab === 'donations' ? 'active' : ''}`}
              onClick={() => setActiveTab('donations')}
            >
              <span className="nav-icon">💝</span>
              Donations
            </button>
            <button
              className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <span className="nav-icon">👤</span>
              Profile
            </button>
          </nav>
        </div>

        <div className="management-main">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Activity Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-content">
                    <h3>{bookings.length}</h3>
                    <p>Total Bookings</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <h3>{bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').length}</h3>
                    <p>Confirmed & Completed</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-content">
                    <h3>{bookings.filter(b => b.status === 'pending' || b.status === 'pending_payment').length}</h3>
                    <p>Pending Payment</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎭</div>
                  <div className="stat-content">
                    <h3>{bookings.filter(b => b.type === 'acting_class' || b.type === 'class_enrollment').length}</h3>
                    <p>Acting Classes</p>
                  </div>
                </div>
              </div>
              
              {bookings.filter(b => b.status === 'pending' || b.status === 'pending_payment').length > 0 && (
                <div className="pending-actions">
                  <h3>⚠️ Action Required</h3>
                  <div className="pending-list">
                    {bookings.filter(b => b.status === 'pending' || b.status === 'pending_payment').map((booking) => (
                      <div key={booking.id || booking.bookingId || `pending-${booking.service}-${booking.date}`} className="pending-item">
                        <div className="pending-info">
                          <h4>{booking.service || booking.celebrity?.name || 'Booking'}</h4>
                          <p>Booking ID: {booking.bookingId || booking.id}</p>
                          <p><strong>Package:</strong> {booking.package || booking.sessionDetails?.package || booking.formData?.package || booking.podcastType || 'Standard Package'}</p>
                          <p><strong>Total:</strong> ${booking.total || booking.pricing?.total || booking.price || booking.amount || 0}</p>
                          <p className="pending-message">
                            {booking.status === 'pending_payment' ? 
                              'Complete your payment to confirm this booking' : 
                              booking.paymentStatus === 'submitted' ?
                                'Payment submitted - awaiting admin approval' :
                                'This booking is awaiting confirmation'
                            }
                          </p>
                          {booking.paymentStatus === 'submitted' && (
                            <p className="payment-status-info">
                              <strong>Payment Method:</strong> {booking.paymentMethod === 'bitcoin' ? 'Bitcoin' : booking.paymentMethod}
                            </p>
                          )}
                        </div>
                        <div className="pending-actions-buttons">
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Redirecting to payment...')}>Complete Payment</button>
                          )}
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="recent-bookings">
                <h3>Recent Activity</h3>
                {bookings.length > 0 ? (
                  <div className="booking-list">
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id || booking.bookingId || `recent-${booking.service}-${booking.date}`} className="booking-item">
                        <div className="booking-info">
                          <h4>{booking.service || booking.celebrity?.name || 'Booking'}</h4>
                          <p>{(() => {
                            const bookingDate = booking.date || booking.sessionDetails?.date || booking.formData?.date || booking.eventDate || booking.startDate;
                            const paymentDate = booking.paymentDate || booking.confirmedAt || booking.createdAt;
                            const displayDate = bookingDate || paymentDate;
                            return displayDate ? formatDate(displayDate) : 'Recent';
                          })()} {booking.time || booking.sessionDetails?.time || booking.formData?.time || booking.eventTime ? 'at ' + (booking.time || booking.sessionDetails?.time || booking.formData?.time || booking.eventTime) : ''}</p>
                        </div>
                        <span 
                          className="booking-status"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {booking.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state-small">
                    <p>No activity yet</p>
                    <p className="empty-subtitle">Your recent orders and bookings will appear here</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <div className="section-header">
                <h2>My Orders</h2>
                <div className="section-actions">
                  <button 
                    onClick={() => {
                      setMessage('');
                      loadUserBookings();
                    }} 
                    className="secondary-btn"
                    disabled={isLoading}
                    style={{ marginRight: '10px' }}
                  >
                    {isLoading ? 'Refreshing...' : '🔄 Refresh'}
                  </button>
                  <button onClick={() => navigate('/celebrities')} className="primary-btn">
                    New Order
                  </button>
                </div>
              </div>
              
              {message && (bookings.some(b => b.status === 'pending' || b.status === 'pending_payment' || b.paymentStatus === 'submitted') || message.includes('success') || message.includes('longer than expected')) && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  <div className="message-content">
                    <span className="message-text">{message}</span>
                    <div className="message-actions">
                      {message.includes('longer than expected') && (
                        <>
                          <button 
                            onClick={() => {
                              setMessage('');
                              loadUserBookings();
                            }} 
                            className="retry-btn"
                          >
                            Retry
                          </button>
                          <button 
                            onClick={() => {
                              setMessage('');
                              setIsLoading(false);
                            }} 
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pending Orders Section */}
              <div className="pending-orders">
                <h3>Pending Orders</h3>
                {bookings.filter(booking => booking.status === 'pending' || booking.status === 'pending_payment').length === 0 ? (
                  <div className="empty-state-small">
                    <p>No pending orders</p>
                  </div>
                ) : (
                  <div className="orders-grid">
                    {bookings.filter(booking => booking.status === 'pending' || booking.status === 'pending_payment').map((booking) => (
                      <div key={booking.id || booking.bookingId || `pending-order-${booking.service}`} className="order-card pending">
                        <div className="order-header">
                          <div className="order-title">
                            <h3>{booking.service}</h3>
                            <p className="order-id">ID: {booking.bookingId}</p>
                          </div>
                          <span 
                            className="order-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="order-details">
                          <p><strong>Date:</strong> {booking.date || booking.sessionDetails?.date || booking.formData?.date ? formatDate(booking.date || booking.sessionDetails?.date || booking.formData?.date) : (booking.createdAt ? formatDate(booking.createdAt) : 'Date not available')}</p>
                          <p><strong>Total:</strong> ${booking.total}</p>
                          {booking.paymentStatus === 'submitted' && (
                            <p><strong>Payment:</strong> {booking.paymentMethod === 'bitcoin' ? 'Bitcoin' : booking.paymentMethod} - Awaiting Approval</p>
                          )}
                        </div>
                        <div className="order-actions">
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Payment options will be available soon!')}>Complete Payment</button>
                          )}
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Completed Orders Section */}
              <div className="completed-orders">
                <h3>Completed Orders</h3>
                {bookings.filter(booking => booking.status === 'completed' || booking.status === 'confirmed').length === 0 ? (
                  <div className="empty-state-small">
                    <p>No completed orders yet</p>
                  </div>
                ) : (
                  <div className="orders-grid">
                    {bookings.filter(booking => booking.status === 'completed' || booking.status === 'confirmed').map((booking) => (
                      <div key={booking.id || booking.bookingId || `completed-order-${booking.service}`} className="order-card completed">
                        <div className="order-header">
                          <div className="order-title">
                            <h3>{booking.service}</h3>
                            <p className="order-id">ID: {booking.bookingId}</p>
                          </div>
                          <span 
                            className="order-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="order-details">
                          <p><strong>Date:</strong> {booking.date || booking.sessionDetails?.date || booking.formData?.date ? formatDate(booking.date || booking.sessionDetails?.date || booking.formData?.date) : (booking.createdAt ? formatDate(booking.createdAt) : 'Date not available')}</p>
                          <p><strong>Total:</strong> ${booking.total}</p>
                          {booking.completedAt && (
                            <p><strong>Completed:</strong> {formatDate(booking.completedAt)}</p>
                          )}
                          <p><strong>Status:</strong> {booking.status === 'completed' ? 'Order Completed' : 'Payment Confirmed'}</p>
                        </div>
                        <div className="order-actions">
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* All Orders Section */}
              <div className="all-orders">
                <h3>Order History</h3>
                {isLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                  </div>
                ) : bookings.length > 0 ? (
                  <div className="orders-grid">
                    {bookings.map((booking) => (
                      <div key={booking.id || booking.bookingId || `order-${booking.service}-${booking.date}`} className="order-card">
                        <div className="order-header">
                          <div className="order-title">
                            <h3>{booking.service}</h3>
                            <p className="order-id">ID: {booking.bookingId}</p>
                          </div>
                          <span 
                            className="order-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="order-details">
                          <p><strong>Package:</strong> {booking.package || booking.sessionDetails?.package || booking.formData?.package || booking.podcastType || 'Standard Package'}</p>
                          <p><strong>Date:</strong> {booking.date || booking.sessionDetails?.date || booking.formData?.date ? formatDate(booking.date || booking.sessionDetails?.date || booking.formData?.date) : (booking.createdAt ? formatDate(booking.createdAt) : 'Date not available')}</p>
                          <p><strong>Time:</strong> {booking.time || booking.sessionDetails?.time || booking.formData?.time || 'To be scheduled'}</p>
                          <p><strong>Location:</strong> {booking.sessionDetails?.location === 'virtual' ? 'Virtual (Zoom)' : (booking.sessionDetails?.location || 'In-Person')}</p>
                          <p><strong>Total:</strong> ${booking.total || booking.pricing?.total || booking.price || booking.amount || 0}</p>
                          {booking.paymentStatus === 'submitted' && (
                            <p><strong>Payment:</strong> {booking.paymentMethod === 'bitcoin' ? 'Bitcoin' : booking.paymentMethod} - Awaiting Admin Approval</p>
                          )}
                          {booking.specialRequests?.requests && (
                            <p><strong>Special Requests:</strong> {booking.specialRequests.requests}</p>
                          )}
                        </div>
                        <div className="order-actions">
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Payment options will be available soon!')}>Complete Payment</button>
                          )}
                          {(booking.status === 'pending' || booking.status === 'pending_payment') && (
                            <button className="danger-btn" onClick={() => alert('Cancellation feature coming soon!')}>Cancel</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">📦</div>
                    <h3>No orders yet</h3>
                    <p>Start by making your first order with our meet and greet service.</p>
                    <button onClick={() => navigate('/celebrities')} className="primary-btn">
                  Make an Order
                </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="personalized-videos-section">
              <div className="section-header">
                <h2>Personalized Videos</h2>
                <div className="section-actions">
                  <button 
                    onClick={() => {
                      setMessage('');
                      loadUserBookings();
                    }} 
                    className="secondary-btn"
                    disabled={isLoading}
                    style={{ marginRight: '10px' }}
                  >
                    {isLoading ? 'Refreshing...' : '🔄 Refresh'}
                  </button>
                  <button onClick={() => navigate('/personalized-videos')} className="primary-btn">
                    Request Video
                  </button>
                </div>
              </div>
              
              {message && (bookings.some(b => b.status === 'pending' || b.status === 'pending_payment' || b.paymentStatus === 'submitted') || message.includes('success') || message.includes('longer than expected')) && (
                <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
                  <div className="message-content">
                    <span className="message-text">{message}</span>
                    <div className="message-actions">
                      {message.includes('longer than expected') && (
                        <>
                          <button 
                            onClick={() => {
                              setMessage('');
                              loadUserBookings();
                            }} 
                            className="retry-btn"
                          >
                            Retry
                          </button>
                          <button 
                            onClick={() => {
                              setMessage('');
                              setIsLoading(false);
                            }} 
                            className="cancel-btn"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {/* Pending Video Requests */}
              <div className="pending-videos">
                <h3>Pending Video Requests</h3>
                {bookings.filter(b => b.type === 'personalized_video' && (b.status === 'pending' || b.status === 'pending_payment')).length === 0 ? (
                  <div className="empty-state-small">
                    <p>No pending video requests</p>
                  </div>
                ) : (
                  <div className="videos-grid">
                    {bookings.filter(b => b.type === 'personalized_video' && (b.status === 'pending' || b.status === 'pending_payment')).map((booking) => (
                      <div key={booking.id || booking.bookingId || `pending-video-${booking.celebrity?.name}`} className="video-card pending">
                        <div className="video-header">
                          <div className="video-title">
                            <h3>{booking.celebrity?.name || 'Celebrity'} - {booking.videoDetails?.videoTypeName || 'Personalized Video'}</h3>
                            <p className="video-id">ID: {booking.bookingId}</p>
                          </div>
                          <span 
                            className="video-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="video-details">
                          <p><strong>For:</strong> {booking.personalInfo?.recipientName || 'Recipient'}</p>
                          <p><strong>From:</strong> {booking.personalInfo?.senderName || 'Sender'}</p>
                          <p><strong>Type:</strong> {booking.videoDetails?.videoTypeName || 'Standard Video'}</p>
                          <p><strong>Total:</strong> ${booking.pricing?.total || booking.total}</p>
                          {booking.videoDetails?.urgentDelivery && (
                            <p><strong>Delivery:</strong> Urgent (24-48 hours)</p>
                          )}
                          {booking.paymentStatus === 'submitted' && (
                            <p><strong>Payment:</strong> {booking.paymentMethod === 'bitcoin' ? 'Bitcoin' : booking.paymentMethod} - Awaiting Approval</p>
                          )}
                        </div>
                        <div className="video-actions">
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Payment options will be available soon!')}>Complete Payment</button>
                          )}
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* All Video Requests Section */}
              <div className="all-videos">
                <h3>Video Request History</h3>
                {isLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading your video requests...</p>
                  </div>
                ) : bookings.filter(b => b.type === 'personalized_video').length > 0 ? (
                  <div className="videos-grid">
                    {bookings.filter(b => b.type === 'personalized_video').map((booking) => (
                      <div key={booking.id || booking.bookingId || `video-${booking.celebrity?.name}-${booking.createdAt}`} className="video-card">
                        <div className="video-header">
                          <div className="video-title">
                            <h3>{booking.celebrity?.name || 'Celebrity'} - {booking.videoDetails?.videoTypeName || 'Personalized Video'}</h3>
                            <p className="video-id">ID: {booking.bookingId}</p>
                          </div>
                          <span 
                            className="video-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="video-details">
                          <p><strong>For:</strong> {booking.personalInfo?.recipientName || 'Recipient'}</p>
                          <p><strong>From:</strong> {booking.personalInfo?.senderName || 'Sender'}</p>
                          <p><strong>Type:</strong> {booking.videoDetails?.videoTypeName || 'Standard Video'}</p>
                          <p><strong>Total:</strong> ${booking.pricing?.total || booking.total}</p>
                          {booking.videoDetails?.urgentDelivery && (
                            <p><strong>Delivery:</strong> Urgent (24-48 hours)</p>
                          )}
                          {booking.paymentStatus === 'submitted' && (
                            <p><strong>Payment:</strong> {booking.paymentMethod === 'bitcoin' ? 'Bitcoin' : booking.paymentMethod} - Awaiting Admin Approval</p>
                          )}
                          {booking.videoDetails?.specialRequests && (
                            <p><strong>Special Requests:</strong> {booking.videoDetails.specialRequests}</p>
                          )}
                        </div>
                        <div className="video-actions">
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Payment options will be available soon!')}>Complete Payment</button>
                          )}
                          {(booking.status === 'pending' || booking.status === 'pending_payment') && (
                            <button className="danger-btn" onClick={() => alert('Cancellation feature coming soon!')}>Cancel</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-icon">🎥</div>
                    <h3>No video requests yet</h3>
                    <p>Start by requesting your first personalized video.</p>
                    <button onClick={() => navigate('/personalized-videos')} className="primary-btn">
                      Request Video
                    </button>
                  </div>
                )}
              </div>
              

            </div>
          )}

          {activeTab === 'celebrity-bookings' && (
            <div className="celebrity-bookings-section">
              <div className="section-header">
                <h2>Celebrity Bookings</h2>
                <button onClick={() => navigate('/celebrities')} className="primary-btn">Browse All Celebrities</button>
              </div>
              
              {/* Active Celebrity Bookings */}
              <div className="active-bookings">
                <h3>Active Celebrity Bookings</h3>
                {bookings.filter(b => (b.type === 'celebrity_booking' || b.type === 'celebrity_experience' || b.type === 'meet_greet' || (b.service && b.service.toLowerCase().includes('meet'))) && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'pending_payment')).length === 0 ? (
                  <div className="empty-state-small">
                    <p>No active celebrity bookings</p>
                  </div>
                ) : (
                  <div className="bookings-grid">
                    {bookings.filter(b => (b.type === 'celebrity_booking' || b.type === 'celebrity_experience' || b.type === 'meet_greet' || (b.service && b.service.toLowerCase().includes('meet'))) && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'pending_payment')).map((booking) => (
                      <div key={booking.id || booking.bookingId || `celebrity-${booking.celebrity?.name || booking.service}-${booking.date || booking.createdAt}`} className="booking-card">
                        <div className="booking-header">
                          <h4>{booking.celebrity?.name || booking.service} - Meet & Greet</h4>
                          <span 
                            className="booking-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="booking-details">
                          <p><strong>Date:</strong> {booking.eventDate || booking.date ? formatDate(booking.eventDate || booking.date) : 'TBD'}</p>
                          <p><strong>Time:</strong> {booking.eventTime || booking.time || 'TBD'}</p>
                          <p><strong>Location:</strong> {booking.location || 'TBD'}</p>
                          <p><strong>Total:</strong> ${booking.pricing?.total || booking.total}</p>
                          {booking.paymentStatus === 'submitted' && (
                            <p><strong>Payment:</strong> {booking.paymentMethod === 'bitcoin' ? 'Bitcoin' : booking.paymentMethod} - Awaiting Approval</p>
                          )}
                        </div>
                        <div className="booking-actions">
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Payment options will be available soon!')}>Complete Payment</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Booking History */}
              <div className="booking-history">
                <h3>Celebrity Booking History</h3>
                {bookings.filter(b => (b.type === 'celebrity_booking' || b.type === 'celebrity_experience' || b.type === 'meet_greet' || (b.service && b.service.toLowerCase().includes('meet')))).length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">⭐</div>
                    <h3>No celebrity bookings yet</h3>
                    <p>Browse and book your favorite celebrities for meet and greets, personalized videos, and more.</p>
                    <button onClick={() => navigate('/celebrities')} className="primary-btn">
                      Browse Celebrities
                    </button>
                  </div>
                ) : (
                  <div className="bookings-list">
                    {bookings.filter(b => (b.type === 'celebrity_booking' || b.type === 'celebrity_experience' || b.type === 'meet_greet' || (b.service && b.service.toLowerCase().includes('meet')))).map((booking) => (
                      <div key={booking.id || booking.bookingId || `celebrity-list-${booking.celebrity?.name || booking.service}-${booking.date || booking.createdAt}`} className="booking-item">
                        <div className="booking-info">
                          <h4>{booking.celebrity?.name || booking.service} - Meet & Greet</h4>
                          <p>{booking.eventDate || booking.date ? formatDate(booking.eventDate || booking.date) : 'Recent'} • ${booking.pricing?.total || booking.total}</p>
                          <p className="booking-date">{booking.createdAt ? formatDate(booking.createdAt) : 'Recent'}</p>
                        </div>
                        <span 
                          className="booking-status"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'class-enrollments' && (
            <div className="class-enrollments-section">
              <div className="section-header">
                <h2>Class Enrollments</h2>
                <button onClick={() => navigate('/acting-classes')} className="primary-btn">
                  Browse Classes
                </button>
              </div>
              
              {/* Current Enrollments */}
              <div className="current-enrollments">
                <h3>Current Enrollments</h3>
                {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'pending_payment')).length === 0 ? (
                  <div className="empty-state-small">
                    <p>No current class enrollments</p>
                  </div>
                ) : (
                  <div className="enrollments-grid">
                    {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'pending_payment')).map((booking) => (
                      <div key={booking.id || booking.bookingId || `class-${booking.className || booking.service}-${booking.createdAt}`} className="enrollment-card">
                        <div className="enrollment-header">
                          <h4>{booking.className || booking.service || 'Acting Class'}</h4>
                          <span 
                            className="enrollment-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="enrollment-details">
                          <p><strong>Duration:</strong> {booking.duration || booking.coach?.duration || booking.sessionDetails?.duration || '1 hour'}</p>
                          <p><strong>Start Date:</strong> {booking.startDate ? formatDate(booking.startDate) : booking.sessionDetails?.date ? formatDate(booking.sessionDetails.date) : booking.date ? formatDate(booking.date) : booking.createdAt ? formatDate(booking.createdAt) : 'To be scheduled'}</p>
                          <p><strong>Coach:</strong> {booking.coach?.name || booking.celebrity?.name || booking.sessionDetails?.instructor || 'Professional Coach'}</p>
                          <p><strong>Total:</strong> ${booking.pricing?.total || booking.total || booking.amount || 0}</p>
                          
                          {/* Payment Status Indicator */}
                          {booking.paymentStatus === 'submitted' && (
                            <div className="payment-status-indicator submitted">
                              <span>💳</span>
                              <span>Payment Submitted - Awaiting Admin Approval</span>
                            </div>
                          )}
                          {booking.status === 'confirmed' && (
                            <div className="payment-status-indicator confirmed">
                              <span>✅</span>
                              <span>Payment Confirmed - Enrollment Active</span>
                            </div>
                          )}
                        </div>
                        <div className="enrollment-actions">
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Payment options will be available soon!')}>Complete Payment</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Completed Classes */}
              <div className="completed-classes">
                <h3>Completed Classes</h3>
                {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && b.status === 'completed').length === 0 ? (
                  <div className="empty-state-small">
                    <p>No completed classes yet</p>
                  </div>
                ) : (
                  <div className="completed-list">
                    {bookings.filter(b => (b.type === 'acting_class' || b.type === 'class_enrollment') && b.status === 'completed').map((booking, index) => (
                      <div key={`completed-${booking.id || booking.bookingId || `${booking.className || booking.service}-${booking.createdAt}-${index}`}`} className="completed-item">
                        <div className="completed-info">
                          <h4>{booking.className || booking.service || 'Acting Class'}</h4>
                          <p>Completed: {booking.completedDate ? formatDate(booking.completedDate) : booking.createdAt ? formatDate(booking.createdAt) : booking.date ? formatDate(booking.date) : 'Date not available'} • ${booking.pricing?.total || booking.total || booking.amount || 0}</p>
                        </div>
                        <span className="completed-badge">COMPLETED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Available Classes Preview */}
              <div className="available-classes">
                <h3>Available Classes</h3>
                <div className="classes-preview">
                  <div className="class-preview-card">
                    <h4>Beginner Acting</h4>
                    <p>8 weeks • $299</p>
                    <button onClick={() => navigate('/acting-classes')} className="secondary-btn">
                      Enroll Now
                    </button>
                  </div>
                  <div className="class-preview-card">
                    <h4>Advanced Techniques</h4>
                    <p>12 weeks • $599</p>
                    <button onClick={() => navigate('/acting-classes')} className="secondary-btn">
                      Enroll Now
                    </button>
                  </div>
                  <div className="class-preview-card">
                    <h4>Masterclass Series</h4>
                    <p>6 weeks • $999</p>
                    <button onClick={() => navigate('/acting-classes')} className="secondary-btn">
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'podcast-requests' && (
            <div className="podcast-requests-section">
              <div className="section-header">
                <h2>Podcast Requests</h2>
                <button onClick={() => navigate('/podcast-requests')} className="primary-btn">
                  New Request
                </button>
              </div>
              
              {/* Active Requests */}
              <div className="active-requests">
                <h3>Active Requests</h3>
                {bookings.filter(b => (b.type === 'podcast_request' || b.type === 'podcast_booking') && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'pending_payment')).length === 0 ? (
                  <div className="empty-state-small">
                    <p>No active podcast requests</p>
                  </div>
                ) : (
                  <div className="requests-grid">
                    {bookings.filter(b => (b.type === 'podcast_request' || b.type === 'podcast_booking') && (b.status === 'confirmed' || b.status === 'pending' || b.status === 'pending_payment')).map((booking) => (
                      <div key={booking.id || booking.bookingId || `podcast-${booking.podcastType || booking.service}-${booking.createdAt}`} className="request-card">
                        <div className="request-header">
                          <h4>{booking.podcastType || booking.service || 'Podcast Request'}</h4>
                          <span 
                            className="request-status"
                            style={{ backgroundColor: getStatusColor(booking.status) }}
                          >
                            {booking.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div className="request-details">
                          <p><strong>Topic:</strong> {booking.podcastDetails?.podcastName || booking.topic || booking.formData?.topic || 'Interview Session'}</p>
                          <p><strong>Host:</strong> {booking.podcastDetails?.hostName || booking.formData?.hostName || booking.personalInfo?.firstName + ' ' + booking.personalInfo?.lastName || 'Host Name Pending'}</p>
                          <p><strong>Duration:</strong> {booking.podcastDetails?.duration || booking.formData?.duration || booking.duration || '30'} minutes</p>
                          <p><strong>Format:</strong> {booking.podcastDetails?.format || booking.formData?.podcastType || booking.podcastType || 'Interview'}</p>
                          <p><strong>Preferred Date:</strong> {booking.preferredDate ? formatDate(booking.preferredDate) : booking.formData?.preferredDate ? formatDate(booking.formData.preferredDate) : 'To be scheduled'}</p>
                          <p><strong>Total:</strong> ${booking.pricing?.total || booking.total || booking.amount || '0'}</p>
                          
                          {/* Payment Status Indicator */}
                          {booking.paymentStatus === 'submitted' && (
                            <div className="payment-status-indicator submitted">
                              <span>💳</span>
                              <span>Payment Submitted - Awaiting Admin Approval</span>
                            </div>
                          )}
                          {booking.status === 'confirmed' && (
                            <div className="payment-status-indicator confirmed">
                              <span>✅</span>
                              <span>Payment Confirmed - Booking Active</span>
                            </div>
                          )}
                        </div>
                        <div className="request-actions">
                          <button className="secondary-btn" onClick={() => setSelectedBooking(booking)}>View Details</button>
                          {booking.status === 'pending_payment' && booking.paymentStatus !== 'submitted' && (
                            <button className="primary-btn" onClick={() => alert('Payment options will be available soon!')}>Complete Payment</button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Request History */}
              <div className="request-history">
                <h3>Request History</h3>
                {bookings.filter(b => b.type === 'podcast_request' || b.type === 'podcast_booking').length === 0 ? (
                  <div className="empty-state-small">
                    <p>No previous podcast requests</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {bookings.filter(b => b.type === 'podcast_request' || b.type === 'podcast_booking').map((booking) => (
                      <div key={booking.id || booking.bookingId || `podcast-history-${booking.podcastType || booking.service}-${booking.createdAt}`} className="request-item">
                        <div className="request-info">
                          <h4>{booking.podcastType || booking.formData?.podcastType || booking.service || 'Podcast Interview'}</h4>
                          <p>{booking.topic || booking.formData?.topic || booking.podcastDetails?.podcastName || 'Interview Session'} • ${booking.pricing?.total || booking.total || booking.amount || '0'}</p>
                          <p className="request-date">{booking.createdAt ? formatDate(booking.createdAt) : booking.formData?.createdAt ? formatDate(booking.formData.createdAt) : 'Recent'}</p>
                        </div>
                        <span 
                          className="request-status"
                          style={{ backgroundColor: getStatusColor(booking.status) }}
                        >
                          {booking.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Quick Request Options */}
              <div className="quick-requests">
                <h3>Quick Request Options</h3>
                <div className="request-options">
                  <div className="request-option-card">
                    <div className="option-icon">🎤</div>
                    <h4>Guest Appearance</h4>
                    <p>30-60 minute sessions</p>
                    <button onClick={() => navigate('/podcast-requests')} className="secondary-btn">
                      Request Guest
                    </button>
                  </div>
                  <div className="request-option-card">
                    <div className="option-icon">🎧</div>
                    <h4>Interview Session</h4>
                    <p>Exclusive one-on-one interviews</p>
                    <button onClick={() => navigate('/podcast-requests')} className="secondary-btn">
                      Book Interview
                    </button>
                  </div>
                  <div className="request-option-card">
                    <div className="option-icon">🎬</div>
                    <h4>Production Service</h4>
                    <p>Full podcast production</p>
                    <button onClick={() => navigate('/podcast-requests')} className="secondary-btn">
                      Get Quote
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="promotions-section">
              <div className="section-header">
                <h2>Promotions & Offers</h2>
                <button onClick={() => navigate('/promotions')} className="primary-btn">
                  View All Offers
                </button>
              </div>
              
              <div className="section-content">
                <div className="promo-grid">
                  <div className="promo-card featured">
                    <div className="promo-badge">🔥 Hot Deal</div>
                    <h3>First Booking Discount</h3>
                    <p>Get 20% off your first celebrity booking</p>
                    <div className="promo-code">Code: FIRST20</div>
                    <button onClick={() => navigate('/promotions')} className="primary-btn">Use Now</button>
                  </div>
                  <div className="promo-card">
                    <div className="promo-badge">⭐ Limited Time</div>
                    <h3>VIP Package Deal</h3>
                    <p>Upgrade to VIP experience for just $50 more</p>
                    <div className="promo-code">Code: VIP50</div>
                    <button onClick={() => navigate('/promotions')} className="secondary-btn">Learn More</button>
                  </div>
                  <div className="promo-card">
                    <div className="promo-badge">🎁 Special</div>
                    <h3>Group Booking Savings</h3>
                    <p>Book for 3+ people and save 15%</p>
                    <div className="promo-code">Code: GROUP15</div>
                    <button onClick={() => navigate('/promotions')} className="secondary-btn">Book Group</button>
                  </div>
                </div>
                
                <div className="promotion-history">
                  <h3>Your Promotion History</h3>
                  {bookings.filter(b => b.type === 'promotion').length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">🎯</div>
                      <h4>No promotions used yet</h4>
                      <p>Take advantage of our special offers and promotional deals.</p>
                    </div>
                  ) : (
                    <div className="promotions-list">
                      {bookings.filter(b => b.type === 'promotion').map((promotion, index) => (
                        <div key={`promotion-${promotion.id || promotion.bookingId || `promo-${index}`}`} className="promotion-item">
                          <div className="promotion-info">
                            <h4>{promotion.celebrity?.name || 'Promotional Booking'}</h4>
                            <p>Package: {promotion.package || promotion.sessionDetails?.package || promotion.formData?.package || promotion.podcastType || 'Standard Package'} • Amount: ${promotion.total || (promotion.service && typeof promotion.service === 'object' ? promotion.service.price : promotion.service) || promotion.amount || promotion.pricing?.total || promotion.price || 0}</p>
                            <p className="promotion-date">{promotion.date || promotion.sessionDetails?.date || promotion.formData?.date ? formatDate(promotion.date || promotion.sessionDetails?.date || promotion.formData?.date) : (promotion.createdAt ? formatDate(promotion.createdAt) : 'Date not available')}</p>
                          </div>
                          <span 
                            className="promotion-status"
                            style={{ backgroundColor: getStatusColor(promotion.status) }}
                          >
                            {String(promotion.status || 'pending').replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="newsletter-signup">
                  <h3>Never Miss a Deal</h3>
                  <p>Subscribe to get exclusive promotions and early access to new celebrities</p>
                  <div className="newsletter-form">
                    <input type="email" placeholder="Enter your email" className="form-input" />
                    <button className="primary-btn">Subscribe</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-section">
              <div className="section-header">
                <h2>Notifications</h2>
                <button 
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({...n, read: true})));
                    setUnreadCount(0);
                  }} 
                  className="secondary-btn"
                  disabled={unreadCount === 0}
                >
                  Mark All as Read
                </button>
              </div>
              
              <div className="section-content">
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔔</div>
                    <h3>No notifications yet</h3>
                    <p>You'll see updates about your bookings and payments here</p>
                  </div>
                ) : (
                  <div className="notifications-list">
                    {notifications.map((notification) => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                      >
                        <div className="notification-icon">
                          {notification.type === 'payment_approved' && '✅'}
                          {notification.type === 'booking_confirmed' && '📅'}
                          {notification.type === 'payment_pending' && '⏳'}
                          {notification.type === 'general' && '📢'}
                        </div>
                        <div className="notification-content">
                          <h4>{notification.title}</h4>
                          <p>{notification.message}</p>
                          <span className="notification-time">
                            {notification.createdAt?.toDate?.()?.toLocaleString?.() || 'Just now'}
                          </span>
                        </div>
                        {!notification.read && <div className="unread-indicator"></div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'donations' && (
            <div className="donations-section">
              <div className="section-header">
                <h2>Donations & Charity</h2>
                <button onClick={() => navigate('/donations')} className="primary-btn">
                  Make a Donation
                </button>
              </div>
              
              <div className="section-content">
                <div className="charity-grid">
                  <div className="charity-card">
                    <div className="charity-icon">🏥</div>
                    <h3>Healthcare Foundation</h3>
                    <p>Supporting medical research and patient care</p>
                    <div className="charity-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '75%'}}></div>
                      </div>
                      <span>$75,000 of $100,000 raised</span>
                    </div>
                    <button onClick={() => navigate('/donations')} className="secondary-btn">Donate Now</button>
                  </div>
                  <div className="charity-card">
                    <div className="charity-icon">🎓</div>
                    <h3>Education Initiative</h3>
                    <p>Providing scholarships for underprivileged students</p>
                    <div className="charity-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '60%'}}></div>
                      </div>
                      <span>$30,000 of $50,000 raised</span>
                    </div>
                    <button onClick={() => navigate('/donations')} className="secondary-btn">Donate Now</button>
                  </div>
                  <div className="charity-card">
                    <div className="charity-icon">🌍</div>
                    <h3>Environmental Protection</h3>
                    <p>Fighting climate change and protecting wildlife</p>
                    <div className="charity-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '40%'}}></div>
                      </div>
                      <span>$20,000 of $50,000 raised</span>
                    </div>
                    <button onClick={() => navigate('/donations')} className="secondary-btn">Donate Now</button>
                  </div>
                </div>
                
                <div className="donation-history">
                  <h3>Your Donation History</h3>
                  {bookings.filter(b => b.type === 'donation').length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">💝</div>
                      <h4>No donations made yet</h4>
                      <p>Support your favorite celebrities' charitable causes and make a difference.</p>
                      <button onClick={() => navigate('/donations')} className="primary-btn">
                        View All Causes
                      </button>
                    </div>
                  ) : (
                    <div className="donations-list">
                      {bookings.filter(b => b.type === 'donation').map((donation) => (
                        <div key={donation.id || donation.bookingId || `donation-${donation.campaign?.title}-${donation.createdAt}`} className="donation-item">
                          <div className="donation-info">
                            <h4>{donation.campaign?.title || 'Charitable Donation'}</h4>
                            <p>Amount: ${donation.amount} • {donation.campaign?.celebrity || 'General Fund'}</p>
                            <p className="donation-date">{donation.createdAt ? formatDate(donation.createdAt) : 'Recent'}</p>
                          </div>
                          <span 
                            className="donation-status"
                            style={{ backgroundColor: getStatusColor(donation.status) }}
                          >
                            {String(donation.status || 'pending').replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Profile Settings</h2>
                {!isEditing && (
                  <button onClick={() => setIsEditing(true)} className="primary-btn">
                    Edit Profile
                  </button>
                )}
              </div>

              {profileMessage && bookings.some(b => b.status === 'pending' || b.status === 'pending_payment' || b.paymentStatus === 'submitted') && (
                <div className={`message ${profileMessage.includes('success') ? 'success' : 'error'}`}>
                  {profileMessage}
                </div>
              )}

              <form onSubmit={handleProfileUpdate} className="profile-form">
                <div className="form-group">
                  <label htmlFor="displayName">Full Name</label>
                  <input
                    type="text"
                    id="displayName"
                    name="displayName"
                    value={profileData.displayName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={profileData.email}
                    disabled
                    className="form-input disabled"
                  />
                  <small>Email cannot be changed</small>
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    name="address"
                    value={profileData.address}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-input"
                    rows="3"
                  />
                </div>

                {isEditing && (
                  <div className="form-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setMessage('');
                      }}
                      className="secondary-btn"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="primary-btn"
                    >
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
      
      {/* Modern Slide-out Panel for Booking Details */}
      {selectedBooking && (
        <>
          <div className="slide-panel-overlay" onClick={() => setSelectedBooking(null)}></div>
          <div className="slide-panel">
            <div className="slide-panel-header">
              <div className="panel-title">
                <h2>Booking Details</h2>
                <span className="booking-id">#{selectedBooking.bookingId || selectedBooking.id}</span>
              </div>
              <button className="panel-close-btn" onClick={() => setSelectedBooking(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            
            <div className="slide-panel-content">
              <div className="booking-overview">
                <div className="status-badge" style={{ backgroundColor: getStatusColor(selectedBooking.status) }}>
                  {selectedBooking.status.replace('_', ' ').toUpperCase()}
                </div>
                <h3>{selectedBooking.service}</h3>
                <div className="total-amount">${selectedBooking.total}</div>
              </div>
              
              {selectedBooking.celebrity && (
                <div className="panel-section">
                  <h4>Celebrity</h4>
                  <div className="celebrity-card">
                    <img 
                      src={selectedBooking.celebrity.image} 
                      alt={selectedBooking.celebrity.name}
                      className="celebrity-avatar"
                    />
                    <div className="celebrity-details">
                      <h5>{selectedBooking.celebrity.name}</h5>
                      <p>${selectedBooking.celebrity.price}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {(selectedBooking.type === 'podcast_request' || selectedBooking.type === 'podcast_booking') ? (
                <div className="panel-section">
                  <h4>Podcast Details</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Topic</span>
                      <span className="info-value">{selectedBooking.podcastDetails?.podcastName || selectedBooking.topic || selectedBooking.formData?.topic || 'Interview Session'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Host Name</span>
                      <span className="info-value">{selectedBooking.podcastDetails?.hostName || selectedBooking.formData?.hostName || selectedBooking.personalInfo?.firstName + ' ' + selectedBooking.personalInfo?.lastName || 'Host Name Pending'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Duration</span>
                      <span className="info-value">{selectedBooking.podcastDetails?.duration || selectedBooking.formData?.duration || selectedBooking.duration || '30'} minutes</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Format</span>
                      <span className="info-value">{selectedBooking.podcastDetails?.format || selectedBooking.formData?.podcastType || selectedBooking.podcastType || 'Interview'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Preferred Date</span>
                      <span className="info-value">{selectedBooking.preferredDate ? formatDate(selectedBooking.preferredDate) : selectedBooking.formData?.preferredDate ? formatDate(selectedBooking.formData.preferredDate) : 'To be scheduled'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Recording Date</span>
                      <span className="info-value">{selectedBooking.date ? formatDate(selectedBooking.date) : selectedBooking.sessionDetails?.date ? formatDate(selectedBooking.sessionDetails.date) : selectedBooking.formData?.date ? formatDate(selectedBooking.formData.date) : 'To be scheduled'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="panel-section">
                  <h4>Session Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Date</span>
                      <span className="info-value">{selectedBooking.date ? formatDate(selectedBooking.date) : selectedBooking.sessionDetails?.date ? formatDate(selectedBooking.sessionDetails.date) : selectedBooking.formData?.date ? formatDate(selectedBooking.formData.date) : selectedBooking.createdAt ? formatDate(selectedBooking.createdAt) : 'To be scheduled'}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Time</span>
                      <span className="info-value">{selectedBooking.time || selectedBooking.sessionDetails?.time || selectedBooking.formData?.time || 'To be scheduled'}</span>
                    </div>
                    {selectedBooking.sessionDetails?.location && (
                      <div className="info-item">
                        <span className="info-label">Location</span>
                        <span className="info-value">{selectedBooking.sessionDetails.location === 'virtual' ? 'Virtual (Zoom)' : 'In-Person'}</span>
                      </div>
                    )}
                    {selectedBooking.sessionDetails?.language && (
                      <div className="info-item">
                        <span className="info-label">Language</span>
                        <span className="info-value">{selectedBooking.sessionDetails.language}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedBooking.personalInfo && (
                <div className="panel-section">
                  <h4>Contact Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Name</span>
                      <span className="info-value">{selectedBooking.personalInfo.firstName} {selectedBooking.personalInfo.lastName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{selectedBooking.personalInfo.email}</span>
                    </div>
                    {selectedBooking.personalInfo.phone && (
                      <div className="info-item">
                        <span className="info-label">Phone</span>
                        <span className="info-value">{selectedBooking.personalInfo.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {selectedBooking.specialRequests?.requests && (
                <div className="panel-section">
                  <h4>Special Requests</h4>
                  <div className="special-note">
                    <p>{selectedBooking.specialRequests.requests}</p>
                  </div>
                </div>
              )}
              
              {selectedBooking.paymentStatus === 'submitted' && (
                <div className="panel-section">
                  <h4>Payment Information</h4>
                  <div className="payment-info">
                    <div className="payment-method">
                      <span>Method: {selectedBooking.paymentMethod === 'bitcoin' ? 'Bitcoin' : selectedBooking.paymentMethod}</span>
                    </div>
                    <div className="payment-status">
                      <span>Status: Awaiting Admin Approval</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="slide-panel-actions">
              {selectedBooking.status === 'pending_payment' && selectedBooking.paymentStatus !== 'submitted' && (
                <button className="action-btn primary" onClick={() => alert('Payment options will be available soon!')}>
                  Complete Payment
                </button>
              )}
              <button className="action-btn secondary" onClick={() => setSelectedBooking(null)}>
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
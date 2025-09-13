import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Loader from './components/Loader';
import PageTransition from './components/PageTransition';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import Dashboard from './components/dashboard/Dashboard';
import Home from './pages/Home';
import CelebritiesPage from './pages/CelebritiesPage';
import ServicesPage from './pages/ServicesPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminPage from './pages/AdminPage';
import PersonalizedVideos from './pages/PersonalizedVideos';
import BookVideoPage from './pages/BookVideoPage';
import PromotionsPage from './pages/PromotionsPage';
import DonationsPage from './pages/DonationsPage';
import PodcastRequestsPage from './pages/PodcastRequestsPage';
import './App.css';
import ChatBot from './components/ChatBot';
import visitorTracker from './services/visitorTracker';
import CookieConsent from './components/CookieConsent';
import BookingSuccess from './pages/BookingSuccess';
import BookingCancelled from './pages/BookingCancelled';
import ActingClasses from './pages/ActingClasses';
import NotificationToast from './components/NotificationToast';
import './utils/UltimateNotificationManager'; // Initialize notification manager
import './utils/testUserRegistration'; // Import test function for browser console
import './utils/debugUserIssue';
import './utils/testUserCreation'; // Import user creation test
import './utils/testNotification'; // Import notification test functions

function AppContent() {
  const location = useLocation();
  const adminRoute = process.env.REACT_APP_ADMIN_ROUTE || '/dashboard-mgmt-2024';
  const isAdminPage = location.pathname === adminRoute;
  
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/celebrities" element={<CelebritiesPage />} />
            <Route path="/services" element={<ServicesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/personalized-videos" element={<PersonalizedVideos />} />
            <Route path="/acting-classes" element={<ActingClasses />} />
            <Route path="/promotions" element={<PromotionsPage />} />
            <Route path="/donations" element={<DonationsPage />} />
            <Route path="/podcast-requests" element={<PodcastRequestsPage />} />
            <Route path="/book-video" element={<BookVideoPage />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route path="/booking-cancelled" element={<BookingCancelled />} />
            
            {/* Authentication Routes */}
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <Login />
              </ProtectedRoute>
            } />
            <Route path="/signup" element={
              <ProtectedRoute requireAuth={false}>
                <Signup />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPassword />
              </ProtectedRoute>
            } />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path={adminRoute} element={<AdminPage />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
      <ScrollToTop />
      {/* Only show ChatBot on non-admin pages */}
      {!isAdminPage && <ChatBot />}
      <NotificationToast />
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [trackingEnabled, setTrackingEnabled] = useState(
    localStorage.getItem('cookieConsent') === 'accepted'
  );

  const handleCookieAccept = () => {
    setTrackingEnabled(true);
    visitorTracker.trackPageView(window.location.pathname);
  };

  const handleCookieDecline = () => {
    setTrackingEnabled(false);
  };

  useEffect(() => {
    if (trackingEnabled) {
      visitorTracker.trackPageView(window.location.pathname);
    }
    
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [trackingEnabled]);

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Loader isLoading={isLoading}>
            <Router>
              <AppContent />
              <CookieConsent 
                onAccept={handleCookieAccept}
                onDecline={handleCookieDecline}
              />
            </Router>
          </Loader>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
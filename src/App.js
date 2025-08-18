import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Loader from './components/Loader';
import PageTransition from './components/PageTransition';
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
            <Route path={adminRoute} element={<AdminPage />} />
          </Routes>
        </PageTransition>
      </main>
      <Footer />
      <ScrollToTop />
      {/* Only show ChatBot on non-admin pages */}
      {!isAdminPage && <ChatBot />}
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
    <Loader isLoading={isLoading}>
      <Router>
        <AppContent />
        <CookieConsent 
          onAccept={handleCookieAccept}
          onDecline={handleCookieDecline}
        />
      </Router>
    </Loader>
  );
}

export default App;
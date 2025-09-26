import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createPayment } from '../services/paymentService';
import BitcoinPayment from '../components/BitcoinPayment';
import PaymentModal from '../components/PaymentModal';
import CryptoTutorial from '../components/CryptoTutorial';
import './DonationsPage.css';

const DonationsPage = () => {
  // Test function to verify Firebase connection
  window.testDonationSave = async () => {
    try {
      const { addDoc, collection } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');
      
      const testDonation = {
        id: 'TEST_' + Date.now(),
        type: 'donation',
        campaign: { id: 'test', title: 'Test Campaign' },
        amount: 10,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod: 'test',
        userId: 'test-user',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'donations'), testDonation);
      // Test donation saved successfully
      return { success: true, id: docRef.id };
    } catch (error) {
      console.error('Test donation save failed:', error);
      return { success: false, error: error.message };
    }
  };

  const { currentUser } = useAuth();
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBitcoinPayment, setShowBitcoinPayment] = useState(false);
  const [showCryptoTutorial, setShowCryptoTutorial] = useState(false);
  const [tutorialVideoType, setTutorialVideoType] = useState(null);
  const [campaignAmounts, setCampaignAmounts] = useState({});
  const [clickedButtonRef, setClickedButtonRef] = useState(null);
  const paymentModalRef = useRef(null);
  
  // Prevent scroll when showing Bitcoin payment
  useEffect(() => {
    if (showBitcoinPayment) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    }
  }, [showBitcoinPayment]);

  const campaigns = [
    {
      id: 1,
      title: 'Education for All',
      celebrity: 'Emma Watson',
      description: 'Providing quality education to underprivileged children worldwide through school building and scholarship programs',
      raised: 125000,
      goal: 200000,
      supporters: 1250,
      image: '📚',
      category: 'Education'
    },
    {
      id: 2,
      title: 'Clean Water Initiative',
      celebrity: 'Leonardo DiCaprio',
      description: 'Building wells and water purification systems in rural communities across Africa and Asia',
      raised: 89000,
      goal: 150000,
      supporters: 890,
      image: '💧',
      category: 'Environment'
    },
    {
      id: 3,
      title: 'Mental Health Awareness',
      celebrity: 'Dwayne Johnson',
      description: 'Supporting mental health programs, suicide prevention, and therapy access for underserved communities',
      raised: 156000,
      goal: 250000,
      supporters: 2100,
      image: '🧠',
      category: 'Health'
    },
    {
      id: 4,
      title: 'Animal Rescue Initiative',
      celebrity: 'Ricky Gervais',
      description: 'Rescuing and rehabilitating abandoned animals, supporting no-kill shelters worldwide',
      raised: 67000,
      goal: 100000,
      supporters: 670,
      image: '🐾',
      category: 'Animals'
    },
    {
      id: 5,
      title: 'Youth Empowerment Program',
      celebrity: 'Oprah Winfrey',
      description: 'Empowering at-risk youth through mentorship, job training, and leadership development programs',
      raised: 198000,
      goal: 300000,
      supporters: 1580,
      image: '🌟',
      category: 'Youth Development'
    },
    {
      id: 6,
      title: 'Disaster Relief Fund',
      celebrity: 'Ryan Reynolds',
      description: 'Providing emergency aid, shelter, and rebuilding support for communities affected by natural disasters',
      raised: 143000,
      goal: 250000,
      supporters: 1120,
      image: '🏠',
      category: 'Emergency Relief'
    }
  ];

  // Add useEffect to set progress widths after component mounts
  useEffect(() => {
    // Set progress bar widths and trigger animations
    const progressBars = document.querySelectorAll('.progress-fill');
    
    // Use the campaigns array directly since it's static
    const staticCampaigns = [
      {
        id: 1,
        title: 'Education for All',
        celebrity: 'Emma Watson',
        description: 'Providing quality education to underprivileged children worldwide through school building and scholarship programs',
        raised: 125000,
        goal: 200000,
        supporters: 1250,
        image: '📚',
        category: 'Education'
      },
      {
        id: 2,
        title: 'Clean Water Initiative',
        celebrity: 'Leonardo DiCaprio',
        description: 'Building wells and water purification systems in rural communities across Africa and Asia',
        raised: 89000,
        goal: 150000,
        supporters: 890,
        image: '💧',
        category: 'Environment'
      },
      {
        id: 3,
        title: 'Mental Health Awareness',
        celebrity: 'Dwayne Johnson',
        description: 'Supporting mental health programs, suicide prevention, and therapy access for underserved communities',
        raised: 156000,
        goal: 250000,
        supporters: 2100,
        image: '🧠',
        category: 'Health'
      },
      {
        id: 4,
        title: 'Animal Rescue Initiative',
        celebrity: 'Ricky Gervais',
        description: 'Rescuing and rehabilitating abandoned animals, supporting no-kill shelters worldwide',
        raised: 67000,
        goal: 100000,
        supporters: 670,
        image: '🐾',
        category: 'Animals'
      },
      {
        id: 5,
        title: 'Youth Empowerment Program',
        celebrity: 'Oprah Winfrey',
        description: 'Empowering at-risk youth through mentorship, job training, and leadership development programs',
        raised: 198000,
        goal: 300000,
        supporters: 1580,
        image: '🌟',
        category: 'Youth Development'
      },
      {
        id: 6,
        title: 'Disaster Relief Fund',
        celebrity: 'Ryan Reynolds',
        description: 'Providing emergency aid, shelter, and rebuilding support for communities affected by natural disasters',
        raised: 143000,
        goal: 250000,
        supporters: 1120,
        image: '🏠',
        category: 'Emergency Relief'
      }
    ];
    
    staticCampaigns.forEach((campaign, index) => {
      const progressBar = progressBars[index];
      if (progressBar) {
        const percentage = Math.round((campaign.raised / campaign.goal) * 100);
        
        // Set CSS custom property for the specific progress bar
        progressBar.style.setProperty('--progress-width', `${percentage}%`);
        
        // Add loading attribute for pulsing effect
        progressBar.setAttribute('data-loading', 'true');
        
        // Remove loading attribute after animation completes
        setTimeout(() => {
          progressBar.setAttribute('data-loading', 'false');
        }, 2500);
      }
    });
  }, []); // Empty dependency array since we're using static data

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = (raised, goal) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const handleAmountChange = (campaignId, amount) => {
    setCampaignAmounts(prev => ({
      ...prev,
      [campaignId]: amount
    }));
  };

  // Helper function to check for duplicates in Firebase
  const checkFirebaseDuplicates = async (donationData) => {
    try {
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const { db } = await import('../services/firebase');
      
      if (!currentUser?.uid) {
        return false; // Skip Firebase check for anonymous users
      }
      
      const donationsQuery = query(
        collection(db, 'donations'),
        where('userId', '==', currentUser.uid),
        where('campaign.id', '==', donationData.campaign?.id || ''),
        where('type', '==', 'donation')
      );
      
      const querySnapshot = await getDocs(donationsQuery);
      
      const firebaseDuplicate = querySnapshot.docs.some(doc => {
        const data = doc.data();
        const sameAmount = Math.abs((data.amount || 0) - (donationData.amount || 0)) < 0.01;
        const timeDiff = Math.abs(new Date(data.createdAt?.toDate?.() || data.createdAt).getTime() - new Date().getTime());
        const recentTime = timeDiff < 300000; // Within 5 minutes
        
        return sameAmount && recentTime;
      });
      
      return firebaseDuplicate;
    } catch (error) {
      console.error('Error checking Firebase duplicates:', error);
      return false; // Don't block on error
    }
  };

  const handleDonate = (campaign, event) => {
    const amount = parseFloat(campaignAmounts[campaign.id] || '');
    if (!amount || amount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }
    
    // Store reference to the clicked button
    setClickedButtonRef(event.target);
    
    setSelectedCampaign(campaign);
    setDonationAmount(amount);
    setShowPaymentModal(true);
    
    // Scroll to payment modal after it renders
    setTimeout(() => {
      if (paymentModalRef.current) {
        const modalElement = paymentModalRef.current.querySelector('.payment-modal');
        if (modalElement) {
          modalElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }
      }
    }, 100);
  };

  const handleRegularPayment = async (formData) => {
    try {
      const donationId = 'DONATE' + Date.now();
      
      const paymentRequestData = {
        bookingId: donationId,
        totalAmount: donationAmount,
        celebrityName: selectedCampaign.title,
        selectedCrypto: 'btc',
        email: formData.email
      };
      
      const response = await createPayment(paymentRequestData);
      
      if (response && response.invoice_url) {
        // Parse fullName into firstName and lastName for admin panel compatibility
        const nameParts = (formData.fullName || '').trim().split(' ');
        const firstName = nameParts[0] || 'Anonymous';
        const lastName = nameParts.slice(1).join(' ') || 'Donor';
        
        const donationData = {
          id: donationId,
          type: 'donation',
          campaign: selectedCampaign,
          amount: parseFloat(donationAmount) || 0,
          formData: {
            ...formData,
            firstName,
            lastName
          },
          personalInfo: {
            firstName,
            lastName,
            email: formData.email,
            phone: formData.phone || 'N/A',
            fullName: formData.fullName
          },
          donorInfo: {
            firstName,
            lastName,
            email: formData.email,
            phone: formData.phone || 'N/A'
          },
          paymentUrl: response.invoice_url,
          status: 'pending_payment',
          paymentMethod: 'crypto',
          userId: currentUser?.uid || 'anonymous',
          userEmail: formData.email,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Enhanced duplicate detection for donations (similar to celebrity bookings)
        const existingDonations = JSON.parse(localStorage.getItem('donations') || '[]');
        
        const isDuplicate = existingDonations.some(donation => {
          // Check for exact match on multiple fields
          const sameUser = donation.formData?.email === formData.email;
          const sameCampaign = donation.campaign?.id === selectedCampaign.id;
          const sameAmount = Math.abs((donation.amount || 0) - (parseFloat(donationAmount) || 0)) < 0.01;
          const sameType = donation.type === 'donation';
          const recentTime = Math.abs(new Date(donation.createdAt).getTime() - new Date().getTime()) < 300000; // Within 5 minutes
          
          return sameUser && sameCampaign && sameAmount && sameType && recentTime;
        });
        
        if (isDuplicate) {
          // Duplicate donation detected, skipping save
          alert('A similar donation was recently submitted. Please check your dashboard.');
          setShowPaymentModal(false);
          return;
        }
        
        existingDonations.push(donationData);
        localStorage.setItem('donations', JSON.stringify(existingDonations));
        
        // Note: Don't save to Firebase here - only save after payment completion
        // This prevents duplicate entries in the admin panel
        // Donation saved to localStorage
        
        // Show notification (similar to celebrity booking)
        const notification = {
          id: Date.now(),
          type: 'payment_reminder',
          title: 'Donation Payment Initiated!',
          message: 'Your donation payment has been initiated. Complete the payment and check your User Management section to track status.',
          timestamp: new Date().toISOString(),
          read: false
        };
        
        const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        existingNotifications.unshift(notification);
        localStorage.setItem('notifications', JSON.stringify(existingNotifications));
        
        window.open(response.invoice_url, '_blank');
        setShowPaymentModal(false);
        setCampaignAmounts(prev => ({
          ...prev,
          [selectedCampaign.id]: ''
        }));
        
        // Save to Firebase for regular payments after payment initiation
        try {
          const { addDoc, collection } = await import('firebase/firestore');
          const { db } = await import('../services/firebase');
          
          const docRef = await addDoc(collection(db, 'donations'), {
            ...donationData,
            userId: currentUser?.uid || 'anonymous',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          // Regular donation saved to Firebase
        } catch (firebaseError) {
          console.error('Error saving donation to Firebase:', firebaseError);
          alert('Donation saved locally but failed to sync to cloud. Please contact support if payment completes.');
        }
        
        // Auto-redirect to dashboard after 2 seconds
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment processing failed. Please try again.');
    }
  };

  const handleBitcoinPayment = (formData) => {
    const donationId = 'DONATE' + Date.now();
    
    // Parse fullName into firstName and lastName for admin panel compatibility
    const nameParts = (formData.fullName || '').trim().split(' ');
    const firstName = nameParts[0] || 'Anonymous';
    const lastName = nameParts.slice(1).join(' ') || 'Donor';
    
    const donationData = {
      id: donationId,
      type: 'donation',
      campaign: selectedCampaign,
      amount: parseFloat(donationAmount) || 0,
      formData: {
        ...formData,
        firstName,
        lastName
      },
      personalInfo: {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone || 'N/A',
        fullName: formData.fullName
      },
      donorInfo: {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone || 'N/A'
      },
      status: 'pending_bitcoin_payment',
      paymentMethod: 'bitcoin',
      userId: currentUser?.uid || 'anonymous',
      userEmail: formData.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const existingDonations = JSON.parse(localStorage.getItem('donations') || '[]');
    existingDonations.push(donationData);
    localStorage.setItem('donations', JSON.stringify(existingDonations));
    
    setShowBitcoinPayment(true);
    // Keep the payment modal open - don't close it
    // setShowPaymentModal(false);
  };

  const handleBitcoinPaymentComplete = async () => {
    try {
      // Update donation status in localStorage
      const existingDonations = JSON.parse(localStorage.getItem('donations') || '[]');
      
      // Enhanced duplicate detection before updating
      const currentDonation = existingDonations.find(donation => 
        donation.campaign?.id === selectedCampaign.id && 
        donation.status === 'pending_bitcoin_payment'
      );
      
      if (currentDonation) {
        // Check for duplicates in Firebase before saving
        const isDuplicateInFirebase = await checkFirebaseDuplicates(currentDonation);
        if (isDuplicateInFirebase) {
          // Duplicate donation found in Firebase, skipping save
          alert('A similar donation already exists. Please check your dashboard.');
          setShowBitcoinPayment(false);
          setShowPaymentModal(false);
          return;
        }
      }
      
      const updatedDonations = existingDonations.map(donation => {
        if (donation.campaign?.id === selectedCampaign.id && donation.status === 'pending_bitcoin_payment') {
          return {
            ...donation,
            status: 'pending', // Pending admin approval like celebrity bookings
            paymentStatus: 'pending',
            paymentMethod: 'bitcoin',
            paymentReceived: true,
            paymentVerifiedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
        }
        return donation;
      });
      localStorage.setItem('donations', JSON.stringify(updatedDonations));
      
      // Save to Firebase (similar to celebrity booking logic)
      try {
        const { addDoc, collection } = await import('firebase/firestore');
        const { db } = await import('../services/firebase');
        
        const donationData = updatedDonations.find(d => 
          d.campaign?.id === selectedCampaign.id && d.paymentReceived
        );
        
        if (donationData) {
          const docRef = await addDoc(collection(db, 'donations'), {
            ...donationData,
            userId: currentUser?.uid || 'anonymous',
            createdAt: new Date(),
            updatedAt: new Date()
          });
          // Bitcoin donation saved to Firebase
        }
      } catch (firebaseError) {
        console.error('Error saving donation to Firebase:', firebaseError);
        // Don't fail the entire process if Firebase save fails
      }
      
      // Show notification (similar to celebrity booking)
      const notification = {
        id: Date.now(),
        type: 'payment_reminder',
        title: 'Donation Payment Submitted Successfully!',
        message: 'Your Bitcoin donation payment has been submitted. Check your User Management section to track approval status.',
        timestamp: new Date().toISOString(),
        read: false
      };
      
      const existingNotifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      existingNotifications.unshift(notification);
      localStorage.setItem('notifications', JSON.stringify(existingNotifications));
      
    } catch (error) {
      console.error('Error processing donation completion:', error);
      alert('Donation saved locally but there was an issue with cloud sync. Your donation is still valid.');
    }
    
    setShowBitcoinPayment(false);
    setShowPaymentModal(false);
    setCampaignAmounts(prev => ({
      ...prev,
      [selectedCampaign.id]: ''
    }));
    
    // Auto-redirect to dashboard after 3 seconds (like celebrity booking)
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 3000);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
    setShowBitcoinPayment(false);
    
    // Restore body scroll
    document.body.style.overflow = 'unset';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    
    // Scroll back to the clicked button
    setTimeout(() => {
      if (clickedButtonRef) {
        clickedButtonRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }, 100);
  };

  return (
    <div className="donations-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Make a Difference Today</h1>
          <p>Join celebrities in supporting causes that matter. Every donation counts towards building a better world.</p>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="campaigns-section">
        <div className="container">
          <h2>Active Campaigns</h2>
          <div className="campaigns-grid">
            {campaigns.map((campaign) => (
              <div key={campaign.id} id={`campaign-${campaign.id}`} className="campaign-card">
                <div className="campaign-header">
                  <div className="campaign-title-section">
                    <div className="campaign-icon">{campaign.image}</div>
                    <div className="campaign-title-info">
                      <h3>{campaign.title}</h3>
                      <p className="celebrity-name">Supported by {campaign.celebrity}</p>
                      <span className="campaign-category">{campaign.category}</span>
                    </div>
                  </div>
                </div>
                
                <div className="campaign-body">
                  <p className="campaign-description">{campaign.description}</p>
                  
                  <div className="progress-section">
                    <div className="progress-header">
                      <span className="progress-label">Campaign Progress</span>
                      <span className="progress-percentage">{Math.round(getProgressPercentage(campaign.raised, campaign.goal))}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${getProgressPercentage(campaign.raised, campaign.goal)}%` }}
                      ></div>
                    </div>
                    <div className="progress-stats">
                      <span className="raised">{formatCurrency(campaign.raised)} raised</span>
                      <span className="goal">of {formatCurrency(campaign.goal)} goal</span>
                    </div>
                    <p className="supporters">{campaign.supporters.toLocaleString()} supporters</p>
                  </div>
                </div>
                
                <div className="donation-section">
                  <div className="donation-header">
                    <h4>Support This Cause</h4>
                    <p className="donation-subtitle">Every contribution makes a difference</p>
                  </div>
                  <div className="amount-input">
                    <input
                      type="number"
                      placeholder="Enter donation amount ($)"
                      value={campaignAmounts[campaign.id] || ''}
                      onChange={(e) => handleAmountChange(campaign.id, e.target.value)}
                      min="1"
                      step="1"
                    />
                  </div>
                  <button 
                    className="donate-btn"
                    onClick={(e) => handleDonate(campaign, e)}
                    disabled={!campaignAmounts[campaign.id] || parseFloat(campaignAmounts[campaign.id]) <= 0}
                  >
                    Donate Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div ref={paymentModalRef} className="modal-container">
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={handleCloseModal}
            service={selectedCampaign}
            amount={donationAmount}
            onRegularPayment={handleRegularPayment}
            onBitcoinPayment={handleBitcoinPayment}
            onShowCryptoTutorial={(videoType) => {
              setTutorialVideoType(videoType);
              setShowCryptoTutorial(true);
            }}
          />
        </div>
      )}

      {/* Bitcoin Payment Modal */}
      {showBitcoinPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <BitcoinPayment
              amount={donationAmount}
              onPaymentComplete={handleBitcoinPaymentComplete}
              onCancel={() => {
                setShowBitcoinPayment(false);
                setShowPaymentModal(false);
              }}
              bookingId={`DN-${Date.now()}`}
            />
          </div>
        </div>
      )}

      {/* Crypto Tutorial Modal */}
      {showCryptoTutorial && (
        <div className="modal-overlay" onClick={() => setShowCryptoTutorial(false)}>
          <div className="modal-content crypto-tutorial-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="modal-close-btn"
              onClick={() => setShowCryptoTutorial(false)}
            >
              ×
            </button>
            <CryptoTutorial 
              videoType={tutorialVideoType}
              onContinue={() => {
                setShowCryptoTutorial(false);
                setTutorialVideoType(null);
              }}
              onSkip={() => {
                setShowCryptoTutorial(false);
                setTutorialVideoType(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DonationsPage;
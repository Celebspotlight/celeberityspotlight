class TrackingService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startTime = Date.now();
    this.pageViews = [];
    this.events = [];
    this.isTracking = true;
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  getUserId() {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }

  // Track page visits
  trackPageView(page, title = '') {
    if (!this.isTracking) return;

    const pageView = {
      id: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      page: page,
      title: title,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      screenResolution: `${screen.width}x${screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    this.pageViews.push(pageView);
    this.sendToServer('pageview', pageView);
  }

  // Track user events
  trackEvent(eventType, eventData = {}) {
    if (!this.isTracking) return;

    const event = {
      id: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
      eventType: eventType,
      eventData: eventData,
      timestamp: new Date().toISOString(),
      page: window.location.pathname
    };

    this.events.push(event);
    this.sendToServer('event', event);
  }

  // Track user interactions
  trackClick(element, elementInfo = {}) {
    this.trackEvent('click', {
      element: element.tagName,
      className: element.className,
      id: element.id,
      text: element.textContent?.substring(0, 100),
      ...elementInfo
    });
  }

  // Track form submissions
  trackFormSubmission(formName, formData = {}) {
    this.trackEvent('form_submit', {
      formName: formName,
      formData: formData
    });
  }

  // Track scroll depth
  trackScrollDepth() {
    let maxScroll = 0;
    const trackScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent;
        if (maxScroll % 25 === 0) { // Track at 25%, 50%, 75%, 100%
          this.trackEvent('scroll', { depth: maxScroll });
        }
      }
    };

    window.addEventListener('scroll', trackScroll, { passive: true });
  }

  // Track time on page
  trackTimeOnPage() {
    const startTime = Date.now();
    
    const sendTimeData = () => {
      const timeSpent = Date.now() - startTime;
      this.trackEvent('time_on_page', {
        timeSpent: timeSpent,
        page: window.location.pathname
      });
    };

    // Send data when user leaves page
    window.addEventListener('beforeunload', sendTimeData);
    
    // Send data every 30 seconds for active users
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        sendTimeData();
      }
    }, 30000);
  }

  // Send data to server (mock implementation)
  async sendToServer(type, data) {
    try {
      // In a real implementation, you would send this to your backend
      console.log(`Tracking ${type}:`, data);
      
      // Store in localStorage for demo purposes
      const existingData = JSON.parse(localStorage.getItem('tracking_data') || '[]');
      existingData.push({ type, data, timestamp: Date.now() });
      
      // Keep only last 1000 entries
      if (existingData.length > 1000) {
        existingData.splice(0, existingData.length - 1000);
      }
      
      localStorage.setItem('tracking_data', JSON.stringify(existingData));
      
      // In production, replace with actual API call:
      // await fetch('/api/tracking', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ type, data })
      // });
      
    } catch (error) {
      console.error('Failed to send tracking data:', error);
    }
  }

  // Get session data
  getSessionData() {
    return {
      sessionId: this.sessionId,
      userId: this.userId,
      startTime: this.startTime,
      pageViews: this.pageViews,
      events: this.events
    };
  }

  // Initialize tracking
  init() {
    // Track initial page load
    this.trackPageView(window.location.pathname, document.title);
    
    // Set up automatic tracking
    this.trackScrollDepth();
    this.trackTimeOnPage();
    
    // Track clicks on important elements
    document.addEventListener('click', (e) => {
      if (e.target.matches('button, a, .trackable')) {
        this.trackClick(e.target);
      }
    });
    
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackEvent('visibility_change', {
        hidden: document.hidden
      });
    });
    
    console.log('User tracking initialized for session:', this.sessionId);
  }

  // Stop tracking
  stop() {
    this.isTracking = false;
  }
}

export default new TrackingService();
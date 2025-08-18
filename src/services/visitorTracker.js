class VisitorTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeTracking();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  initializeTracking() {
    // Initialize visitor data if not exists
    if (!localStorage.getItem('visitorData')) {
      const initialData = {
        totalVisitors: 0,
        totalVisits: 0,
        visits: [],
        sessions: []
      };
      localStorage.setItem('visitorData', JSON.stringify(initialData));
    }

    // Check if this is a new visitor
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    const isNewSession = !lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000; // 30 minutes

    if (isNewSession) {
      this.recordNewSession();
    }

    localStorage.setItem('lastVisit', now.toString());
  }

  recordNewSession() {
    const data = JSON.parse(localStorage.getItem('visitorData'));
    
    // Check if this is a completely new visitor
    const isNewVisitor = !localStorage.getItem('isReturningVisitor');
    
    if (isNewVisitor) {
      data.totalVisitors += 1;
      localStorage.setItem('isReturningVisitor', 'true');
    }
    
    data.totalVisits += 1;
    data.sessions.push({
      id: this.sessionId,
      startTime: this.sessionStartTime,
      referrer: document.referrer || 'Direct'
    });

    localStorage.setItem('visitorData', JSON.stringify(data));
  }

  trackPageView(page) {
    const data = JSON.parse(localStorage.getItem('visitorData'));
    const visit = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      page: page,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      referrer: document.referrer || 'Direct'
    };

    data.visits.push(visit);
    
    // Keep only last 100 visits
    if (data.visits.length > 100) {
      data.visits = data.visits.slice(-100);
    }

    localStorage.setItem('visitorData', JSON.stringify(data));
  }

  getVisitorStats() {
    const data = JSON.parse(localStorage.getItem('visitorData')) || {
      totalVisitors: 0,
      totalVisits: 0,
      visits: [],
      sessions: []
    };

    // Calculate average time on site
    const currentTime = Date.now();
    const averageTimeOnSite = data.sessions.length > 0 
      ? Math.round((currentTime - data.sessions[data.sessions.length - 1].startTime) / 1000)
      : 0;

    return {
      totalVisitors: data.totalVisitors,
      totalVisits: data.totalVisits,
      averageTimeOnSite: averageTimeOnSite,
      recentVisits: data.visits.slice(-10).reverse() // Last 10 visits, newest first
    };
  }
}

const visitorTracker = new VisitorTracker();
export default visitorTracker;
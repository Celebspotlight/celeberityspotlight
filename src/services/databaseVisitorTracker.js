// Enhanced visitor tracker with database persistence
// Uses Firebase Firestore for persistent visitor tracking across devices

class DatabaseVisitorTracker {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.dbUrl = 'https://celebrityspotlight-b15a3-default-rtdb.firebaseio.com'; // Firebase Realtime Database
    this.initializeTracking();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async initializeTracking() {
    try {
      // Use only localStorage - Firebase Realtime Database disabled to prevent 404 errors
      const localData = this.getLocalVisitorData();
      const visitorData = localData;
      
      // Check if this is a new visitor session
      const lastVisit = localStorage.getItem('lastVisit');
      const now = Date.now();
      const isNewSession = !lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000; // 30 minutes

      if (isNewSession) {
        this.recordNewSessionLocal(visitorData);
      }

      localStorage.setItem('lastVisit', now.toString());
    } catch (error) {
      console.warn('Local tracking failed:', error);
      this.initializeLocalTracking();
    }
  }

  async getVisitorDataFromDB() {
    try {
      const response = await fetch(`${this.dbUrl}/visitorStats.json`);
      if (response.ok) {
        const data = await response.json();
        return data || this.getDefaultVisitorData();
      }
      return null;
    } catch (error) {
      console.warn('Failed to fetch from database:', error);
      return null;
    }
  }

  getLocalVisitorData() {
    const data = localStorage.getItem('visitorData');
    return data ? JSON.parse(data) : this.getDefaultVisitorData();
  }

  getDefaultVisitorData() {
    return {
      totalVisitors: 0,
      totalVisits: 0,
      visits: [],
      sessions: [],
      lastUpdated: Date.now()
    };
  }

  initializeLocalTracking() {
    // Fallback to original localStorage tracking
    if (!localStorage.getItem('visitorData')) {
      localStorage.setItem('visitorData', JSON.stringify(this.getDefaultVisitorData()));
    }

    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    const isNewSession = !lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000;

    if (isNewSession) {
      this.recordNewSessionLocal();
    }

    localStorage.setItem('lastVisit', now.toString());
  }

  async recordNewSession(visitorData) {
    // Check if this is a completely new visitor
    const isNewVisitor = !localStorage.getItem('isReturningVisitor');
    
    if (isNewVisitor) {
      visitorData.totalVisitors += 1;
      localStorage.setItem('isReturningVisitor', 'true');
    }
    
    visitorData.totalVisits += 1;
    visitorData.sessions.push({
      id: this.sessionId,
      startTime: this.sessionStartTime,
      referrer: document.referrer || 'Direct',
      userAgent: navigator.userAgent.substring(0, 100), // Truncated for privacy
      timestamp: Date.now()
    });

    visitorData.lastUpdated = Date.now();

    // Keep only last 50 sessions to prevent database bloat
    if (visitorData.sessions.length > 50) {
      visitorData.sessions = visitorData.sessions.slice(-50);
    }

    // Update both database and localStorage
    await this.updateDatabase(visitorData);
    localStorage.setItem('visitorData', JSON.stringify(visitorData));
  }

  recordNewSessionLocal() {
    const data = JSON.parse(localStorage.getItem('visitorData'));
    
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

  async updateDatabase(data) {
    try {
      const response = await fetch(`${this.dbUrl}/visitorStats.json`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`Database update failed: ${response.status}`);
      }
      
      console.log('Visitor data updated in database');
    } catch (error) {
      console.warn('Failed to update database:', error);
      // Continue with localStorage as fallback
    }
  }

  async trackPageView(page) {
    try {
      const visitorData = this.getLocalVisitorData();
      
      const visit = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        page: page,
        timestamp: Date.now(),
        sessionId: this.sessionId,
        referrer: document.referrer || 'Direct'
      };

      visitorData.visits.push(visit);
      
      // Keep only last 100 visits
      if (visitorData.visits.length > 100) {
        visitorData.visits = visitorData.visits.slice(-100);
      }

      visitorData.lastUpdated = Date.now();

      // Update only localStorage - database disabled
      localStorage.setItem('visitorData', JSON.stringify(visitorData));
    } catch (error) {
      console.warn('Page view tracking failed, using localStorage:', error);
      this.trackPageViewLocal(page);
    }
  }

  trackPageViewLocal(page) {
    const data = JSON.parse(localStorage.getItem('visitorData'));
    const visit = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      page: page,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      referrer: document.referrer || 'Direct'
    };

    data.visits.push(visit);
    
    if (data.visits.length > 100) {
      data.visits = data.visits.slice(-100);
    }

    localStorage.setItem('visitorData', JSON.stringify(data));
  }

  async getVisitorStats() {
    // Use only localStorage - Firebase Realtime Database disabled
    return this.getLocalVisitorStats();
  }

  getLocalVisitorStats() {
    const data = JSON.parse(localStorage.getItem('visitorData')) || this.getDefaultVisitorData();

    const currentTime = Date.now();
    const averageTimeOnSite = data.sessions.length > 0 
      ? Math.round((currentTime - data.sessions[data.sessions.length - 1].startTime) / 1000)
      : 0;

    return {
      totalVisitors: data.totalVisitors,
      totalVisits: data.totalVisits,
      averageTimeOnSite: averageTimeOnSite,
      recentVisits: data.visits.slice(-10).reverse(),
      lastUpdated: data.lastUpdated || Date.now(),
      isUsingDatabase: false
    };
  }
}

const databaseVisitorTracker = new DatabaseVisitorTracker();
export default databaseVisitorTracker;
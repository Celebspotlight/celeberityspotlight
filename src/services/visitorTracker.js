import databaseVisitorTracker from './databaseVisitorTracker';

// Enhanced visitor tracking service with database integration
class VisitorTracker {
  constructor() {
    this.databaseTracker = databaseVisitorTracker;
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.initializeTracking();
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async initializeTracking() {
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

    // Initialize database tracking
    try {
      await this.databaseTracker.initializeTracking();
    } catch (error) {
      console.warn('Database tracking initialization failed, using local storage only:', error);
    }

    // Check if this is a new visitor
    const lastVisit = localStorage.getItem('lastVisit');
    const now = Date.now();
    const isNewSession = !lastVisit || (now - parseInt(lastVisit)) > 30 * 60 * 1000; // 30 minutes

    if (isNewSession) {
      await this.recordNewSession();
    }

    localStorage.setItem('lastVisit', now.toString());
  }

  async recordNewSession() {
    const data = JSON.parse(localStorage.getItem('visitorData'));
    
    // Check if this is a completely new visitor
    const isNewVisitor = !localStorage.getItem('isReturningVisitor');
    
    if (isNewVisitor) {
      data.totalVisitors += 1;
      localStorage.setItem('isReturningVisitor', 'true');
    }
    
    data.totalVisits += 1;
    const session = {
      id: this.sessionId,
      startTime: this.sessionStartTime,
      referrer: document.referrer || 'Direct'
    };
    data.sessions.push(session);

    localStorage.setItem('visitorData', JSON.stringify(data));

    // Database tracking is handled by the databaseTracker's own initialization
    // No need to call a separate trackSession method
  }

  async trackPageView(page) {
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

    // Also track in database
    try {
      await this.databaseTracker.trackPageView(page);
    } catch (error) {
      console.warn('Database visit tracking failed:', error);
    }
  }

  async getVisitorStats() {
    // Try to get stats from database first
    try {
      const databaseStats = await this.databaseTracker.getVisitorStats();
      if (databaseStats) {
        return {
          ...databaseStats,
          source: 'database'
        };
      }
    } catch (error) {
      console.warn('Failed to get database stats, falling back to local storage:', error);
    }

    // Fallback to local storage
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
      recentVisits: data.visits.slice(-10).reverse(), // Last 10 visits, newest first
      source: 'localStorage'
    };
  }

  // Get combined stats from both local and database
  async getCombinedStats() {
    const localStats = await this.getVisitorStats();
    
    try {
      const databaseStats = await this.databaseTracker.getVisitorStats();
      
      return {
        local: localStats,
        database: databaseStats,
        combined: {
          totalVisitors: Math.max(localStats.totalVisitors, databaseStats?.totalVisitors || 0),
          totalVisits: Math.max(localStats.totalVisits, databaseStats?.totalVisits || 0),
          averageTimeOnSite: databaseStats?.averageTimeOnSite || localStats.averageTimeOnSite,
          recentVisits: databaseStats?.recentVisits || localStats.recentVisits
        }
      };
    } catch (error) {
      return {
        local: localStats,
        database: null,
        combined: localStats,
        error: error.message
      };
    }
  }
}

const visitorTracker = new VisitorTracker();
export default visitorTracker;
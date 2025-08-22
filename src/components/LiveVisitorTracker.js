import React, { useState, useEffect } from 'react';
import './LiveVisitorTracker.css';
import visitorTracker from '../services/visitorTracker';

const LiveVisitorTracker = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [visitorStats, setVisitorStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState('localStorage');

  useEffect(() => {
    // Update live visitors every 30 seconds
    updateLiveVisitors();
    const interval = setInterval(updateLiveVisitors, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const updateLiveVisitors = async () => {
    setIsLoading(true);
    try {
      // Get enhanced visitor stats
      const stats = await visitorTracker.getCombinedStats();
      setVisitorStats(stats);
      setDataSource(stats.database ? 'database' : 'localStorage');
      
      // Get actual visitor data from the main tracker
      const visitorData = JSON.parse(localStorage.getItem('visitorData') || '{}');
      const now = Date.now();
      
      // Simulate live visitors based on recent activity
      const recentSessions = visitorData.sessions?.filter(session => 
        now - session.startTime < 5 * 60 * 1000 // Last 5 minutes
      ) || [];
      
      setVisitorCount(recentSessions.length);
      setLiveVisitors(recentSessions);
    } catch (error) {
      console.error('Failed to update visitor stats:', error);
      // Fallback to localStorage only
      const visitorData = JSON.parse(localStorage.getItem('visitorData') || '{}');
      const now = Date.now();
      const recentSessions = visitorData.sessions?.filter(session => 
        now - session.startTime < 5 * 60 * 1000
      ) || [];
      
      setVisitorCount(recentSessions.length);
      setLiveVisitors(recentSessions);
      setDataSource('localStorage (fallback)');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="live-visitor-tracker">
      <div className="tracker-header">
        <h3>Live Visitors ({visitorCount})</h3>
        <div className="data-source-indicator">
          <span className={`source-badge ${dataSource.includes('database') ? 'database' : 'local'}`}>
            {dataSource}
          </span>
          {isLoading && <span className="loading-indicator">⟳</span>}
        </div>
      </div>
      
      <div className="visitor-summary">
        <div className="stat-item">
          <span className="stat-label">Active Now:</span>
          <span className="stat-value">{visitorCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Recent Sessions:</span>
          <span className="stat-value">{liveVisitors.length}</span>
        </div>
        {visitorStats && (
          <>
            <div className="stat-item">
              <span className="stat-label">Total Visitors:</span>
              <span className="stat-value">{visitorStats.totalVisitors}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Visits:</span>
              <span className="stat-value">{visitorStats.totalVisits}</span>
            </div>
          </>
        )}
      </div>
      
      {liveVisitors.length > 0 && (
        <div className="recent-sessions">
          <h4>Recent Activity</h4>
          {liveVisitors.slice(0, 5).map(session => (
            <div key={session.id} className="session-item">
              <div className="session-info">
                <span className="session-time">
                  {Math.floor((Date.now() - session.startTime) / 1000)}s ago
                </span>
                <span className="session-referrer">{session.referrer}</span>
              </div>
              <div className="activity-indicator active"></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveVisitorTracker;
import React, { useState, useEffect } from 'react';

const LiveVisitorTracker = () => {
  const [liveVisitors, setLiveVisitors] = useState([]);
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      updateLiveVisitors();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const updateLiveVisitors = () => {
    // Get actual visitor data from the main tracker
    const visitorData = JSON.parse(localStorage.getItem('visitorData') || '{}');
    const now = Date.now();
    
    // Simulate live visitors based on recent activity
    const recentSessions = visitorData.sessions?.filter(session => 
      now - session.startTime < 5 * 60 * 1000 // Last 5 minutes
    ) || [];
    
    setVisitorCount(recentSessions.length);
    setLiveVisitors(recentSessions);
  };

  return (
    <div className="live-visitor-tracker">
      <h3>Live Visitors ({visitorCount})</h3>
      
      <div className="visitor-summary">
        <div className="stat-item">
          <span className="stat-label">Active Now:</span>
          <span className="stat-value">{visitorCount}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Recent Sessions:</span>
          <span className="stat-value">{liveVisitors.length}</span>
        </div>
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
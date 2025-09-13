/**
 * Ultimate Notification Manager - Zero Duplicates Guaranteed
 * Uses localStorage persistence, mutex patterns, and strict deduplication
 */

class UltimateNotificationManager {
  constructor() {
    this.storageKey = 'ultimate_notifications';
    this.lockKey = 'notification_lock';
    this.subscribers = [];
    this.maxAge = 30000; // 30 seconds
    this.lockTimeout = 5000; // 5 seconds
    
    // Initialize storage
    this.initializeStorage();
    
    // Clean old notifications on startup
    this.cleanOldNotifications();
    
    // Set up periodic cleanup
    setInterval(() => this.cleanOldNotifications(), 10000);
  }

  initializeStorage() {
    try {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        localStorage.setItem(this.storageKey, JSON.stringify([]));
      }
    } catch (error) {
      console.warn('UltimateNotificationManager: localStorage not available');
    }
  }

  // Acquire mutex lock
  async acquireLock() {
    const lockStart = Date.now();
    
    while (Date.now() - lockStart < this.lockTimeout) {
      try {
        const existingLock = localStorage.getItem(this.lockKey);
        const lockData = existingLock ? JSON.parse(existingLock) : null;
        
        // Check if lock is expired
        if (!lockData || Date.now() - lockData.timestamp > this.lockTimeout) {
          // Acquire lock
          const lockInfo = {
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9)
          };
          localStorage.setItem(this.lockKey, JSON.stringify(lockInfo));
          
          // Verify we got the lock (race condition check)
          await new Promise(resolve => setTimeout(resolve, 10));
          const verifyLock = JSON.parse(localStorage.getItem(this.lockKey));
          
          if (verifyLock.id === lockInfo.id) {
            return lockInfo.id;
          }
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.warn('Lock acquisition error:', error);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    throw new Error('Failed to acquire notification lock');
  }

  // Release mutex lock
  releaseLock(lockId) {
    try {
      const currentLock = localStorage.getItem(this.lockKey);
      if (currentLock) {
        const lockData = JSON.parse(currentLock);
        if (lockData.id === lockId) {
          localStorage.removeItem(this.lockKey);
        }
      }
    } catch (error) {
      console.warn('Lock release error:', error);
    }
  }

  // Generate content hash for deduplication
  generateContentHash(notification) {
    const content = `${notification.type}|${notification.title}|${notification.message}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Get stored notifications
  getStoredNotifications() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Error reading notifications:', error);
      return [];
    }
  }

  // Save notifications to storage
  saveNotifications(notifications) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(notifications));
    } catch (error) {
      console.warn('Error saving notifications:', error);
    }
  }

  // Clean old notifications
  cleanOldNotifications() {
    const notifications = this.getStoredNotifications();
    const now = Date.now();
    const cleaned = notifications.filter(n => now - n.timestamp < this.maxAge);
    
    if (cleaned.length !== notifications.length) {
      this.saveNotifications(cleaned);
    }
  }

  // Check if notification is duplicate
  isDuplicate(notification) {
    const notifications = this.getStoredNotifications();
    const hash = this.generateContentHash(notification);
    const now = Date.now();
    
    return notifications.some(stored => {
      const timeDiff = now - stored.timestamp;
      const isSameContent = stored.hash === hash;
      const isRecent = timeDiff < this.maxAge;
      
      if (isSameContent && isRecent) {
        console.log(`🚫 Duplicate notification blocked: ${notification.title} (${timeDiff}ms ago)`);
        return true;
      }
      return false;
    });
  }

  // Add notification with ultimate deduplication
  async addNotification(notification) {
    let lockId = null;
    
    try {
      // Acquire mutex lock
      lockId = await this.acquireLock();
      
      // Clean old notifications first
      this.cleanOldNotifications();
      
      // Check for duplicates
      if (this.isDuplicate(notification)) {
        return false; // Duplicate blocked
      }
      
      // Create notification record
      const notificationRecord = {
        ...notification,
        id: `ultimate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        hash: this.generateContentHash(notification)
      };
      
      // Add to storage
      const notifications = this.getStoredNotifications();
      notifications.push(notificationRecord);
      this.saveNotifications(notifications);
      
      // Notify subscribers
      this.notifySubscribers(notificationRecord);
      
      console.log(`✅ Notification added: ${notification.title}`);
      return true;
      
    } catch (error) {
      console.error('Error adding notification:', error);
      return false;
    } finally {
      // Always release lock
      if (lockId) {
        this.releaseLock(lockId);
      }
    }
  }

  // Notify all subscribers
  notifySubscribers(notification) {
    this.subscribers.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Subscriber error:', error);
      }
    });
  }

  // Subscribe to notifications
  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  // Clear all notifications
  clearAll() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
      console.log('🧹 All notifications cleared');
    } catch (error) {
      console.warn('Error clearing notifications:', error);
    }
  }

  // Get notification stats
  getStats() {
    const notifications = this.getStoredNotifications();
    return {
      total: notifications.length,
      byType: notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {}),
      oldest: notifications.length > 0 ? Math.min(...notifications.map(n => n.timestamp)) : null,
      newest: notifications.length > 0 ? Math.max(...notifications.map(n => n.timestamp)) : null
    };
  }
}

// Create singleton instance
const ultimateNotificationManager = new UltimateNotificationManager();

// Global helper functions with component-level guards
let isProcessingNotification = false;

window.showUltimateNotification = async function(notification) {
  // Component-level guard
  if (isProcessingNotification) {
    console.log('🛡️ Component guard: Notification already processing');
    return false;
  }
  
  isProcessingNotification = true;
  
  try {
    const result = await ultimateNotificationManager.addNotification(notification);
    return result;
  } finally {
    // Release guard after a short delay
    setTimeout(() => {
      isProcessingNotification = false;
    }, 100);
  }
};

window.showUltimateBookingNotification = async function(type, title, message, context = {}) {
  return await window.showUltimateNotification({
    type,
    title,
    message,
    context: {
      ...context,
      source: 'booking',
      timestamp: Date.now()
    }
  });
};

// Utility functions
window.clearAllNotifications = () => ultimateNotificationManager.clearAll();
window.getNotificationStats = () => ultimateNotificationManager.getStats();

export default ultimateNotificationManager;
export { UltimateNotificationManager };
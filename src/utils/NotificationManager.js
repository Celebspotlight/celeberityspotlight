class NotificationManager {
  constructor() {
    this.activeNotifications = new Map();
    this.debounceTimers = new Map();
    this.listeners = new Set();
  }

  // Generate a content-based hash for duplicate detection
  generateContentHash(notification) {
    const content = `${notification.type}-${notification.title}-${notification.message}`;
    return btoa(content).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
  }

  // Add notification with robust duplicate prevention
  addNotification(notification) {
    const contentHash = this.generateContentHash(notification);
    const now = Date.now();
    
    // Check if we have a recent notification with same content
    if (this.activeNotifications.has(contentHash)) {
      const existing = this.activeNotifications.get(contentHash);
      const timeDiff = now - existing.timestamp;
      
      // If notification is too recent (within 15 seconds), ignore it
      if (timeDiff < 15000) {
        console.log('🚫 Duplicate notification blocked:', notification.title);
        return null;
      }
    }

    // Clear any existing debounce timer for this content
    if (this.debounceTimers.has(contentHash)) {
      clearTimeout(this.debounceTimers.get(contentHash));
    }

    // Create unique notification with enhanced ID
    const uniqueNotification = {
      ...notification,
      id: `${contentHash}-${now}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: now,
      contentHash
    };

    // Store in active notifications
    this.activeNotifications.set(contentHash, uniqueNotification);

    // Set debounce timer to prevent rapid duplicates
    const debounceTimer = setTimeout(() => {
      this.debounceTimers.delete(contentHash);
    }, 1000);
    this.debounceTimers.set(contentHash, debounceTimer);

    // Auto-cleanup after notification expires
    setTimeout(() => {
      this.activeNotifications.delete(contentHash);
    }, 20000); // Keep track for 20 seconds

    // Notify all listeners
    this.listeners.forEach(listener => {
      try {
        listener(uniqueNotification);
      } catch (error) {
        console.error('Notification listener error:', error);
      }
    });

    console.log('✅ Notification added:', uniqueNotification.title);
    return uniqueNotification;
  }

  // Subscribe to notifications
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Clear all notifications
  clear() {
    this.activeNotifications.clear();
    this.debounceTimers.forEach(timer => clearTimeout(timer));
    this.debounceTimers.clear();
  }

  // Get active notification count
  getActiveCount() {
    return this.activeNotifications.size;
  }
}

// Create singleton instance
const notificationManager = new NotificationManager();

// Global function to show notifications
window.showNotification = (notification) => {
  return notificationManager.addNotification(notification);
};

// Enhanced notification helper
window.showBookingNotification = (type, title, message, options = {}) => {
  return notificationManager.addNotification({
    type,
    title,
    message,
    ...options
  });
};

export default notificationManager;
// Test notification function for debugging
// This can be called from the browser console to test notifications

window.testNotification = () => {
  console.log('Testing notification system...');
  
  if (window.showUltimateNotification) {
    window.showUltimateNotification({
      type: 'success',
      title: 'Test Notification',
      message: 'This is a test notification to verify the toaster is working!'
    });
    console.log('Test notification triggered via showUltimateNotification');
  } else if (window.showNotification) {
    window.showNotification({
      type: 'success',
      title: 'Test Notification',
      message: 'This is a test notification to verify the toaster is working!'
    });
    console.log('Test notification triggered via showNotification');
  } else {
    console.error('No notification functions available');
  }
};

// Also test with different types
window.testErrorNotification = () => {
  if (window.showUltimateNotification) {
    window.showUltimateNotification({
      type: 'error',
      title: 'Test Error',
      message: 'This is a test error notification!'
    });
  }
};

window.testWarningNotification = () => {
  if (window.showUltimateNotification) {
    window.showUltimateNotification({
      type: 'warning',
      title: 'Test Warning',
      message: 'This is a test warning notification!'
    });
  }
};

window.testInfoNotification = () => {
  if (window.showUltimateNotification) {
    window.showUltimateNotification({
      type: 'info',
      title: 'Test Info',
      message: 'This is a test info notification!'
    });
  }
};

console.log('Notification test functions loaded. Use testNotification(), testErrorNotification(), testWarningNotification(), or testInfoNotification() in console.');
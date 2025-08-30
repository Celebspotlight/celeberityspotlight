// Test user registration functionality
import authService from '../services/authService';

export const testUserRegistration = async () => {
  console.log('🧪 Testing User Registration...');
  
  const testUser = {
    email: `testuser${Date.now()}@example.com`,
    password: 'testpassword123',
    displayName: 'Test User',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  };
  
  try {
    console.log('Attempting to register user:', testUser.email);
    
    const result = await authService.register(
      testUser.email,
      testUser.password,
      {
        displayName: testUser.displayName,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        phone: testUser.phone
      }
    );
    
    if (result.success) {
      console.log('✅ User registration successful!');
      console.log('User data:', result.user);
      return { success: true, user: result.user };
    } else {
      console.error('❌ User registration failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Registration test error:', error);
    return { success: false, error: error.message };
  }
};

// Test function to be called from browser console
window.testUserRegistration = testUserRegistration;

export default testUserRegistration;
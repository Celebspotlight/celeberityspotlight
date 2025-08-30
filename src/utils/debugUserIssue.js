// Debug function to test user registration and admin panel
import authService from '../services/authService';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

// Test user registration
export const testUserRegistration = async () => {
  console.log('🧪 Starting user registration test...');
  
  const testUser = {
    email: 'testuser@example.com',
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
    phone: '+1234567890'
  };
  
  try {
    console.log('📝 Registering test user:', testUser.email);
    const result = await authService.register(
      testUser.email,
      testUser.password,
      {
        displayName: `${testUser.firstName} ${testUser.lastName}`,
        firstName: testUser.firstName,
        lastName: testUser.lastName,
        phone: testUser.phone
      }
    );
    console.log('✅ Registration successful:', result);
    
    // Wait a moment for Firestore to sync
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if user appears in Firestore
    await checkUsersInFirestore();
    
    return result;
  } catch (error) {
    console.error('❌ Registration failed:', error);
    throw error;
  }
};

// Check users in Firestore directly
export const checkUsersInFirestore = async () => {
  console.log('🔍 Checking users in Firestore...');
  
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    console.log('📊 Firestore users collection size:', usersSnapshot.size);
    
    if (usersSnapshot.size === 0) {
      console.log('⚠️ No users found in Firestore!');
      return [];
    }
    
    const users = [];
    usersSnapshot.docs.forEach(doc => {
      const userData = { id: doc.id, ...doc.data() };
      console.log('👤 User in Firestore:', userData);
      users.push(userData);
    });
    
    return users;
  } catch (error) {
    console.error('❌ Error checking Firestore:', error);
    throw error;
  }
};

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  window.testUserRegistration = testUserRegistration;
  window.checkUsersInFirestore = checkUsersInFirestore;
  console.log('🔧 Debug functions available: testUserRegistration(), checkUsersInFirestore()');
}
// Test user creation and verification
import { auth, db } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, getDocs, Timestamp } from 'firebase/firestore';

// Test function to create a user and verify it appears in Firestore
export const testUserCreationAndVerification = async () => {
  console.log('🧪 Testing user creation and verification...');
  
  const testEmail = `testuser${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  
  try {
    console.log('1️⃣ Creating user in Firebase Auth...');
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log('✅ User created in Auth:', user.uid);
    
    console.log('2️⃣ Creating user document in Firestore...');
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      phone: '+1234567890',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
      preferences: {
        emailNotifications: true,
        smsNotifications: false
      }
    });
    console.log('✅ User document created in Firestore');
    
    console.log('3️⃣ Waiting 2 seconds for Firestore sync...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('4️⃣ Verifying user appears in Firestore...');
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    console.log('📊 Total users in Firestore:', usersSnapshot.size);
    
    const users = [];
    usersSnapshot.docs.forEach(doc => {
      const userData = { id: doc.id, ...doc.data() };
      console.log('👤 User found:', {
        id: userData.id,
        email: userData.email,
        name: userData.displayName,
        createdAt: userData.createdAt
      });
      users.push(userData);
    });
    
    const newUser = users.find(u => u.id === user.uid);
    if (newUser) {
      console.log('✅ SUCCESS: New user found in Firestore!');
      console.log('📋 User details:', newUser);
    } else {
      console.log('❌ ERROR: New user NOT found in Firestore!');
    }
    
    return {
      success: true,
      userId: user.uid,
      totalUsers: users.length,
      userFound: !!newUser
    };
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message
    });
    return {
      success: false,
      error: error.message
    };
  }
};

// Make it globally available for console testing
if (typeof window !== 'undefined') {
  window.testUserCreationAndVerification = testUserCreationAndVerification;
}

export default testUserCreationAndVerification;
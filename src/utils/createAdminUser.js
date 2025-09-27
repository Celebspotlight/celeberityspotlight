import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

/**
 * Utility function to create the admin user account in Firebase
 * This should be run once to set up the admin account
 */
export const createAdminUser = async () => {
  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'admin@meetandgreet.com';
  const adminPassword = process.env.REACT_APP_ADMIN_FIREBASE_PASSWORD || 'SecureAdminPass2024!';
  
  try {
    console.log('🔄 Creating admin user account...');
    
    // Create the admin user account
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Admin user created successfully:', user.uid);
    
    // Create admin user document in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: 'Admin User',
      firstName: 'Admin',
      lastName: 'User',
      phone: '',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isActive: true,
      isAdmin: true,
      preferences: {
        emailNotifications: true,
        smsNotifications: false
      }
    });
    
    console.log('✅ Admin user document created in Firestore');
    
    return {
      success: true,
      message: 'Admin user created successfully',
      uid: user.uid
    };
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      return {
        success: true,
        message: 'Admin user already exists',
        alreadyExists: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
};

// Function to test admin login after creation
export const testAdminLogin = async () => {
  const adminEmail = process.env.REACT_APP_ADMIN_EMAIL || 'admin@meetandgreet.com';
  const adminPassword = process.env.REACT_APP_ADMIN_FIREBASE_PASSWORD || 'SecureAdminPass2024!';
  
  try {
    const authService = (await import('../services/authService')).default;
    const result = await authService.login(adminEmail, adminPassword);
    
    if (result.success) {
      console.log('✅ Admin login test successful');
      await authService.logout(); // Clean up
      return { success: true, message: 'Admin login test successful' };
    } else {
      console.error('❌ Admin login test failed:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error) {
    console.error('❌ Admin login test error:', error);
    return { success: false, error: error.message };
  }
};

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  window.createAdminUser = createAdminUser;
  window.testAdminLogin = testAdminLogin;
}
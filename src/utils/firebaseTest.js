import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Enhanced Firebase authentication testing
export const testFirebaseAuth = async () => {
  console.log('🔍 Enhanced Firebase Authentication Diagnostics...');
  console.log('================================================');
  
  // 1. Check Firebase app configuration
  console.log('📋 Firebase App Configuration:');
  console.log('Auth instance:', auth);
  console.log('Auth app name:', auth.app.name);
  console.log('Auth app options:', auth.app.options);
  
  // 2. Check environment variables
  console.log('\n🔧 Environment Variables Check:');
  const envVars = {
    'REACT_APP_FIREBASE_API_KEY': process.env.REACT_APP_FIREBASE_API_KEY,
    'REACT_APP_FIREBASE_AUTH_DOMAIN': process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    'REACT_APP_FIREBASE_PROJECT_ID': process.env.REACT_APP_FIREBASE_PROJECT_ID,
    'REACT_APP_FIREBASE_APP_ID': process.env.REACT_APP_FIREBASE_APP_ID
  };
  
  Object.entries(envVars).forEach(([key, value]) => {
    console.log(`${key}: ${value ? '✅ Set' : '❌ Missing'}`);
    if (value) console.log(`  Value: ${value.substring(0, 20)}...`);
  });
  
  // 3. Test authentication with detailed error handling
  console.log('\n🧪 Testing Authentication:');
  try {
    const testEmail = `test-${Date.now()}@example.com`;
    console.log(`Attempting to create user with email: ${testEmail}`);
    
    await createUserWithEmailAndPassword(auth, testEmail, 'testpassword123');
    console.log('✅ SUCCESS: User creation worked!');
    
  } catch (error) {
    console.error('❌ AUTHENTICATION ERROR:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error object:', error);
    
    // Enhanced error analysis
    console.log('\n🔧 TROUBLESHOOTING GUIDE:');
    switch (error.code) {
      case 'auth/operation-not-allowed':
        console.error('❌ Email/Password authentication is NOT enabled');
        console.error('📝 SOLUTION:');
        console.error('   1. Go to Firebase Console');
        console.error('   2. Select your project: celebrityspotlight-b15a3');
        console.error('   3. Go to Authentication > Sign-in method');
        console.error('   4. Enable Email/Password provider');
        console.error('   5. Make sure to SAVE the changes');
        break;
        
      case 'auth/invalid-api-key':
        console.error('❌ Invalid API Key');
        console.error('📝 SOLUTION: Check your Firebase API key in .env file');
        break;
        
      case 'auth/project-not-found':
        console.error('❌ Firebase project not found');
        console.error('📝 SOLUTION: Verify your project ID in .env file');
        break;
        
      case 'auth/app-not-authorized':
        console.error('❌ App not authorized for this project');
        console.error('📝 SOLUTION: Check authorized domains in Firebase Console');
        break;
        
      case 'auth/weak-password':
        console.error('✅ Good news: Authentication is working!');
        console.error('📝 INFO: Password just needs to be stronger');
        break;
        
      case 'auth/email-already-in-use':
        console.error('✅ Good news: Authentication is working!');
        console.error('📝 INFO: This email is already registered');
        break;
        
      case 'auth/invalid-email':
        console.error('✅ Good news: Authentication is working!');
        console.error('📝 INFO: Email format issue only');
        break;
        
      default:
        console.error('❓ Unknown error - investigating...');
        console.error('📝 NEXT STEPS:');
        console.error('   1. Check Firebase Console for project status');
        console.error('   2. Verify all environment variables');
        console.error('   3. Check browser network tab for detailed error');
    }
    
    // Additional debugging info
    console.log('\n🔍 Additional Debug Info:');
    console.log('Current URL:', window.location.href);
    console.log('User Agent:', navigator.userAgent);
    console.log('Timestamp:', new Date().toISOString());
  }
  
  console.log('\n================================================');
  console.log('🏁 Diagnostics Complete');
};

// Export for use in components
export default testFirebaseAuth;
import { auth } from '../services/firebase';
import { sendPasswordResetEmail, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

// Comprehensive Firebase Authentication Configuration Checker
export const checkFirebaseAuthConfig = async () => {
  console.log('🔍 Firebase Authentication Configuration Check');
  console.log('='.repeat(60));
  
  // 1. Basic Configuration Check
  console.log('\n📋 Basic Configuration:');
  console.log('Auth instance:', auth ? '✅ Present' : '❌ Missing');
  console.log('Project ID:', auth?.app?.options?.projectId || '❌ Missing');
  console.log('Auth Domain:', auth?.app?.options?.authDomain || '❌ Missing');
  console.log('API Key:', auth?.app?.options?.apiKey ? '✅ Present' : '❌ Missing');
  
  // 2. Check if Email/Password provider is enabled
  console.log('\n🔐 Email/Password Provider Check:');
  
  // Test with a dummy email to see what error we get
  const testEmail = 'test@nonexistent-domain-12345.com';
  
  try {
    await sendPasswordResetEmail(auth, testEmail);
    console.log('✅ Email/Password provider is enabled (no operation-not-allowed error)');
  } catch (error) {
    console.log('Error code:', error.code);
    console.log('Error message:', error.message);
    
    switch (error.code) {
      case 'auth/operation-not-allowed':
        console.log('❌ CRITICAL ISSUE: Email/Password authentication is NOT enabled!');
        console.log('\n🔧 SOLUTION STEPS:');
        console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
        console.log('2. Select your project: ' + (auth?.app?.options?.projectId || 'YOUR_PROJECT'));
        console.log('3. Navigate to: Authentication > Sign-in method');
        console.log('4. Find "Email/Password" provider');
        console.log('5. Click "Enable" and save changes');
        console.log('6. Optionally enable "Email link (passwordless sign-in)"');
        break;
        
      case 'auth/user-not-found':
        console.log('✅ Email/Password provider is enabled (user-not-found is expected for test email)');
        break;
        
      case 'auth/invalid-email':
        console.log('✅ Email/Password provider is enabled (invalid-email is expected for malformed test email)');
        break;
        
      case 'auth/network-request-failed':
        console.log('⚠️  Network issue - cannot determine provider status');
        break;
        
      default:
        console.log('⚠️  Unexpected error - provider status unclear');
    }
  }
  
  // 3. Check authorized domains
  console.log('\n🌐 Authorized Domains Check:');
  console.log('Current domain:', window.location.hostname);
  console.log('Auth domain:', auth?.app?.options?.authDomain);
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Localhost should be authorized by default');
  } else {
    console.log('⚠️  Make sure your domain is added to authorized domains in Firebase Console');
    console.log('   Go to: Authentication > Settings > Authorized domains');
  }
  
  // 4. Test email template configuration
  console.log('\n📧 Email Template Check:');
  console.log('Expected sender: noreply@' + auth?.app?.options?.authDomain);
  console.log('\n📝 Email Template Configuration:');
  console.log('1. Go to: Authentication > Templates');
  console.log('2. Check "Password reset" template');
  console.log('3. Ensure template is properly configured');
  console.log('4. Test with a real email address');
  
  // 5. Environment check
  console.log('\n🔧 Environment Check:');
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('Firebase Config Source:', process.env.REACT_APP_FIREBASE_API_KEY ? 'Environment Variables' : 'Hardcoded');
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 Configuration Check Complete');
  
  return {
    authInstance: !!auth,
    projectId: auth?.app?.options?.projectId,
    authDomain: auth?.app?.options?.authDomain,
    apiKey: !!auth?.app?.options?.apiKey
  };
};

// Test password reset with real email
export const testPasswordResetWithRealEmail = async (email) => {
  console.log(`\n🧪 Testing password reset with real email: ${email}`);
  
  if (!email || !email.includes('@')) {
    console.error('❌ Please provide a valid email address');
    return;
  }
  
  try {
    await sendPasswordResetEmail(auth, email);
    console.log('✅ SUCCESS: Password reset email sent!');
    console.log('📧 Check your inbox and spam folder');
    return { success: true };
  } catch (error) {
    console.error('❌ FAILED:', error.code, '-', error.message);
    
    // Provide specific guidance based on error
    switch (error.code) {
      case 'auth/user-not-found':
        console.log('📝 This email is not registered. Try signing up first.');
        break;
      case 'auth/operation-not-allowed':
        console.log('📝 Email/Password authentication is not enabled in Firebase Console.');
        break;
      case 'auth/too-many-requests':
        console.log('📝 Too many requests. Wait a few minutes and try again.');
        break;
      case 'auth/network-request-failed':
        console.log('📝 Network error. Check your internet connection.');
        break;
    }
    
    return { success: false, error: error.code, message: error.message };
  }
};

export default checkFirebaseAuthConfig;
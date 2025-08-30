import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// These should be set in your environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Debug: Check if all Firebase config values are loaded
console.log('Firebase Config Check:', {
  apiKey: firebaseConfig.apiKey ? 'Loaded' : 'Missing',
  authDomain: firebaseConfig.authDomain ? 'Loaded' : 'Missing',
  projectId: firebaseConfig.projectId ? 'Loaded' : 'Missing',
  storageBucket: firebaseConfig.storageBucket ? 'Loaded' : 'Missing',
  messagingSenderId: firebaseConfig.messagingSenderId ? 'Loaded' : 'Missing',
  appId: firebaseConfig.appId ? 'Loaded' : 'Missing'
});

// Validate that all required config values are present
const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error('Missing Firebase configuration keys:', missingKeys);
  throw new Error(`Firebase configuration incomplete. Missing: ${missingKeys.join(', ')}`);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
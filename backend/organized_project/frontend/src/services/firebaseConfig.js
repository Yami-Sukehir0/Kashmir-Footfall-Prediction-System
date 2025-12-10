// Firebase configuration
// Note: These are client-side keys which are safe to expose
// For production, use environment variables
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase config from environment variables:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'NOT SET',
  authDomain: firebaseConfig.authDomain || 'NOT SET',
  projectId: firebaseConfig.projectId || 'NOT SET'
});

// Initialize Firebase with comprehensive error handling
let app;
let auth;

// Force Firebase initialization (remove fallback to demo mode for production)
try {
  // Validate that required config values are present
  const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    throw new Error(`Missing required Firebase config keys: ${missingKeys.join(', ')}`);
  }

  // Always initialize Firebase app
  if (!getApps().length) {
    console.log('Initializing new Firebase app with config:', {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain
    });
    
    app = initializeApp(firebaseConfig);
    console.log('✓ Firebase app initialized successfully');
  } else {
    app = getApp();
    console.log('✓ Using existing Firebase app');
  }
  
  // Initialize Auth service
  auth = getAuth(app);
  console.log('✓ Firebase Auth initialized successfully');
  console.log('✓ Using REAL FIREBASE AUTHENTICATION (not demo mode)');
  
} catch (error) {
  console.error('✗ Firebase initialization error:', error);
  
  // Handle specific Firebase errors
  if (error.code === 'auth/configuration-not-found') {
    console.error('Firebase configuration not found. This usually means the project does not exist or is not properly configured.');
  }
  
  // Create a minimal auth object that will throw proper errors
  // instead of causing "invalid-credential" errors
  auth = {
    currentUser: null,
    onAuthStateChanged: (callback) => {
      callback(null);
      return () => {};
    },
    signInWithEmailAndPassword: async () => {
      throw new Error('Firebase not properly initialized. Check configuration.');
    },
    createUserWithEmailAndPassword: async () => {
      throw new Error('Firebase not properly initialized. Check configuration.');
    },
    signOut: async () => {
      throw new Error('Firebase not properly initialized. Check configuration.');
    }
  };
}

export { auth };
export default firebaseConfig;
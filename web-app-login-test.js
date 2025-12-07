/**
 * Web Application Login Test
 * This script replicates exactly what the web application does for login
 */

// Load environment variables
require('dotenv').config({ path: './client/.env' });

console.log('=== Web Application Login Test ===\n');

// Use the provided credentials
const email = 'admin@tourismkashmir.gov.in';
const password = 'KashmirDemo2025!';

console.log('Testing login with credentials:');
console.log('- Email:', email);
console.log('- Password: ***'); // Don't log the actual password
console.log('');

async function testWebAppLogin() {
  try {
    console.log('Replicating web application Firebase initialization...');
    
    // Dynamically import Firebase (same as web app)
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword } = await import('firebase/auth');
    
    // Firebase configuration (same as web app)
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    };
    
    // Initialize Firebase (same as web app)
    let app;
    let auth;
    
    try {
      // Validate that required config values are present (same as web app)
      const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
      const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
      
      if (missingKeys.length > 0) {
        throw new Error(`Missing required Firebase config keys: ${missingKeys.join(', ')}`);
      }
      
      // Check if Firebase app is already initialized (same as web app)
      if (!getApps().length) {
        console.log('Initializing new Firebase app with config...');
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase app initialized successfully');
      } else {
        app = getApp();
        console.log('✅ Using existing Firebase app');
      }
      
      // Initialize Auth service (same as web app)
      auth = getAuth(app);
      console.log('✅ Firebase Auth initialized successfully');
      
    } catch (error) {
      console.log('❌ Firebase initialization error:', error.message);
      
      // Handle specific Firebase errors (same as web app)
      if (error.code === 'auth/configuration-not-found') {
        console.log('Firebase configuration not found. This usually means the project does not exist or is not properly configured.');
      }
      
      console.log('⚠ Firebase authentication will be disabled - falling back to demo mode');
      process.exit(1);
    }
    
    console.log('\nAttempting to sign in (replicating web app login function)...');
    
    try {
      // Validate inputs (same as web app login function)
      if (!email) {
        throw new Error('Email is required');
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      // Check if email domain is authorized (same as web app)
      const allowedDomains = ['tourismkashmir.gov.in'];
      const emailDomain = email.split('@')[1];
      if (!emailDomain || !allowedDomains.includes(emailDomain)) {
        throw new Error('Unauthorized email domain. Only official tourism department emails are allowed.');
      }
      
      // Password validation (same as web app)
      if (!password) {
        throw new Error('Password is required');
      }
      
      if (password.length < 6) {
        throw new Error('Password should be at least 6 characters');
      }
      
      // Try to sign in with Firebase (same as web app)
      console.log('Calling signInWithEmailAndPassword...');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('User Details:');
      console.log('  User ID:', userCredential.user.uid);
      console.log('  Email:', userCredential.user.email);
      console.log('  Display Name:', userCredential.user.displayName || 'Not set');
      console.log('  Email Verified:', userCredential.user.emailVerified);
      console.log('  Creation Time:', userCredential.user.metadata.creationTime);
      console.log('  Last Sign-In:', userCredential.user.metadata.lastSignInTime);
      
      console.log('\n=== WEB APPLICATION LOGIN TEST PASSED ===');
      console.log('✅ The web application SHOULD be able to authenticate with these credentials');
      console.log('✅ If it\'s still failing, the issue is likely in the application runtime environment');
      
    } catch (error) {
      console.log('❌ LOGIN FAILED:', error.code);
      console.log('Error message:', error.message);
      
      // Handle specific Firebase error codes (same as web app)
      switch (error.code) {
        case 'auth/email-already-in-use':
          console.log('An account with this email already exists.');
          break;
        case 'auth/user-not-found':
          console.log('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          console.log('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          console.log('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          console.log('Password should be at least 6 characters.');
          break;
        case 'auth/network-request-failed':
          console.log('Network error. Please check your internet connection.');
          break;
        case 'auth/configuration-not-found':
          console.log('Authentication service configuration error. Running in demo mode.');
          break;
        case 'auth/internal-error':
          console.log('Authentication service internal error. Please try again later.');
          break;
        default:
          // Return a user-friendly message for unknown errors
          if (error.message.includes('Firebase')) {
            console.log('Authentication service temporarily unavailable. Running in demo mode.');
          } else {
            console.log('Unexpected error occurred.');
          }
      }
      
      console.log('\n=== WEB APPLICATION LOGIN TEST FAILED ===');
      console.log('❌ The web application is likely falling back to demo mode');
      console.log('❌ Check browser console for detailed error messages');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

// Run the test
testWebAppLogin();
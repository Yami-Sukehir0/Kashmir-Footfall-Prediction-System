/**
 * Authentication Flow Verification Script
 * This script verifies the authentication flow with the existing Firebase configuration
 */

// Load environment variables
require('dotenv').config({ path: './client/.env' });

console.log('=== Kashmir Tourism Authentication Flow Verification ===\n');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase Configuration:');
console.log('- Project ID:', firebaseConfig.projectId);
console.log('- Auth Domain:', firebaseConfig.authDomain);
console.log('');

// Test credentials
const TEST_CREDENTIALS = {
  email: 'admin@tourismkashmir.gov.in',
  password: 'KashmirTourism2025!'
};

console.log('Test Credentials:');
console.log('- Email:', TEST_CREDENTIALS.email);
console.log('- Password:', TEST_CREDENTIALS.password);
console.log('');

async function verifyAuthFlow() {
  try {
    console.log('Initializing Firebase client SDK...');
    
    // Dynamically import Firebase client SDK
    const { initializeApp } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword, signOut } = await import('firebase/auth');
    
    // Initialize Firebase client
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('✅ Firebase client SDK initialized successfully.\n');
    
    console.log('1. Testing authentication flow...');
    
    try {
      // Try to sign in with the admin credentials
      console.log('   Attempting to sign in...');
      const userCredential = await signInWithEmailAndPassword(
        auth,
        TEST_CREDENTIALS.email,
        TEST_CREDENTIALS.password
      );
      
      console.log('   ✅ Sign in successful!');
      console.log('   User ID:', userCredential.user.uid);
      console.log('   Email:', userCredential.user.email);
      console.log('   Email Verified:', userCredential.user.emailVerified);
      
      // Sign out
      await signOut(auth);
      console.log('   ✅ Signed out successfully');
      
    } catch (signInError) {
      console.log('   ⚠️  Sign in failed:', signInError.code);
      
      if (signInError.code === 'auth/user-not-found') {
        console.log('   ℹ️  This means the admin account does not exist yet.');
        console.log('   You need to create the admin account in Firebase Console.');
      } else if (signInError.code === 'auth/wrong-password') {
        console.log('   ℹ️  This means the account exists but the password is incorrect.');
      } else {
        console.log('   Error details:', signInError.message);
      }
    }
    
    console.log('\n=== Authentication Flow Verification Complete ===');
    console.log('\nNext Steps:');
    console.log('1. If the account does not exist, create it in Firebase Console:');
    console.log('   - Go to Firebase Console -> Authentication -> Users');
    console.log('   - Click "Add user"');
    console.log('   - Email:', TEST_CREDENTIALS.email);
    console.log('   - Password:', TEST_CREDENTIALS.password);
    console.log('   - Click "Add user"');
    console.log('\n2. If the account exists but password is wrong, reset it in Firebase Console');
    console.log('\n3. After creating/resetting the account, test the login in the application');
    
  } catch (error) {
    console.error('❌ Authentication flow verification failed:', error.message);
    
    if (error.code === 'ERR_MODULE_NOT_FOUND') {
      console.log('\n⚠️  Firebase SDK not found. Please install it with:');
      console.log('   npm install firebase');
    }
  }
}

// Run the verification
verifyAuthFlow();
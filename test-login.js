/**
 * Firebase Login Test Script
 * This script tests the Firebase login functionality with provided credentials
 */

// Load environment variables
require('dotenv').config({ path: './client/.env' });

console.log('=== Firebase Login Test ===\n');

// Use the provided credentials
const email = 'admin@tourismkashmir.gov.in';
const password = 'KashmirDemo2025!';

console.log('Testing login with credentials:');
console.log('- Email:', email);
console.log('- Password: ***'); // Don't log the actual password
console.log('');

async function testLogin() {
  try {
    console.log('Initializing Firebase client SDK...');
    
    // Dynamically import Firebase client SDK
    const { initializeApp } = await import('firebase/app');
    const { getAuth, signInWithEmailAndPassword, signOut } = await import('firebase/auth');
    
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
    
    // Initialize Firebase client
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('✅ Firebase client SDK initialized successfully.\n');
    
    console.log('Attempting to sign in...');
    
    try {
      // Try to sign in with the provided credentials
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('User Details:');
      console.log('  User ID:', userCredential.user.uid);
      console.log('  Email:', userCredential.user.email);
      console.log('  Display Name:', userCredential.user.displayName || 'Not set');
      console.log('  Email Verified:', userCredential.user.emailVerified);
      console.log('  Creation Time:', userCredential.user.metadata.creationTime);
      console.log('  Last Sign-In:', userCredential.user.metadata.lastSignInTime);
      
      // Sign out
      await signOut(auth);
      console.log('\n✅ Signed out successfully');
      
      console.log('\n=== LOGIN FUNCTIONALITY VERIFIED ===');
      console.log('The authentication system is working correctly with real Firebase authentication.');
      console.log('You can now use these credentials to log in to the admin panel.');
      
    } catch (signInError) {
      console.log('❌ LOGIN FAILED:', signInError.code);
      
      if (signInError.code === 'auth/user-not-found') {
        console.log('❌ The email address does not correspond to any existing user account.');
        console.log('Please check that you have created the user in the Firebase Console.');
      } else if (signInError.code === 'auth/wrong-password') {
        console.log('❌ Incorrect password for the given email.');
        console.log('Please check that you are using the correct password.');
      } else if (signInError.code === 'auth/configuration-not-found') {
        console.log('❌ Firebase configuration error.');
        console.log('The Firebase project configuration is incorrect or the project does not exist.');
      } else {
        console.log('❌ Error details:', signInError.message);
      }
      
      console.log('\n=== LOGIN TEST FAILED ===');
      console.log('The authentication system is not working correctly.');
    }
    
  } catch (error) {
    console.error('❌ Script execution failed:', error.message);
  }
}

// Run the test
testLogin();
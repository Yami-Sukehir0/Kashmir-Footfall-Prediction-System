/**
 * Firebase Configuration Diagnostic Script
 * This script diagnoses issues with Firebase configuration in the web application
 */

// Load environment variables
require('dotenv').config({ path: './client/.env' });

console.log('=== Firebase Configuration Diagnostic ===\n');

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

console.log('Environment Variables from .env file:');
console.log('- REACT_APP_FIREBASE_API_KEY:', firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'NOT SET');
console.log('- REACT_APP_FIREBASE_AUTH_DOMAIN:', firebaseConfig.authDomain || 'NOT SET');
console.log('- REACT_APP_FIREBASE_PROJECT_ID:', firebaseConfig.projectId || 'NOT SET');
console.log('- REACT_APP_FIREBASE_STORAGE_BUCKET:', firebaseConfig.storageBucket || 'NOT SET');
console.log('- REACT_APP_FIREBASE_MESSAGING_SENDER_ID:', firebaseConfig.messagingSenderId || 'NOT SET');
console.log('- REACT_APP_FIREBASE_APP_ID:', firebaseConfig.appId || 'NOT SET');
console.log('- REACT_APP_FIREBASE_MEASUREMENT_ID:', firebaseConfig.measurementId || 'NOT SET');
console.log('');

// Check for missing required values
const requiredKeys = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.log('❌ MISSING REQUIRED CONFIGURATION:');
  missingKeys.forEach(key => console.log(`  - ${key}`));
  process.exit(1);
}

console.log('✅ ALL REQUIRED CONFIGURATION VALUES PRESENT\n');

// Test Firebase initialization
async function testFirebaseInitialization() {
  try {
    console.log('Testing Firebase initialization...');
    
    // Dynamically import Firebase
    const { initializeApp, getApps, getApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    
    // Check if app is already initialized
    if (getApps().length > 0) {
      console.log('ℹ️  Firebase app already initialized');
      const app = getApp();
      console.log('  App name:', app.name);
      console.log('  App options:', app.options.projectId);
    } else {
      console.log('Initializing new Firebase app...');
      
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      console.log('✅ Firebase app initialized successfully');
      console.log('  Project ID:', app.options.projectId);
      console.log('  Auth Domain:', app.options.authDomain);
      
      // Initialize Auth
      const auth = getAuth(app);
      console.log('✅ Firebase Auth initialized successfully');
    }
    
    console.log('\n=== FIREBASE CONFIGURATION DIAGNOSTIC COMPLETE ===');
    console.log('✅ Firebase configuration appears to be correct');
    console.log('✅ Environment variables are properly loaded');
    console.log('✅ Firebase SDK can be initialized');
    
  } catch (error) {
    console.log('❌ FIREBASE INITIALIZATION FAILED:');
    console.log('  Error:', error.message);
    
    if (error.code) {
      console.log('  Error Code:', error.code);
    }
    
    console.log('\nPossible causes:');
    console.log('1. Incorrect Firebase configuration values');
    console.log('2. Firebase project does not exist');
    console.log('3. API key does not have proper permissions');
    console.log('4. Network connectivity issues');
  }
}

// Run the diagnostic
testFirebaseInitialization();
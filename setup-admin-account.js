/**
 * Admin Account Setup Script
 * This script creates the admin account in Firebase Authentication
 */

// Load environment variables
require('dotenv').config({ path: './client/.env' });

console.log('=== Kashmir Tourism Admin Account Setup ===\n');

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

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: 'admin@tourismkashmir.gov.in',
  password: 'KashmirTourism2025!',
  displayName: 'Kashmir Tourism Admin'
};

console.log('Admin Account Details:');
console.log('- Email:', ADMIN_CREDENTIALS.email);
console.log('- Display Name:', ADMIN_CREDENTIALS.displayName);
console.log('');

// Initialize Firebase Admin SDK
const admin = require('firebase-admin');

// Firebase Admin SDK configuration
// In a production environment, you would use a service account key
// For this setup, we'll use the default credentials
try {
  // Try to initialize with default credentials
  const app = admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: firebaseConfig.projectId
  });
  
  console.log('Firebase Admin SDK initialized with default credentials.');
  
  // Create the admin user
  setupAdminAccount(app);
  
} catch (initError) {
  console.log('Default credential initialization failed. Trying alternative approach...');
  
  // Alternative approach - use the Firebase client SDK to create the account
  createAdminAccountWithClientSDK();
}

async function setupAdminAccount(app) {
  try {
    const auth = admin.auth(app);
    
    console.log('\nCreating admin account...');
    
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(ADMIN_CREDENTIALS.email);
      console.log('✅ Admin account already exists!');
      console.log('User UID:', existingUser.uid);
      console.log('Email:', existingUser.email);
      console.log('Display Name:', existingUser.displayName || 'Not set');
      
      // Set custom claims for admin role
      await auth.setCustomUserClaims(existingUser.uid, { admin: true });
      console.log('✅ Admin role assigned to existing user');
      
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        // User doesn't exist, create new account
        const userRecord = await auth.createUser({
          email: ADMIN_CREDENTIALS.email,
          password: ADMIN_CREDENTIALS.password,
          displayName: ADMIN_CREDENTIALS.displayName,
          emailVerified: true
        });
        
        console.log('✅ Admin account created successfully!');
        console.log('User UID:', userRecord.uid);
        console.log('Email:', userRecord.email);
        console.log('Display Name:', userRecord.displayName);
        
        // Set custom claims for admin role
        await auth.setCustomUserClaims(userRecord.uid, { admin: true });
        console.log('✅ Admin role assigned to new user');
        
      } else {
        throw error;
      }
    }
    
    console.log('\n=== Setup Complete ===');
    console.log('Admin account is ready for use.');
    console.log('Login credentials:');
    console.log('- Email:', ADMIN_CREDENTIALS.email);
    console.log('- Password:', ADMIN_CREDENTIALS.password);
    
  } catch (error) {
    console.error('Setup failed:', error.message);
    
    if (error.code === 'auth/insufficient-permission') {
      console.log('\n⚠️  Insufficient permissions to create user.');
      console.log('This is expected when using default credentials.');
      console.log('Please use the Firebase Console to create the admin account manually:');
      console.log('1. Go to Firebase Console -> Authentication -> Users');
      console.log('2. Click "Add user"');
      console.log('3. Enter email:', ADMIN_CREDENTIALS.email);
      console.log('4. Enter password:', ADMIN_CREDENTIALS.password);
      console.log('5. Click "Add user"');
    }
  } finally {
    // Clean up
    try {
      await app.delete();
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
  }
}

async function createAdminAccountWithClientSDK() {
  console.log('\nUsing client SDK approach...');
  
  try {
    // Dynamically import Firebase client SDK
    const { initializeApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    
    // Initialize Firebase client
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    
    console.log('Firebase client SDK initialized.');
    
    try {
      // Try to create the user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        ADMIN_CREDENTIALS.email,
        ADMIN_CREDENTIALS.password
      );
      
      console.log('✅ Admin account created successfully!');
      console.log('User UID:', userCredential.user.uid);
      console.log('Email:', userCredential.user.email);
      
      console.log('\n=== Setup Complete ===');
      console.log('Admin account is ready for use.');
      console.log('Login credentials:');
      console.log('- Email:', ADMIN_CREDENTIALS.email);
      console.log('- Password:', ADMIN_CREDENTIALS.password);
      
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log('✅ Admin account already exists!');
        console.log('Please use the existing account to log in.');
        console.log('If you forgot the password, use the "Forgot Password" feature.');
      } else {
        console.error('Client SDK approach failed:', error.message);
        console.log('\nPlease create the admin account manually through the Firebase Console.');
      }
    }
    
  } catch (importError) {
    console.error('Failed to import Firebase client SDK:', importError.message);
    console.log('\nPlease create the admin account manually through the Firebase Console:');
    console.log('1. Go to Firebase Console -> Authentication -> Users');
    console.log('2. Click "Add user"');
    console.log('3. Enter email:', ADMIN_CREDENTIALS.email);
    console.log('4. Enter password:', ADMIN_CREDENTIALS.password);
    console.log('5. Click "Add user"');
  }
}
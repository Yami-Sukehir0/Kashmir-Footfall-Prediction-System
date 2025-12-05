const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// In production, you would use service account credentials
// For development, we'll use the default credentials
try {
  // Check if Firebase Admin is already initialized
  if (!admin.apps.length) {
    // Try to initialize with environment variables first
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY.length > 50) {
      // Remove any extra quotes and fix newline characters
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
        privateKey = privateKey.slice(1, -1);
      }
      // Handle escaped newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      try {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            privateKey: privateKey,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL
          })
        });
      } catch (initError) {
        console.warn('⚠ Firebase Admin SDK initialization failed:', initError.message);
        // Fallback to default credentials
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID,
        });
      }
    } else {
      // Fallback to default credentials if environment variables are not set
      console.log('⚠ Firebase credentials not found in environment variables, using default initialization');
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }
  }
  
  console.log('✓ Firebase Admin SDK initialized');
} catch (error) {
  console.warn('⚠ Firebase Admin SDK initialization failed:', error.message);
  console.warn('⚠ Authentication features will be disabled');
  // Create a mock admin object to prevent crashes
  module.exports = {
    auth: () => ({
      verifyIdToken: async () => {
        throw new Error('Firebase Admin not initialized');
      }
    }),
    apps: []
  };
  return;
}

module.exports = admin;
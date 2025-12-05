const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
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
      // Handle double-escaped newlines
      privateKey = privateKey.replace(/\\\\n/g, '\n');
      
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        })
      });
    } else {
      console.log('⚠ Firebase credentials not found in environment variables');
      process.exit(1);
    }
  }
  
  console.log('✓ Firebase Admin SDK initialized');
} catch (error) {
  console.error('⚠ Firebase Admin SDK initialization failed:', error.message);
  process.exit(1);
}

// Create admin user function
async function createAdminUser() {
  try {
    const email = 'admin@tourismkashmir.gov.in';
    const password = 'KashmirDemo2024!';
    
    // Check if user already exists
    try {
      const user = await admin.auth().getUserByEmail(email);
      console.log(`⚠ User ${email} already exists with UID: ${user.uid}`);
      return user;
    } catch (error) {
      // User doesn't exist, create new user
      console.log(`✓ Creating new admin user: ${email}`);
      const userRecord = await admin.auth().createUser({
        email: email,
        password: password,
        displayName: 'Tourism Department Admin'
      });
      
      console.log(`✓ Successfully created user with UID: ${userRecord.uid}`);
      return userRecord;
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Run the function
createAdminUser().then(() => {
  console.log('✅ Admin user setup completed');
  process.exit(0);
});
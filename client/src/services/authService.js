import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// Sign up function with comprehensive error handling
export const signUp = async (email, password) => {
  try {
    // Check if auth is properly initialized
    if (!auth || typeof auth.createUserWithEmailAndPassword !== 'function') {
      // If auth is our mock object, throw a proper error
      if (auth && typeof auth.createUserWithEmailAndPassword === 'function') {
        throw new Error('Firebase not properly initialized. Check configuration.');
      }
    }

    // Validate inputs
    validateInputs(email, password);

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Sign up error:', error);
    throw processFirebaseError(error);
  }
};

// Login function with comprehensive error handling
export const login = async (email, password) => {
  try {
    // Check if auth is properly initialized
    if (!auth || typeof auth.signInWithEmailAndPassword !== 'function') {
      // If auth is our mock object, it will throw the proper error
      if (auth && typeof auth.signInWithEmailAndPassword === 'function') {
        throw new Error('Firebase not properly initialized. Check configuration.');
      }
    }

    // Validate inputs
    validateInputs(email, password, true);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw processFirebaseError(error);
  }
};

// Logout function
export const logout = async () => {
  try {
    // Check if auth is properly initialized
    if (!auth || typeof auth.signOut !== 'function') {
      // If auth is our mock object, it will throw the proper error
      if (auth && typeof auth.signOut === 'function') {
        throw new Error('Firebase not properly initialized. Check configuration.');
      }
    }
    
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw processFirebaseError(error);
  }
};

// Get current user
export const getCurrentUser = () => {
  // Check if auth is properly initialized
  if (!auth || typeof auth.onAuthStateChanged !== 'function') {
    // If auth is our mock object, it will handle this properly
    if (auth && typeof auth.onAuthStateChanged === 'function') {
      return Promise.resolve(null);
    }
  }

  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Get ID token
export const getIdToken = async () => {
  // Check if auth is properly initialized
  if (!auth) {
    throw new Error('Firebase not properly initialized. Check configuration.');
  }

  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken();
    }
    return null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    throw error;
  }
};

// Validation helper function
const validateInputs = (email, password, isLogin = false) => {
  // Email validation
  if (!email) {
    throw new Error('Email is required');
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Please enter a valid email address');
  }
  
  // Check if email domain is authorized
  const allowedDomains = ['tourismkashmir.gov.in'];
  const emailDomain = email.split('@')[1];
  if (!emailDomain || !allowedDomains.includes(emailDomain)) {
    throw new Error('Unauthorized email domain. Only official tourism department emails are allowed.');
  }
  
  // Password validation (skip for login if not provided, but validate if provided)
  if (!isLogin || password) {
    if (!password) {
      throw new Error('Password is required');
    }
    
    if (password.length < 6) {
      throw new Error('Password should be at least 6 characters');
    }
  }
};

// Error processing helper function
const processFirebaseError = (error) => {
  console.log('Processing Firebase error:', error.code, error.message);
  
  // Handle specific Firebase error codes
  switch (error.code) {
    case 'auth/email-already-in-use':
      return new Error('An account with this email already exists.');
    case 'auth/user-not-found':
      return new Error('No account found with this email address.');
    case 'auth/wrong-password':
      return new Error('Incorrect password. Please try again.');
    case 'auth/invalid-email':
      return new Error('Please enter a valid email address.');
    case 'auth/weak-password':
      return new Error('Password should be at least 6 characters.');
    case 'auth/network-request-failed':
      return new Error('Network error. Please check your internet connection.');
    case 'auth/configuration-not-found':
      return new Error('Authentication service configuration error. Please check Firebase configuration.');
    case 'auth/invalid-credential':
      return new Error('Invalid credentials. Please check your email and password.');
    case 'auth/internal-error':
      return new Error('Authentication service internal error. Please try again later.');
    default:
      // Return a user-friendly message for unknown errors
      if (error.message.includes('Firebase')) {
        return new Error('Authentication service error: ' + error.message);
      }
      return error;
  }
};

export { auth };
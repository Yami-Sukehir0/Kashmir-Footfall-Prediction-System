// Robust Authentication Service with Fallback Mechanisms
// This service provides multiple layers of authentication handling

class RobustAuthService {
  constructor() {
    this.isInitialized = false;
    this.fallbackMode = false;
    this.mockUser = null;
    this.listeners = [];
  }

  // Initialize the service
  async initialize() {
    try {
      // Try to initialize Firebase
      const { auth } = await import('./firebaseConfig');
      
      if (auth && auth.onAuthStateChanged) {
        this.auth = auth;
        this.isInitialized = true;
        this.fallbackMode = false;
        console.log('✓ Robust Auth Service initialized with Firebase');
      } else {
        throw new Error('Firebase auth not available');
      }
    } catch (error) {
      console.warn('⚠ Falling back to mock authentication:', error.message);
      this.fallbackMode = true;
      this.isInitialized = true;
      this.setupMockAuth();
    }
  }

  // Setup mock authentication for fallback mode
  setupMockAuth() {
    // Check if we have a stored mock user
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      try {
        this.mockUser = JSON.parse(storedUser);
      } catch (e) {
        console.warn('Invalid stored mock user data');
      }
    }
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback) {
    if (!this.isInitialized) {
      console.warn('Auth service not initialized');
      return () => {};
    }

    if (this.fallbackMode) {
      // Immediate callback with mock user state
      setTimeout(() => callback(this.mockUser), 0);
      
      // Store listener for future updates
      this.listeners.push(callback);
      
      // Return unsubscribe function
      return () => {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
          this.listeners.splice(index, 1);
        }
      };
    } else {
      // Use Firebase auth state change
      return this.auth.onAuthStateChanged(callback);
    }
  }

  // Login function
  async login(email, password) {
    if (!this.isInitialized) {
      throw new Error('Authentication service not initialized');
    }

    if (this.fallbackMode) {
      // Mock login - in a real scenario, you might want to validate against a backend
      console.warn('⚠ Using mock login (fallback mode)');
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Email format validation
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
      
      // Create mock user
      this.mockUser = {
        uid: 'mock_' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        emailVerified: true,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        providerData: [{
          providerId: 'mock',
          uid: email,
          email: email
        }]
      };
      
      // Store mock user
      localStorage.setItem('mockUser', JSON.stringify(this.mockUser));
      
      // Notify listeners
      this.notifyListeners(this.mockUser);
      
      return this.mockUser;
    } else {
      // Use Firebase login
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    }
  }

  // Signup function
  async signUp(email, password) {
    if (!this.isInitialized) {
      throw new Error('Authentication service not initialized');
    }

    if (this.fallbackMode) {
      // Mock signup
      console.warn('⚠ Using mock signup (fallback mode)');
      
      // Simple validation
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Email format validation
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
      
      // Password validation
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Check if user already exists (in mock mode, check localStorage)
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        const existingUser = JSON.parse(storedUser);
        if (existingUser.email === email) {
          throw new Error('An account with this email already exists.');
        }
      }
      
      // Create mock user
      this.mockUser = {
        uid: 'mock_' + Date.now(),
        email: email,
        displayName: email.split('@')[0],
        emailVerified: true,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString()
        },
        providerData: [{
          providerId: 'mock',
          uid: email,
          email: email
        }]
      };
      
      // Store mock user
      localStorage.setItem('mockUser', JSON.stringify(this.mockUser));
      
      // Notify listeners
      this.notifyListeners(this.mockUser);
      
      return this.mockUser;
    } else {
      // Use Firebase signup
      const { createUserWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    }
  }

  // Logout function
  async logout() {
    if (!this.isInitialized) {
      throw new Error('Authentication service not initialized');
    }

    if (this.fallbackMode) {
      // Mock logout
      console.warn('⚠ Using mock logout (fallback mode)');
      this.mockUser = null;
      localStorage.removeItem('mockUser');
      this.notifyListeners(null);
    } else {
      // Use Firebase logout
      const { signOut } = await import('firebase/auth');
      await signOut(this.auth);
    }
  }

  // Get current user
  getCurrentUser() {
    if (!this.isInitialized) {
      return null;
    }

    if (this.fallbackMode) {
      return this.mockUser;
    } else {
      return this.auth.currentUser;
    }
  }

  // Get ID token
  async getIdToken() {
    if (!this.isInitialized) {
      return null;
    }

    if (this.fallbackMode) {
      // Return a mock token
      return 'mock_token_' + Date.now();
    } else {
      const user = this.auth.currentUser;
      if (user) {
        return await user.getIdToken();
      }
      return null;
    }
  }

  // Notify all listeners of auth state changes
  notifyListeners(user) {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  // Check if in fallback mode
  isInFallbackMode() {
    return this.fallbackMode;
  }
}

// Create and export singleton instance
const robustAuthService = new RobustAuthService();

// Initialize the service
robustAuthService.initialize().catch(error => {
  console.error('Failed to initialize robust auth service:', error);
});

export default robustAuthService;
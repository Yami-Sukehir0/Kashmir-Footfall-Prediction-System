const admin = require('../firebaseAdmin');

// Demo mode flag
const DEMO_MODE = true;

// Middleware to verify Firebase ID token
const verifyToken = async (req, res, next) => {
  try {
    // Demo mode: Allow all requests for presentation
    if (DEMO_MODE) {
      // Add demo user info to request object
      req.user = {
        uid: 'demo_admin_uid',
        email: 'admin@tourismkashmir.gov.in',
        role: 'admin'
      };
      return next();
    }
    
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = decodedToken;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    // Demo mode: Allow all requests for presentation
    if (DEMO_MODE) {
      return next();
    }
    
    // In a real implementation, you would check against your database
    // For now, we'll assume all authenticated users are admins
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: User not authenticated' });
    }
    
    // Add admin check logic here
    // For example, check if user has admin role in database
    
    next();
  } catch (error) {
    console.error('Authorization error:', error);
    return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
  }
};

module.exports = {
  verifyToken,
  requireAdmin
};
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Mock authentication for testing (bypasses database)
const protect = async (req, res, next) => {
  console.log('🔒 Mock auth middleware called');
  
  try {
    // Check for token in headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, create a mock user for testing
    if (!token || token === 'mock_jwt_token_12345') {
      console.log('🔓 Using mock authentication');
      req.user = {
        _id: 'mock_user_id_123',
        email: 'admin@test.com',
        userType: 'admin',
        fullName: 'Mock Admin User'
      };
      return next();
    }

    // Real token verification (if needed)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    
    next();
  } catch (error) {
    console.log('🔓 Using mock authentication due to error');
    req.user = {
      _id: 'mock_user_id_123',
      email: 'admin@test.com',
      userType: 'admin',
      fullName: 'Mock Admin User'
    };
    next();
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('👑 Authorization check for roles:', roles);
    console.log('� User type:', req.user.userType);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied - user not authenticated'
      });
    }

    if (!roles.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - insufficient permissions'
      });
    }

    next();
  };
};

module.exports = { protect, authorize };
const express = require('express');
const router = express.Router();

// Simple test endpoint (no database)
router.post('/test', (req, res) => {
  console.log(' Auth test endpoint called');
  res.status(200).json({
    success: true,
    message: 'Auth test endpoint working',
    body: req.body,
    timestamp: new Date().toISOString()
  });
});

// Mock login endpoint (no database for testing)
router.post('/login', (req, res) => {
  try {
    console.log(' Mock login attempt:', req.body.email);
    
    const { email, password } = req.body;
    
    // Mock validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Mock successful login (bypass database)
    const mockUser = {
      _id: 'mock_user_id_123',
      email: email,
      userType: 'admin',
      fullName: 'Test User'
    };

    const mockToken = 'mock_jwt_token_12345';

    console.log(' Mock login successful for:', email);

    res.status(200).json({
      success: true,
      message: 'Login successful (mock)',
      token: mockToken,
      user: mockUser
    });

  } catch (error) {
    console.error(' Mock login error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Original routes (commented out for testing)
// const {
//   registerStudent,
//   registerAdmin,
//   login,
//   getMe
// } = require('../controllers/authController');
// const { protect } = require('../middlewares/auth');

// router.post('/register/student', registerStudent);
// router.post('/register/admin', registerAdmin);
// router.get('/me', protect, getMe);

module.exports = router;
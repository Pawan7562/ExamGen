const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerAdmin,
  login,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

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

// Public routes
router.post('/register/student', registerStudent);
router.post('/register/admin', registerAdmin);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
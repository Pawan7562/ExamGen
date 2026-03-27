const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerAdmin,
  login,
  getMe
} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Public routes
router.post('/register/student', registerStudent);
router.post('/register/admin', registerAdmin);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getMe);

module.exports = router;
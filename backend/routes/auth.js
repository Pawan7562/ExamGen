const express = require('express');
const router = express.Router();

// Simple test routes without validation/middleware for debugging
router.post('/register/admin', (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Admin registration endpoint working',
    data: { test: true }
  });
});

router.post('/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Login endpoint working',
    token: 'test-token-123'
  });
});

router.get('/me', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Get me endpoint working',
    user: { id: 'test', email: 'test@test.com' }
  });
});

module.exports = router;
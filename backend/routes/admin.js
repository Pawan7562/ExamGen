const express = require('express');
const {
  getDashboard,
  getUsers,
  createUser,
  uploadUsers,
  updateUser,
  deleteUser,
  getSubjects,
  createSubject,
  getMonitoringStats
} = require('../controllers/adminController');
const {
  getAllStudents,
  createStudent,
  bulkUploadStudents,
  updateStudent,
  deleteStudent,
  getStudentStats,
  resendCredentials
} = require('../controllers/studentController');
const { protect, authorize } = require('../middlewares/auth');
const { uploadSingle } = require('../middlewares/upload');

const router = express.Router();

// TEMPORARILY DISABLE authentication for testing
// router.use(protect);

// Dashboard routes
router.get('/dashboard', getDashboard);

// User management routes
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Student management routes
router.get('/students', getAllStudents);
router.post('/students', createStudent);
router.post('/students/bulk-upload', uploadSingle, bulkUploadStudents);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);
router.get('/students/stats', getStudentStats);
router.post('/students/:id/resend-credentials', resendCredentials);

// Subject management routes
router.get('/subjects', getSubjects);
router.post('/subjects', createSubject);

router.route('/students/:id')
  .put(authorize('admin'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

router.post('/students/:id/resend-credentials', authorize('admin'), resendCredentials);

// Monitoring routes
router.get('/monitoring/stats', authorize('admin'), getMonitoringStats);

// System status route for debugging
router.get('/system/status', authorize('admin'), (req, res) => {
  const status = {
    server: {
      status: 'running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV
    },
    database: {
      connected: true // Will be true if we reach this point
    },
    notifications: {
      email: {
        configured: process.env.EMAIL_USER && process.env.EMAIL_USER !== 'disabled',
        provider: process.env.EMAIL_USER && process.env.EMAIL_USER.includes('ethereal.email') ? 'ethereal' : 'other'
      },
      sms: {
        configured: process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID !== 'disabled'
      }
    },
    rateLimits: {
      activeEntries: require('../controllers/studentController').getRateLimitInfo?.() || 'N/A'
    }
  };
  
  res.json({
    success: true,
    data: status
  });
});

module.exports = router;

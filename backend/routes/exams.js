const express = require('express');
const { body } = require('express-validator');
const {
  createExam,
  getAdminExams,
  getAvailableExams,
  getExamById,
  updateExam,
  updateExamStatus,
  deleteExam,
  startExamAttempt,
  getExamAttempt,
  submitAnswer,
  submitExamAttempt,
  getExamStats
} = require('../controllers/examController');

const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for exam creation/update
const examValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Course must be between 2 and 100 characters'),
  
  body('courseCode')
    .trim()
    .notEmpty()
    .withMessage('Course code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Course code must be between 2 and 20 characters'),
  
  body('questions')
    .isArray({ min: 1 })
    .withMessage('At least one question is required'),
  
  body('questions.*.questionText')
    .trim()
    .notEmpty()
    .withMessage('Question text is required')
    .isLength({ min: 5 })
    .withMessage('Question text must be at least 5 characters'),
  
  body('questions.*.questionType')
    .isIn(['multiple-choice', 'true-false', 'short-answer'])
    .withMessage('Invalid question type'),
  
  body('questions.*.points')
    .isInt({ min: 1 })
    .withMessage('Question points must be a positive integer'),
  
  body('settings.duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (minutes)'),
  
  body('settings.passingScore')
    .isInt({ min: 0, max: 100 })
    .withMessage('Passing score must be between 0 and 100'),
  
  body('settings.maxAttempts')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attempts must be a positive integer'),
  
  body('scheduling.startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('scheduling.endDate')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((endDate, { req }) => {
      const startDate = new Date(req.body.scheduling?.startDate);
      const end = new Date(endDate);
      
      if (end <= startDate) {
        throw new Error('End date must be after start date');
      }
      
      return true;
    }),
];

// Validation for answer submission
const answerValidation = [
  body('questionId')
    .notEmpty()
    .withMessage('Question ID is required')
    .isMongoId()
    .withMessage('Invalid question ID'),
  
  body('selectedOption')
    .optional()
    .isMongoId()
    .withMessage('Invalid option ID'),
  
  body('textAnswer')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Text answer must not exceed 1000 characters')
];

// Admin and Teacher routes (TEMPORARILY DISABLED authentication)
// Add mock user to all requests
router.use((req, res, next) => {
  req.user = {
    _id: 'mock_user_id_123',
    email: 'admin@test.com',
    userType: 'admin',
    fullName: 'Mock Admin User'
  };
  next();
});

router.post('/', examValidation, createExam);
router.get('/', getAdminExams);
router.get('/stats', getExamStats);
router.get('/:id', getExamById);
router.put('/:id', examValidation, updateExam);
router.put('/:id/status', [
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['draft', 'published', 'active', 'completed', 'cancelled'])
    .withMessage('Invalid status value')
], updateExamStatus);
router.delete('/:id', deleteExam);
// router.post('/:id/attempt', protect, authorize('student'), startExamAttempt);

module.exports = router;
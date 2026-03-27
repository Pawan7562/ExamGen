const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('./errorHandler');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return next(new AppError(`Validation failed: ${errorMessages.join(', ')}`, 400));
  }
  next();
};

// User validation schemas
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address')
      .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
      .withMessage('Email format is invalid'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    
    body('role')
      .optional()
      .isIn(['student', 'teacher', 'admin'])
      .withMessage('Role must be either student, teacher, or admin'),
    
    handleValidationErrors
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    
    handleValidationErrors
  ],

  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    handleValidationErrors
  ]
};

// Exam validation schemas
const examValidation = {
  create: [
    body('title')
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('duration')
      .isInt({ min: 5, max: 480 })
      .withMessage('Duration must be between 5 and 480 minutes'),
    
    body('subject')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Subject must be between 2 and 100 characters'),
    
    body('difficulty')
      .isIn(['easy', 'medium', 'hard'])
      .withMessage('Difficulty must be easy, medium, or hard'),
    
    body('questions')
      .isArray({ min: 1 })
      .withMessage('Exam must have at least one question'),
    
    body('questions.*.question')
      .trim()
      .isLength({ min: 5, max: 1000 })
      .withMessage('Question text must be between 5 and 1000 characters'),
    
    body('questions.*.type')
      .isIn(['multiple-choice', 'true-false', 'short-answer', 'coding'])
      .withMessage('Question type must be valid'),
    
    body('questions.*.options')
      .if(body('questions.*.type').equals('multiple-choice'))
      .isArray({ min: 2, max: 6 })
      .withMessage('Multiple choice questions must have 2-6 options'),
    
    body('questions.*.correctAnswer')
      .notEmpty()
      .withMessage('Correct answer is required'),
    
    handleValidationErrors
  ],

  update: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 3, max: 200 })
      .withMessage('Title must be between 3 and 200 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description cannot exceed 1000 characters'),
    
    body('duration')
      .optional()
      .isInt({ min: 5, max: 480 })
      .withMessage('Duration must be between 5 and 480 minutes'),
    
    handleValidationErrors
  ]
};

// Student validation schemas
const studentValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name can only contain letters and spaces'),
    
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('studentId')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Student ID must be between 3 and 20 characters')
      .matches(/^[A-Za-z0-9]+$/)
      .withMessage('Student ID can only contain letters and numbers'),
    
    body('course')
      .optional()
      .trim()
      .isLength({ max: 100 })
      .withMessage('Course name cannot exceed 100 characters'),
    
    handleValidationErrors
  ],

  bulkUpload: [
    body('students')
      .isArray({ min: 1 })
      .withMessage('Students array cannot be empty'),
    
    body('students.*.name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters'),
    
    body('students.*.email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('students.*.studentId')
      .trim()
      .isLength({ min: 3, max: 20 })
      .withMessage('Student ID must be between 3 and 20 characters'),
    
    handleValidationErrors
  ]
};

// Parameter validation
const paramValidation = {
  id: [
    param('id')
      .isMongoId()
      .withMessage('Invalid ID format'),
    
    handleValidationErrors
  ],

  examId: [
    param('examId')
      .isMongoId()
      .withMessage('Invalid exam ID format'),
    
    handleValidationErrors
  ],

  studentId: [
    param('studentId')
      .isMongoId()
      .withMessage('Invalid student ID format'),
    
    handleValidationErrors
  ]
};

// Query validation
const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    
    query('sort')
      .optional()
      .trim()
      .matches(/^[a-zA-Z0-9_,-]+$/)
      .withMessage('Invalid sort format'),
    
    handleValidationErrors
  ],

  search: [
    query('search')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search term must be between 1 and 100 characters')
      .escape(),
    
    handleValidationErrors
  ]
};

// File validation
const fileValidation = {
  image: [
    (req, res, next) => {
      if (!req.file) {
        return next(new AppError('Please upload a file', 400));
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return next(new AppError('Only JPEG, PNG, and GIF images are allowed', 400));
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        return next(new AppError('Image size cannot exceed 5MB', 400));
      }
      
      next();
    }
  ],

  csv: [
    (req, res, next) => {
      if (!req.file) {
        return next(new AppError('Please upload a CSV file', 400));
      }
      
      if (req.file.mimetype !== 'text/csv' && !req.file.originalname.endsWith('.csv')) {
        return next(new AppError('Only CSV files are allowed', 400));
      }
      
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (req.file.size > maxSize) {
        return next(new AppError('CSV file size cannot exceed 10MB', 400));
      }
      
      next();
    }
  ]
};

module.exports = {
  userValidation,
  examValidation,
  studentValidation,
  paramValidation,
  queryValidation,
  fileValidation,
  handleValidationErrors
};

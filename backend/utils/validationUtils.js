// Professional validation utilities
const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const commonValidations = {
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),

  password: body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

  name: (fieldName = 'name') => body(fieldName)
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage(`${fieldName} must be between 2 and 50 characters`)
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage(`${fieldName} can only contain letters and spaces`),

  objectId: (paramName = 'id') => param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),

  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  search: query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),

  status: query('status')
    .optional()
    .isIn(['active', 'inactive', 'published', 'draft', 'all'])
    .withMessage('Invalid status value'),

  course: query('course')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Course name must be between 1 and 50 characters')
};

// Validation result handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    return res.status(400).json({
      success: false,
      error: {
        message: 'Validation failed',
        errors: formattedErrors
      }
    });
  }

  next();
};

// Specific validation chains
const authValidations = {
  login: [
    commonValidations.email,
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  registerStudent: [
    commonValidations.name('fullName'),
    commonValidations.email,
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ],

  registerAdmin: [
    commonValidations.name('fullName'),
    commonValidations.email,
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      })
  ]
};

const examValidations = {
  create: [
    commonValidations.name('title'),
    body('description')
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    commonValidations.course,
    body('duration')
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('totalMarks')
      .isInt({ min: 1, max: 1000 })
      .withMessage('Total marks must be between 1 and 1000'),
    body('status')
      .isIn(['draft', 'published'])
      .withMessage('Status must be either draft or published')
  ],

  update: [
    commonValidations.objectId('id'),
    body('title')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Title must be between 2 and 100 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 10, max: 1000 })
      .withMessage('Description must be between 10 and 1000 characters'),
    body('course')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Course name must be between 1 and 50 characters'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('totalMarks')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Total marks must be between 1 and 1000'),
    body('status')
      .optional()
      .isIn(['draft', 'published', 'active', 'inactive'])
      .withMessage('Invalid status value')
  ],

  getById: [
    commonValidations.objectId('id')
  ],

  list: [
    commonValidations.page,
    commonValidations.limit,
    commonValidations.status,
    commonValidations.course,
    commonValidations.search
  ]
};

const userValidations = {
  updateProfile: [
    commonValidations.name('fullName'),
    commonValidations.email
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    commonValidations.password,
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('New passwords do not match');
        }
        return true;
      })
  ]
};

module.exports = {
  commonValidations,
  handleValidationErrors,
  authValidations,
  examValidations,
  userValidations
};

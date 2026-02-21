const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config();

// Route files
const auth = require('../backend/routes/auth');
const exams = require('../backend/routes/exams');
const examAccess = require('../backend/routes/examAccess');
const instantExams = require('../backend/routes/instantExams');
const questionBanks = require('../backend/routes/questionBanks');
const analytics = require('../backend/routes/analytics');
const notifications = require('../backend/routes/notifications');
const admin = require('../backend/routes/admin');
const proctoring = require('../backend/routes/proctoring');
const reports = require('../backend/routes/reports');
const invitations = require('../backend/routes/invitations');
const codingQuestions = require('../backend/routes/codingQuestions');
const codingExams = require('../backend/routes/codingExamRoutes');

// Connect to database
const connectDB = require('../backend/config/database');
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting - very permissive for development, more restrictive for production
const generalLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 1 * 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 1000 : 100000,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: process.env.NODE_ENV === 'production' ? '15 minutes' : '1 minute'
  },
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req, res) => {
    if (process.env.NODE_ENV !== 'production') {
      return true;
    }
    return req.path === '/api/health' || 
           req.path === '/api/v1/test' || 
           req.path.startsWith('/api/dev/');
  }
});

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://www.pkthenexgenexam.xyz', 'https://pkthenexgenexam.xyz', 'https://exam-monitoring.vercel.app'] 
    : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware
app.use('/api', (req, res, next) => {
  console.log(`🔥 API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Mount routers
app.use('/api/v1/auth', auth);
app.use('/api/v1/exams', exams);
app.use('/api/v1/exam-access', examAccess);
app.use('/api/v1/instant-exams', instantExams);
app.use('/api/v1/question-banks', questionBanks);
app.use('/api/v1/analytics', analytics);
app.use('/api/v1/notifications', notifications);
app.use('/api/v1/admin', admin);
app.use('/api/v1/proctoring', proctoring);
app.use('/api/v1/reports', reports);
app.use('/api/v1/invitations', invitations);
app.use('/api/v1/coding-questions', codingQuestions);
app.use('/api/v1/coding-exams', codingExams);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Exam Monitoring System API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Error handler middleware
const errorHandler = require('../backend/middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;

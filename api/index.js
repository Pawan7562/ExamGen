import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Route files
import auth from '../backend/routes/auth.cjs';
import exams from '../backend/routes/exams.cjs';
import examAccess from '../backend/routes/examAccess.cjs';
import instantExams from '../backend/routes/instantExams.cjs';
import questionBanks from '../backend/routes/questionBanks.cjs';
import analytics from '../backend/routes/analytics.cjs';
import notifications from '../backend/routes/notifications.cjs';
import admin from '../backend/routes/admin.cjs';
import proctoring from '../backend/routes/proctoring.cjs';
import reports from '../backend/routes/reports.cjs';
import invitations from '../backend/routes/invitations.cjs';
import codingQuestions from '../backend/routes/codingQuestions.cjs';
import codingExams from '../backend/routes/codingExamRoutes.cjs';

// Connect to database
import connectDB from '../backend/config/database.cjs';
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
    ? ['https://www.pkthenexgenexam.xyz', 'https://pkthenexgenexam.xyz', 'https://exam-monitoring.onrender.com'] 
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
import errorHandler from '../backend/middlewares/errorHandler.cjs';
app.use(errorHandler);

export default app;

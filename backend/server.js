const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

console.log(' Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');

// Connect DB
try {
  const connectDB = require('./config/database');
  connectDB();
  console.log(' Database connection initiated');
} catch (error) {
  console.error(' Database connection error:', error.message);
}

// Route files
const auth = require('./routes/auth');
const exams = require('./routes/exams');
const examAccess = require('./routes/examAccess');
const instantExams = require('./routes/instantExams');
const questionBanks = require('./routes/questionBanks');
const analytics = require('./routes/analytics');
const notifications = require('./routes/notifications');
const admin = require('./routes/admin');
const proctoring = require('./routes/proctoring');
const reports = require('./routes/reports');
const invitations = require('./routes/invitations');
const codingQuestions = require('./routes/codingQuestions');
const codingExams = require('./routes/codingExamRoutes');

const app = express();

app.use(helmet());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 1000 : 100000,
});

const authLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 10 : 10000,
});

// Apply limiter only in production (DISABLED)
if (false) {
  console.log(' Rate limiting ENABLED');
  app.use(generalLimiter);
} else {
  console.log(' Rate limiting DISABLED');
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://examgen.vercel.app', 'https://www.examgen.vercel.app', 'https://pkthenexgenexam.vercel.app', 'https://www.pkthenexgenexam.vercel.app', 'https://www.pkthenexgenexam.xyz', 'https://pkthenexgenexam.xyz']
    : true,
  credentials: true,
}));

// Debug logs (only dev)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api', (req, res, next) => {
    console.log(`🔥 ${req.method} ${req.originalUrl}`);
    next();
  });
}

// Routes
if (process.env.NODE_ENV === 'production' && !process.env.DISABLE_RATE_LIMIT) {
  app.use('/api/v1/auth', authLimiter, auth);
} else {
  app.use('/api/v1/auth', auth);
}

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

// Test endpoint
app.get('/api/v1/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Test endpoint working',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Root route
app.get('/', (req, res) => {
  console.log('🏠 Root endpoint called');
  res.send('🚀 API Running - VERSION 4.0 - ALL AUTH DISABLED');
});

// Simple test
app.get('/ping', (req, res) => {
  console.log('🏓 Ping endpoint called');
  res.status(200).json({
    success: true,
    message: 'Pong',
    timestamp: new Date().toISOString(),
    version: '4.0'
  });
});

// Test admin route without auth
app.get('/api/v1/admin/test', (req, res) => {
  console.log('🧪 Admin test endpoint called');
  res.status(200).json({
    success: true,
    message: 'Admin endpoint working without auth',
    timestamp: new Date().toISOString()
  });
});

// Test exam route without auth
app.get('/api/v1/exams/test', (req, res) => {
  console.log('📝 Exam test endpoint called');
  res.status(200).json({
    success: true,
    message: 'Exam endpoint working without auth',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: process.uptime()
  });
});

// Simple error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5001;

// IMPORTANT → store server instance
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Error: ${err.message}`);
  server.close(() => process.exit(1));
});

module.exports = app;
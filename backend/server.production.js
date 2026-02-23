// Production-ready Express server
const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import production configuration
const config = require('./config/production');

// Import middleware
const { logger, errorLogger } = require('./middleware/logger');
const { 
  securityHeaders, 
  generalLimiter, 
  authLimiter, 
  apiLimiter,
  xssProtection,
  mongoSanitize,
  hpp 
} = require('./middleware/security');
const errorHandler = require('./middleware/errorHandler');
const { sendResponse } = require('./utils/responseUtils');

// Import routes
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

// Database connection
const connectDB = require('./config/database');

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Security middleware
app.use(securityHeaders);
app.use(xssProtection);
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors(config.server.cors));

// Logging middleware
app.use(logger);

// Response utility middleware
app.use(sendResponse);

// Health check endpoint (no rate limiting)
app.get('/api/health', (req, res) => {
  res.success({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.success({
    message: '🚀 Exam Monitoring API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      auth: '/api/v1/auth',
      exams: '/api/v1/exams',
      admin: '/api/v1/admin'
    }
  });
});

// API routes with specific rate limiting
app.use('/api/v1/auth', authLimiter, auth);
app.use('/api/v1/exams', apiLimiter, exams);
app.use('/api/v1/exam-access', apiLimiter, examAccess);
app.use('/api/v1/instant-exams', apiLimiter, instantExams);
app.use('/api/v1/question-banks', apiLimiter, questionBanks);
app.use('/api/v1/analytics', apiLimiter, analytics);
app.use('/api/v1/notifications', apiLimiter, notifications);
app.use('/api/v1/admin', apiLimiter, admin);
app.use('/api/v1/proctoring', apiLimiter, proctoring);
app.use('/api/v1/reports', apiLimiter, reports);
app.use('/api/v1/invitations', apiLimiter, invitations);
app.use('/api/v1/coding-questions', apiLimiter, codingQuestions);
app.use('/api/v1/coding-exams', apiLimiter, codingExams);

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  // SPA fallback - serve frontend for non-API routes
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
    } else {
      res.notFound('API endpoint not found');
    }
  });
} else {
  // Development 404 handler
  app.use('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      res.notFound('API endpoint not found');
    }
  });
}

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close database connection
    const mongoose = require('mongoose');
    mongoose.connection.close(() => {
      console.log('✅ Database connection closed');
      process.exit(0);
    });
  });

  // Force close after 30 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Handle process signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection');
});

// Start server
const PORT = config.server.port;
const HOST = config.server.host;

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode`);
  console.log(`📍 Server: http://${HOST}:${PORT}`);
  console.log(`🔗 Health Check: http://${HOST}:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV}`);
  
  if (process.env.NODE_ENV === 'production') {
    console.log(`📊 Production server started successfully`);
  }
});

module.exports = app;

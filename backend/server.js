const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import production modules
const logger = require('./utils/logger');
const { 
  generalLimiter, 
  authLimiter, 
  apiLimiter, 
  uploadLimiter,
  helmetConfig,
  xssProtection,
  validateRequest,
  ipBlockMiddleware,
  sessionSecurity
} = require('./middlewares/security');

// Load env vars
dotenv.config();

// Connect DB
const { connectDB } = require('./config/database');
connectDB();

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
const health = require('./routes/health');

const app = express();

// Production security middleware
app.use(helmet(helmetConfig));
app.use(compression());
app.use(sessionSecurity);
app.use(ipBlockMiddleware);

// Data sanitization
app.use(mongoSanitize());
app.use(hpp());
app.use(xssProtection);
app.use(validateRequest);

// Rate limiting (production only)
if (process.env.NODE_ENV === 'production' && !process.env.DISABLE_RATE_LIMIT) {
  app.use(generalLimiter);
}

// Body parser
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',')
  : process.env.NODE_ENV === 'production'
    ? ['https://www.pkthenexgenexam.xyz', 'https://pkthenexgenexam.xyz']
    : true;

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    logger.logRequest(req, res, responseTime);
  });
  
  next();
});

// Health check routes
app.use('/api/health', health);
app.get('/api/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes with rate limiting
if (process.env.NODE_ENV === 'production' && !process.env.DISABLE_RATE_LIMIT) {
  app.use('/api/v1/auth', authLimiter, auth);
  app.use('/api/v1', apiLimiter);
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

// Root route
app.get('/', (req, res) => {
  res.json({
    name: process.env.APP_NAME || 'Exam Monitoring System',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV,
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Production error handler
app.use((error, req, res, next) => {
  logger.logError(error, req, {
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });

  // Don't leak error details in production
  const response = {
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    timestamp: new Date().toISOString()
  };

  if (process.env.NODE_ENV !== 'production') {
    response.error = error.stack;
  }

  res.status(error.status || 500).json(response);
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 5001;

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}, starting graceful shutdown`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    // Close database connection
    if (mongoose.connection.readyState === 1) {
      mongoose.connection.close(() => {
        logger.info('MongoDB connection closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`📊 Health check available at http://localhost:${PORT}/api/health`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  gracefulShutdown('unhandledRejection');
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

module.exports = app;
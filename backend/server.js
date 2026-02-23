const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect DB
const connectDB = require('./config/database');
connectDB();

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'production' ? 15 * 60 * 1000 : 60 * 1000,
  limit: process.env.NODE_ENV === 'production' ? 1000 : 100000,
});

// Rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

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

// Apply limiter only in production
if (process.env.NODE_ENV === 'production' && !process.env.DISABLE_RATE_LIMIT) {
  app.use(generalLimiter);
}

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://www.pkthenexgenexam.xyz', 'https://pkthenexgenexam.xyz', 'https://exam-monitoring-epvh.onrender.com']
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

// Root route
app.get('/', (req, res) => {
  res.send('🚀 API Running');
});

// Health
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Error handler
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

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
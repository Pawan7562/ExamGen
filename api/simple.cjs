const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

console.log("Starting server...");
console.log("PORT =", process.env.PORT);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(cors({
  origin: ['https://www.pkthenexgenexam.xyz', 'https://pkthenexgenexam.xyz', 'https://exam-monitoring-zw2j-htegqn42v-exam-monitoring-systems-projects.vercel.app', 'https://exam-monitoring.onrender.com', 'https://exam-monitoring-e7m8.onrender.com', 'https://your-vercel-app.vercel.app', 'https://your-app.vercel.app', 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://127.0.0.1:5173', 'http://127.0.0.1:5174', 'http://127.0.0.1:5175', 'http://127.0.0.1:5176'],
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

// Mock authentication endpoint
app.post('/api/v1/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  console.log('🔐 Login attempt:', email);
  
  // Mock admin credentials
  if (email === 'admin@test.com' && password === 'admin123') {
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token: 'mock-jwt-token-for-testing',
      user: {
        id: 'admin-user-id',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Mock user profile endpoint
app.get('/api/v1/auth/me', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (token) {
    res.status(200).json({
      success: true,
      user: {
        id: 'admin-user-id',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }
});

// Mock exams endpoints
app.get('/api/v1/exams', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      exams: [],
      pagination: {
        current: 1,
        limit: 10,
        total: 0
      }
    }
  });
});

app.get('/api/v1/exams/stats', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      totalExams: 0,
      activeExams: 0,
      completedExams: 0,
      totalStudents: 0
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Exam Monitoring System API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test endpoint
app.get('/api/v1/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API v1 is working correctly',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send("API Running ✅");
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Catch all handler for frontend SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});

module.exports = app;

const express = require('express');

const app = express();

// Basic middleware
app.use(express.json());

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

// Serve frontend static files
app.use(express.static('frontend/dist'));

// Catch all handler for frontend SPA
app.get('*', (req, res) => {
  res.sendFile('frontend/dist/index.html', { root: '.' });
});

module.exports = app;

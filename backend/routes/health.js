const express = require('express');
const router = express.Router();
const { checkDatabaseHealth } = require('../config/database');
const logger = require('../utils/logger');

// Comprehensive health check endpoint
router.get('/', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Check database health
    const dbHealth = await checkDatabaseHealth();
    
    // Check system health
    const systemHealth = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    // Check API health
    const apiHealth = {
      status: 'healthy',
      responseTime: Date.now() - startTime,
      version: process.env.npm_package_version || '1.0.0',
      name: process.env.APP_NAME || 'Exam Monitoring System'
    };
    
    // Overall health status
    const overallHealth = {
      status: dbHealth.connected && systemHealth.uptime > 0 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: systemHealth.uptime,
      version: apiHealth.version,
      environment: systemHealth.environment,
      services: {
        database: dbHealth,
        system: systemHealth,
        api: apiHealth
      }
    };
    
    // Log health check
    logger.http('Health check performed', {
      status: overallHealth.status,
      responseTime: apiHealth.responseTime,
      databaseConnected: dbHealth.connected
    });
    
    // Return appropriate status code
    const statusCode = overallHealth.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(overallHealth);
    
  } catch (error) {
    logger.error('Health check failed:', error);
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: { status: 'unhealthy', error: 'Connection failed' },
        system: { status: 'unknown' },
        api: { status: 'unhealthy' }
      }
    });
  }
});

// Simple ping endpoint for load balancers
router.get('/ping', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed metrics endpoint
router.get('/metrics', async (req, res) => {
  try {
    const stats = logger.getStats();
    const dbHealth = await checkDatabaseHealth();
    
    const metrics = {
      application: {
        name: process.env.APP_NAME || 'Exam Monitoring System',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        loadAverage: process.loadavg ? process.loadavg() : null
      },
      database: dbHealth,
      requests: stats.requests,
      errors: stats.errors,
      performance: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString()
      }
    };
    
    res.json(metrics);
    
  } catch (error) {
    logger.error('Metrics endpoint failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve metrics',
      message: error.message
    });
  }
});

// Readiness probe (for Kubernetes/container orchestration)
router.get('/ready', async (req, res) => {
  try {
    const dbHealth = await checkDatabaseHealth();
    
    if (dbHealth.connected) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(503).json({
        status: 'not ready',
        reason: 'Database not connected',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      reason: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness probe (for Kubernetes/container orchestration)
router.get('/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

module.exports = router;

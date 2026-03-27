const fs = require('fs');
const path = require('path');

// Health check endpoint
const healthCheck = async (req, res) => {
  const healthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100,
      external: Math.round(process.memoryUsage().external / 1024 / 1024 * 100) / 100
    },
    cpu: {
      usage: process.cpuUsage()
    }
  };

  try {
    // Check database connection
    const mongoose = require('mongoose');
    if (mongoose.connection.readyState === 1) {
      healthStatus.database = {
        status: 'connected',
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };
    } else {
      healthStatus.database = {
        status: 'disconnected',
        state: mongoose.connection.readyState
      };
      healthStatus.status = 'degraded';
    }

    // Check external services
    healthStatus.services = {
      email: {
        status: process.env.EMAIL_USER ? 'configured' : 'not configured'
      },
      sms: {
        status: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'not configured'
      }
    };

    // Check file system
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (fs.existsSync(uploadsDir)) {
      healthStatus.uploads = {
        status: 'accessible',
        path: uploadsDir
      };
    } else {
      healthStatus.uploads = {
        status: 'not accessible',
        path: uploadsDir
      };
      healthStatus.status = 'degraded';
    }

    // Check logs directory
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    healthStatus.logs = {
      status: 'accessible',
      path: logsDir
    };

    const statusCode = healthStatus.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json({
      success: true,
      data: healthStatus
    });

  } catch (error) {
    healthStatus.status = 'unhealthy';
    healthStatus.error = error.message;
    
    res.status(503).json({
      success: false,
      data: healthStatus
    });
  }
};

// Metrics collection
const metricsCollector = (req, res, next) => {
  const startTime = Date.now();
  
  // Store original end function
  const originalEnd = res.end;
  
  // Override end function to collect metrics
  res.end = function(chunk, encoding) {
    res.end = originalEnd;
    res.end(chunk, encoding);
    
    const duration = Date.now() - startTime;
    const metrics = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: req.user ? req.user.id : null,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
    
    // Log metrics (in production, you might want to send to a metrics service)
    if (process.env.ENABLE_METRICS === 'true') {
      console.log('METRICS:', JSON.stringify(metrics));
      
      // You could also send to a monitoring service like:
      // - Prometheus
      // - DataDog
      // - New Relic
      // - CloudWatch
    }
  };
  
  next();
};

// Performance monitoring
const performanceMonitor = {
  // Track response times
  responseTime: {},
  
  // Track error rates
  errorRates: {},
  
  // Track active connections
  activeConnections: 0,
  
  // Add response time
  addResponseTime: (url, duration) => {
    if (!performanceMonitor.responseTime[url]) {
      performanceMonitor.responseTime[url] = [];
    }
    performanceMonitor.responseTime[url].push(duration);
    
    // Keep only last 100 entries
    if (performanceMonitor.responseTime[url].length > 100) {
      performanceMonitor.responseTime[url].shift();
    }
  },
  
  // Get average response time
  getAverageResponseTime: (url) => {
    const times = performanceMonitor.responseTime[url] || [];
    if (times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  },
  
  // Increment error count
  incrementError: (url) => {
    if (!performanceMonitor.errorRates[url]) {
      performanceMonitor.errorRates[url] = 0;
    }
    performanceMonitor.errorRates[url]++;
  },
  
  // Get error rate
  getErrorRate: (url) => {
    const errors = performanceMonitor.errorRates[url] || 0;
    const requests = performanceMonitor.responseTime[url] || [];
    if (requests.length === 0) return 0;
    return (errors / requests.length) * 100;
  }
};

// Middleware to track active connections
const connectionTracker = (req, res, next) => {
  performanceMonitor.activeConnections++;
  
  res.on('finish', () => {
    performanceMonitor.activeConnections--;
  });
  
  next();
};

// System metrics endpoint
const systemMetrics = (req, res) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    activeConnections: performanceMonitor.activeConnections,
    responseTimes: {},
    errorRates: {},
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  };
  
  // Calculate average response times and error rates
  Object.keys(performanceMonitor.responseTime).forEach(url => {
    metrics.responseTimes[url] = {
      average: performanceMonitor.getAverageResponseTime(url),
      count: performanceMonitor.responseTime[url].length
    };
    metrics.errorRates[url] = performanceMonitor.getErrorRate(url);
  });
  
  res.json({
    success: true,
    data: metrics
  });
};

// Alert system
const alertSystem = {
  thresholds: {
    memoryUsage: 0.8, // 80%
    responseTime: 5000, // 5 seconds
    errorRate: 0.1, // 10%
    activeConnections: 100
  },
  
  checkThresholds: () => {
    const memoryUsage = process.memoryUsage();
    const memoryUsagePercent = memoryUsage.heapUsed / memoryUsage.heapTotal;
    
    // Check memory usage
    if (memoryUsagePercent > alertSystem.thresholds.memoryUsage) {
      console.warn(`ALERT: High memory usage detected: ${(memoryUsagePercent * 100).toFixed(2)}%`);
    }
    
    // Check active connections
    if (performanceMonitor.activeConnections > alertSystem.thresholds.activeConnections) {
      console.warn(`ALERT: High number of active connections: ${performanceMonitor.activeConnections}`);
    }
    
    // Check response times and error rates
    Object.keys(performanceMonitor.responseTime).forEach(url => {
      const avgResponseTime = performanceMonitor.getAverageResponseTime(url);
      const errorRate = performanceMonitor.getErrorRate(url);
      
      if (avgResponseTime > alertSystem.thresholds.responseTime) {
        console.warn(`ALERT: High response time for ${url}: ${avgResponseTime}ms`);
      }
      
      if (errorRate > alertSystem.thresholds.errorRate) {
        console.warn(`ALERT: High error rate for ${url}: ${errorRate}%`);
      }
    });
  }
};

// Run alert checks every minute
setInterval(() => {
  if (process.env.ENABLE_METRICS === 'true') {
    alertSystem.checkThresholds();
  }
}, 60000);

module.exports = {
  healthCheck,
  metricsCollector,
  performanceMonitor,
  connectionTracker,
  systemMetrics,
  alertSystem
};

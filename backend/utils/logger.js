const winston = require('winston');
const path = require('path');

// Define log levels and colors
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create logs directory if it doesn't exist
const fs = require('fs');
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Production logger with additional features
class ProductionLogger {
  constructor() {
    this.logger = logger;
    this.requestCounts = new Map();
    this.errorCounts = new Map();
  }

  // Log HTTP requests
  logRequest(req, res, responseTime) {
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Track request counts
    const key = `${method} ${url}`;
    this.requestCounts.set(key, (this.requestCounts.get(key) || 0) + 1);

    this.logger.http(`${method} ${url} ${statusCode} - ${responseTime}ms - ${ip} - ${userAgent}`);

    // Log slow requests
    if (responseTime > 1000) {
      this.logger.warn(`Slow request detected: ${method} ${url} took ${responseTime}ms`);
    }
  }

  // Log errors with context
  logError(error, req = null, additionalContext = {}) {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...additionalContext
    };

    if (req) {
      errorInfo.request = {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
        params: req.params,
        query: req.query,
        ip: req.ip || req.connection.remoteAddress
      };
    }

    // Track error counts
    const errorKey = error.name || 'UnknownError';
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    this.logger.error('Application Error', errorInfo);
  }

  // Log security events
  logSecurityEvent(event, details) {
    this.logger.warn(`Security Event: ${event}`, {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity: 'high'
    });
  }

  // Get statistics
  getStats() {
    return {
      requests: Object.fromEntries(this.requestCounts),
      errors: Object.fromEntries(this.errorCounts),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
  }

  // Standard logger methods
  error(message, meta = {}) {
    this.logger.error(message, meta);
  }

  warn(message, meta = {}) {
    this.logger.warn(message, meta);
  }

  info(message, meta = {}) {
    this.logger.info(message, meta);
  }

  http(message, meta = {}) {
    this.logger.http(message, meta);
  }

  debug(message, meta = {}) {
    this.logger.debug(message, meta);
  }
}

module.exports = new ProductionLogger();

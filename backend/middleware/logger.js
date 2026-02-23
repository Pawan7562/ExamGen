// Professional logging middleware
const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom token for request ID
morgan.token('id', (req) => req.id);

// Custom format for production
const productionFormat = morgan.combine(
  morgan(':id'),
  morgan(':method'),
  morgan(':url'),
  morgan(':status'),
  morgan(':response-time ms'),
  morgan(':user-agent'),
  morgan(':date[clf]')
);

// Custom format for development
const developmentFormat = morgan.dev;

// Create write stream for logs
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

// Logger middleware
const logger = (req, res, next) => {
  // Add unique ID to request
  req.id = Math.random().toString(36).substring(7);
  
  if (process.env.NODE_ENV === 'production') {
    return morgan(productionFormat, {
      stream: accessLogStream,
      skip: (req, res) => res.statusCode < 400
    })(req, res, next);
  } else {
    return morgan(developmentFormat)(req, res, next);
  }
};

// Error logger
const errorLogger = (err, req, res, next) => {
  const errorLog = {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    error: {
      message: err.message,
      stack: err.stack,
      name: err.name
    }
  };

  // Write error to file in production
  if (process.env.NODE_ENV === 'production') {
    fs.appendFileSync(
      path.join(logsDir, 'errors.log'),
      JSON.stringify(errorLog) + '\n'
    );
  }

  console.error('Error Log:', errorLog);
  next(err);
};

module.exports = { logger, errorLogger };

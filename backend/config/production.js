const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5001,
    trustProxy: process.env.TRUST_PROXY === 'true',
    compression: process.env.COMPRESSION_ENABLED === 'true'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    name: process.env.DB_NAME || 'examgen_production',
    options: {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferMaxEntries: 0,
      bufferCommands: false
    }
  },

  // Security Configuration
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12,
    jwtSecret: process.env.JWT_SECRET,
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '30d',
    sessionSecret: process.env.SESSION_SECRET,
    helmetEnabled: process.env.HELMET_ENABLED === 'true'
  },

  // CORS Configuration
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://examgen.vercel.app'],
    credentials: true,
    optionsSuccessStatus: 200
  },

  // Rate Limiting Configuration
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
    message: {
      error: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // Auth Rate Limiting
  authRateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 10,
    message: {
      error: 'Too many authentication attempts, please try again later.'
    },
    skipSuccessfulRequests: true
  },

  // File Upload Configuration
  upload: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    path: process.env.UPLOAD_PATH || 'uploads/',
    allowedTypes: ['image/jpeg', 'image/png', 'text/csv', 'application/vnd.ms-excel']
  },

  // Email Configuration
  email: {
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || 'ExamGen <noreply@examgen.com>'
  },

  // SMS Configuration
  sms: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
    errorFile: process.env.ERROR_LOG_FILE || 'logs/error.log',
    maxSize: '20m',
    maxFiles: '14d'
  },

  // Monitoring Configuration
  monitoring: {
    enabled: process.env.ENABLE_METRICS === 'true',
    healthCheckInterval: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000
  },

  // Performance Configuration
  performance: {
    cacheTTL: parseInt(process.env.CACHE_TTL) || 3600,
    compressionEnabled: process.env.COMPRESSION_ENABLED === 'true'
  }
};

module.exports = productionConfig;

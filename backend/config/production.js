// Production configuration for backend
const isProduction = process.env.NODE_ENV === 'production';

const productionConfig = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5001,
    host: '0.0.0.0',
    cors: {
      origin: isProduction 
        ? [
            'https://www.pkthenexgenexam.xyz',
            'https://pkthenexgenexam.xyz',
            'https://exam-monitoring-zw2j-htegqn42v-exam-monitoring-systems-projects.vercel.app',
            'https://exam-monitoring-e7m8.onrender.com'
          ]
        : [
            'http://localhost:3000',
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174'
          ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: isProduction ? 10000 : 5000,
      maxPoolSize: isProduction ? 20 : 10,
      minPoolSize: isProduction ? 5 : 2,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    }
  },

  // Security Configuration
  security: {
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: isProduction ? 100 : 1000, // Limit requests per window
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", "https://api.render.com"]
        }
      }
    }
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRE || '7d',
    algorithm: 'HS256'
  },

  // Email Configuration
  email: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  },

  // File Upload Configuration
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    destination: 'uploads/'
  },

  // Logging Configuration
  logging: {
    level: isProduction ? 'info' : 'debug',
    format: isProduction ? 'combined' : 'dev',
    enableConsole: !isProduction,
    enableFile: isProduction
  }
};

module.exports = productionConfig;

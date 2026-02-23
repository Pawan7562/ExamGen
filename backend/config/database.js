const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: process.env.NODE_ENV === 'development', // Enable buffering for development
      retryWrites: true, // Retry write operations if they fail
      w: 'majority' // Write acknowledgment
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Monitor connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        logger.error('Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });

  } catch (error) {
    logger.error('❌ Database connection error:', error.message);

    // Don't exit in development, just warn
    if (process.env.NODE_ENV === 'development') {
      logger.warn('⚠️ Running without database connection in development mode');
      return;
    }

    // In production, retry connection
    if (process.env.NODE_ENV === 'production') {
      logger.info('🔄 Retrying database connection in 5 seconds...');
      setTimeout(connectDB, 5000);
      return;
    }

    process.exit(1);
  }
};

// Database health check
const checkDatabaseHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };

    return {
      status: 'healthy',
      connected: state === 1,
      state: states[state],
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

module.exports = { connectDB, checkDatabaseHealth };
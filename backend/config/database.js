const mongoose = require('mongoose');
const { logger } = require('../middleware/errorHandler');

// Database configuration
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'examgen_production',
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
      retryWrites: true,
      w: 'majority'
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    logger.info(`Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('connected', () => {
      logger.info('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('Database connection failed:', error);
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

    if (state === 1) {
      // Test database operation
      await mongoose.connection.db.admin().ping();
      return {
        status: 'healthy',
        state: states[state],
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };
    } else {
      return {
        status: 'unhealthy',
        state: states[state]
      };
    }
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

// Database optimization
const optimizeDatabase = async () => {
  try {
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      
      // Create indexes if they don't exist
      if (collectionName === 'users') {
        await db.collection(collectionName).createIndex({ email: 1 }, { unique: true });
        await db.collection(collectionName).createIndex({ studentId: 1 }, { sparse: true });
        await db.collection(collectionName).createIndex({ role: 1 });
        await db.collection(collectionName).createIndex({ createdAt: 1 });
      }
      
      if (collectionName === 'exams') {
        await db.collection(collectionName).createIndex({ title: 'text', description: 'text' });
        await db.collection(collectionName).createIndex({ subject: 1 });
        await db.collection(collectionName).createIndex({ difficulty: 1 });
        await db.collection(collectionName).createIndex({ createdBy: 1 });
        await db.collection(collectionName).createIndex({ createdAt: 1 });
        await db.collection(collectionName).createIndex({ isActive: 1 });
      }
      
      if (collectionName === 'examsubmissions') {
        await db.collection(collectionName).createIndex({ examId: 1 });
        await db.collection(collectionName).createIndex({ studentId: 1 });
        await db.collection(collectionName).createIndex({ submittedAt: 1 });
        await db.collection(collectionName).createIndex({ score: 1 });
      }
      
      if (collectionName === 'questionbanks') {
        await db.collection(collectionName).createIndex({ subject: 1 });
        await db.collection(collectionName).createIndex({ difficulty: 1 });
        await db.collection(collectionName).createIndex({ type: 1 });
        await db.collection(collectionName).createIndex({ createdBy: 1 });
      }
    }
    
    logger.info('Database optimization completed');
    
    return {
      success: true,
      message: 'Database optimized successfully',
      collectionsOptimized: collections.length
    };
  } catch (error) {
    logger.error('Database optimization failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

module.exports = {
  connectDB,
  checkDatabaseHealth,
  optimizeDatabase
};
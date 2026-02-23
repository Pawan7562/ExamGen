const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
    
    // Don't exit in development, just warn
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Running without database connection in development mode');
      return;
    }
    
    process.exit(1);
  }
};

module.exports = connectDB;
// Test authentication endpoint
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// User model
const User = require('./models/User');

const testAuth = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@test.com' });
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    console.log('✅ Admin user found:', {
      id: admin._id,
      email: admin.email,
      userType: admin.userType,
      isActive: admin.isActive
    });

    // Test password comparison
    const isPasswordMatch = await admin.comparePassword('admin123');
    console.log('✅ Password match test:', isPasswordMatch);

    // Test login endpoint manually
    const express = require('express');
    const app = express();
    app.use(express.json());

    // Import auth controller
    const { login } = require('./controllers/authController');

    // Mock request/response
    const mockReq = {
      body: {
        email: 'admin@test.com',
        password: 'admin123'
      }
    };

    const mockRes = {
      status: (code) => ({
        status: code,
        json: (data) => {
          console.log(`📊 Response Status: ${code}`);
          console.log('📊 Response Data:', data);
          return data;
        }
      }),
      json: (data) => {
        console.log('📊 Response Data:', data);
        return data;
      }
    };

    console.log('\n🧪 Testing login function...');
    await login(mockReq, mockRes, (error) => {
      if (error) {
        console.error('❌ Login error:', error);
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

testAuth();

// Debug password issue
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// User model
const User = require('../models/User');

const debugPassword = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test direct bcrypt comparison
    const testPassword = 'admin123';
    const hashedPassword = await bcrypt.hash('admin123', 12);
    console.log('🔐 Test password:', testPassword);
    console.log('🔐 Hashed password:', hashedPassword);
    
    const directCompare = await bcrypt.compare(testPassword, hashedPassword);
    console.log('🔐 Direct bcrypt compare:', directCompare);

    // Create user manually
    const user = await User.create({
      fullName: 'Debug Admin',
      email: 'debug@test.com',
      password: hashedPassword,
      userType: 'admin',
      isActive: true
    });

    console.log('✅ Debug user created:', user._id);

    // Test with database user
    const dbUser = await User.findOne({ email: 'debug@test.com' }).select('+password');
    console.log('🔐 DB User password exists:', !!dbUser.password);
    console.log('🔐 DB User password type:', typeof dbUser.password);
    console.log('🔐 DB User password length:', dbUser.password.length);

    const dbCompare = await dbUser.comparePassword('admin123');
    console.log('🔐 DB password compare:', dbCompare);

    // Test manual compare
    const manualCompare = await bcrypt.compare('admin123', dbUser.password);
    console.log('🔐 Manual bcrypt compare:', manualCompare);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

debugPassword();

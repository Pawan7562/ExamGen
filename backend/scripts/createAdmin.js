// Create admin user with plain password (middleware will hash it)
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// User model
const User = require('../models/User');

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin users
    await User.deleteMany({ email: { $in: ['admin@test.com', 'debug@test.com'] } });
    console.log('🗑️ Deleted existing admin users');

    // Create admin user with plain password (middleware will hash it)
    const admin = await User.create({
      fullName: 'Test Admin',
      email: 'admin@test.com',
      password: 'admin123', // Plain password - middleware will hash it
      userType: 'admin',
      isActive: true,
      institution: 'Test Institution',
      department: 'IT Department',
      employeeId: 'ADMIN001'
    });

    console.log('✅ Admin user created successfully:');
    console.log('   Email: admin@test.com');
    console.log('   Password: admin123');
    console.log('   User ID:', admin._id);

    // Test login
    const testUser = await User.findOne({ email: 'admin@test.com' }).select('+password');
    const isPasswordMatch = await testUser.comparePassword('admin123');
    console.log('✅ Login test successful:', isPasswordMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();

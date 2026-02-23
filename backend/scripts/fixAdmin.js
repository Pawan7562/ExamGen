// Fix admin user with proper password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// User model
const User = require('../models/User');

const fixAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ email: 'admin@test.com' });
    console.log('🗑️ Deleted existing admin user');

    // Create new admin user with proper password
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await User.create({
      fullName: 'Test Admin',
      email: 'admin@test.com',
      password: hashedPassword,
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

    // Test password comparison
    const testUser = await User.findOne({ email: 'admin@test.com' }).select('+password');
    const isPasswordMatch = await testUser.comparePassword('admin123');
    console.log('✅ Password verification test:', isPasswordMatch);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAdmin();

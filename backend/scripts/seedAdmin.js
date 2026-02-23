// Seed admin user for production testing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// User model
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@test.com' });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
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

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

// Data Migration Script for Student Admin Isolation
// This script assigns existing students to their respective admins based on creation order

const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const migrateStudentData = async () => {
  try {
    console.log('🔄 Starting student data migration...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all admins
    const admins = await User.find({ userType: 'admin' });
    console.log(`📊 Found ${admins.length} admins`);

    if (admins.length === 0) {
      console.log('❌ No admins found. Please create at least one admin first.');
      return;
    }

    // Get all students without adminId
    const studentsWithoutAdmin = await User.find({ 
      userType: 'student',
      adminId: { $in: [null, undefined] }
    });
    
    console.log(`📊 Found ${studentsWithoutAdmin.length} students without adminId`);

    if (studentsWithoutAdmin.length === 0) {
      console.log('✅ All students already have adminId assigned');
      return;
    }

    // Assign students to admins in round-robin fashion
    let adminIndex = 0;
    let updatedCount = 0;

    for (const student of studentsWithoutAdmin) {
      const admin = admins[adminIndex];
      
      await User.findByIdAndUpdate(student._id, {
        adminId: admin._id
      });
      
      console.log(`📝 Assigned student ${student.fullName} (${student.email}) to admin ${admin.fullName} (${admin.email})`);
      
      updatedCount++;
      adminIndex = (adminIndex + 1) % admins.length; // Round-robin assignment
    }

    console.log(`✅ Migration completed! Updated ${updatedCount} students`);

    // Verify migration
    const remainingStudents = await User.find({ 
      userType: 'student',
      adminId: { $in: [null, undefined] }
    });

    if (remainingStudents.length === 0) {
      console.log('✅ All students now have adminId assigned');
    } else {
      console.log(`⚠️ ${remainingStudents.length} students still without adminId`);
    }

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration
if (require.main === module) {
  migrateStudentData();
}

module.exports = migrateStudentData;

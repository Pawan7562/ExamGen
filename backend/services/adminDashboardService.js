// Admin Dashboard Service - Complete Data Isolation
const User = require('../models/User');

// Get admin-specific dashboard data
const getAdminDashboardData = async (adminId) => {
  try {
    console.log('📊 Getting dashboard data for admin:', adminId);
    
    // Get admin's students only
    const adminStudents = await User.find({ 
      userType: 'student',
      adminId: adminId 
    }).select('-password').sort({ createdAt: -1 });
    
    // Get admin's exams only
    const adminExams = await User.find({ 
      userType: 'admin',
      _id: adminId 
    }).populate('createdExams');
    
    // Calculate admin-specific statistics
    const stats = {
      totalStudents: adminStudents.length,
      activeStudents: adminStudents.filter(s => s.isActive).length,
      inactiveStudents: adminStudents.filter(s => !s.isActive).length,
      totalExams: adminExams.length?.length || 0,
      activeExams: adminExams.filter(e => e.isActive).length || 0,
      inactiveExams: adminExams.filter(e => !e.isActive).length || 0,
      recentRegistrations: adminStudents.filter(s => {
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return s.createdAt >= sevenDaysAgo;
      }).length,
      courseDistribution: {},
      batchDistribution: {},
      semesterDistribution: {}
    };
    
    // Calculate distributions for admin's students only
    adminStudents.forEach(student => {
      if (student.course) {
        stats.courseDistribution[student.course] = (stats.courseDistribution[student.course] || 0) + 1;
      }
      if (student.batch) {
        stats.batchDistribution[student.batch] = (stats.batchDistribution[student.batch] || 0) + 1;
      }
      if (student.semester) {
        const semesterKey = `Semester ${student.semester}`;
        stats.semesterDistribution[semesterKey] = (stats.semesterDistribution[semesterKey] || 0) + 1;
      }
    });
    
    console.log('✅ Admin dashboard data calculated:', {
      adminId,
      totalStudents: stats.totalStudents,
      totalExams: stats.totalExams
    });
    
    return {
      success: true,
      data: {
        admin: {
          id: adminId,
          stats: stats
        },
        students: adminStudents,
        exams: adminExams
      }
    };
    
  } catch (error) {
    console.error('❌ Error getting admin dashboard data:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Verify admin ownership of data
const verifyAdminOwnership = async (adminId, resourceType, resourceId) => {
  try {
    let resource;
    
    switch (resourceType) {
      case 'student':
        resource = await User.findOne({ _id: resourceId, adminId, userType: 'student' });
        break;
      case 'exam':
        resource = await User.findOne({ _id: resourceId, adminId, userType: 'admin' });
        break;
      default:
        return false;
    }
    
    return !!resource;
  } catch (error) {
    console.error('❌ Error verifying admin ownership:', error);
    return false;
  }
};

module.exports = {
  getAdminDashboardData,
  verifyAdminOwnership
};

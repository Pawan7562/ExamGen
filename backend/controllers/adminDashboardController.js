const adminDashboardService = require('../services/adminDashboardService');
const User = require('../models/User');

// @desc    Get admin dashboard data
// @route   GET /api/v1/admin/dashboard
// @access  Private (Admin only)
exports.getAdminDashboard = async (req, res) => {
  try {
    const adminId = req.user._id;
    console.log('📊 Admin dashboard requested by:', req.user.fullName, 'ID:', adminId);
    
    // Get admin-specific dashboard data
    const dashboardData = await adminDashboardService.getAdminDashboardData(adminId);
    
    if (!dashboardData.success) {
      return res.status(500).json({
        success: false,
        error: dashboardData.error
      });
    }
    
    // Add admin profile info
    const adminProfile = await User.findById(adminId).select('-password');
    
    res.status(200).json({
      success: true,
      data: {
        admin: {
          ...adminProfile.toJSON(),
          dashboard: dashboardData.data.stats
        },
        students: dashboardData.data.students,
        exams: dashboardData.data.exams
      }
    });
    
  } catch (error) {
    console.error('❌ Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/v1/admin/profile
// @access  Private (Admin only)
exports.getAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id;
    
    const admin = await User.findById(adminId).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: admin
    });
    
  } catch (error) {
    console.error('❌ Get admin profile error:', error);
    res.status(500).json({
      success: false,
      error: error.error.message
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/v1/admin/profile
// @access  Private (Admin only)
exports.updateAdminProfile = async (req, res) => {
  try {
    const adminId = req.user._id;
    const allowedFields = ['fullName', 'email', 'phoneNumber', 'institution', 'college', 'department', 'designation'];
    
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    
    // Don't allow changing email to existing email
    if (updates.email) {
      const existingUser = await User.findOne({ 
        email: updates.email, 
        _id: { $ne: adminId },
        userType: 'admin'
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already exists'
        });
      }
    }
    
    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      updates,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: updatedAdmin,
      message: 'Profile updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update admin profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get admin settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin only)
exports.getAdminSettings = async (req, res) => {
  try {
    const adminId = req.user._id;
    
    const admin = await User.findById(adminId).select('-password');
    
    if (!admin) {
      return res.status(404).json({
        success: false,
        error: 'Admin not found'
      });
    }
    
    // Return admin-specific settings
    const settings = {
      notifications: {
        email: admin.emailNotificationsEnabled || true,
        sms: admin.smsNotificationsEnabled || false,
        examReminders: admin.examRemindersEnabled || true
      },
      privacy: {
        showStudentStats: admin.showStudentStats !== false,
        allowStudentExport: admin.allowStudentExport !== false,
        dataRetentionDays: admin.dataRetentionDays || 365
      },
      appearance: {
        theme: admin.theme || 'light',
        language: admin.language || 'en',
        timezone: admin.timezone || 'UTC'
      }
    };
    
    res.status(200).json({
      success: true,
      data: settings
    });
    
  } catch (error) {
    console.error('❌ Get admin settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update admin settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin only)
exports.updateAdminSettings = async (req, res) => {
  try {
    const adminId = req.user._id;
    const settings = req.body;
    
    // Update admin with new settings
    const updatedAdmin = await User.findByIdAndUpdate(
      adminId,
      { 
        $set: {
          emailNotificationsEnabled: settings.notifications?.email,
          smsNotificationsEnabled: settings.notifications?.sms,
          examRemindersEnabled: settings.notifications?.examReminders,
          showStudentStats: settings.privacy?.showStudentStats,
          allowStudentExport: settings.privacy?.allowStudentExport,
          dataRetentionDays: settings.privacy?.dataRetentionDays,
          theme: settings.appearance?.theme,
          language: settings.appearance?.language,
          timezone: settings.appearance?.timezone
        }
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    res.status(200).json({
      success: true,
      data: updatedAdmin,
      message: 'Settings updated successfully'
    });
    
  } catch (error) {
    console.error('❌ Update admin settings error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  getAdminDashboard,
  getAdminProfile,
  updateAdminProfile,
  getAdminSettings,
  updateAdminSettings
};

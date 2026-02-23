const mongoose = require('mongoose');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Register student
const registerStudent = async (req, res, next) => {
  try {
    const { fullName, email, password, studentId, course, semester } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { studentId }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or student ID'
      });
    }

    // Create user
    const user = await User.create({
      userType: 'student',
      fullName,
      email,
      password,
      studentId,
      course,
      semester
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Register admin
const registerAdmin = async (req, res, next) => {
  try {
    const { fullName, email, password, institution, department, employeeId } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId }] 
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or employee ID'
      });
    }

    // Create user
    const user = await User.create({
      userType: 'admin',
      fullName,
      email,
      password,
      institution,
      department,
      employeeId
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Admin registered successfully',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Login user
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if MongoDB is connected, if not use mock data
    if (mongoose.connection.readyState !== 1) {
      console.log('⚠️ Using mock authentication (MongoDB not connected)');
      
      // Mock admin credentials for development
      if (email === 'admin@test.com' && password === 'admin123') {
        const mockUser = {
          _id: 'mock-admin-id',
          fullName: 'Test Admin',
          email: 'admin@test.com',
          userType: 'admin',
          institution: 'Test Institution',
          department: 'Computer Science'
        };

        const token = generateToken(mockUser._id);

        return res.status(200).json({
          success: true,
          message: 'Login successful (Mock Mode)',
          token,
          user: mockUser
        });
      }

      // Mock student credentials for development
      if (email === 'student@test.com' && password === 'student123') {
        const mockUser = {
          _id: 'mock-student-id',
          fullName: 'Test Student',
          email: 'student@test.com',
          userType: 'student',
          studentId: 'STU001',
          course: 'Computer Science',
          semester: '6'
        };

        const token = generateToken(mockUser._id);

        return res.status(200).json({
          success: true,
          message: 'Login successful (Mock Mode)',
          token,
          user: mockUser
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials (Mock Mode - Use admin@test.com/admin123 or student@test.com/student123)'
      });
    }

    // Original MongoDB logic
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error) {
    next(error);
  }
};

// Get current user
const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  registerAdmin,
  login,
  getMe
};
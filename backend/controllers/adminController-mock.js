// Mock admin controller for testing (bypasses database)
exports.getDashboard = async (req, res) => {
  console.log('📊 Mock getDashboard called');
  res.json({
    success: true,
    data: {
      totalStudents: 150,
      totalTeachers: 25,
      totalExams: 45,
      activeExams: 12,
      completedAttempts: 89,
      pendingReviews: 5
    }
  });
};

exports.getUsers = async (req, res) => {
  console.log('👥 Mock getUsers called');
  res.json({
    success: true,
    data: [
      { _id: '1', fullName: 'John Doe', email: 'john@test.com', userType: 'teacher' },
      { _id: '2', fullName: 'Jane Smith', email: 'jane@test.com', userType: 'teacher' }
    ],
    pagination: {
      page: 1,
      limit: 10,
      total: 2
    }
  });
};

exports.getAllStudents = async (req, res) => {
  console.log('🎓 Mock getAllStudents called');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || '';
  
  const mockStudents = [
    { _id: '1', fullName: 'Alice Johnson', email: 'alice@test.com', studentId: 'STU001', course: 'Computer Science', semester: '5', status: 'active' },
    { _id: '2', fullName: 'Bob Wilson', email: 'bob@test.com', studentId: 'STU002', course: 'Mathematics', semester: '3', status: 'active' },
    { _id: '3', fullName: 'Charlie Brown', email: 'charlie@test.com', studentId: 'STU003', course: 'Physics', semester: '4', status: 'inactive' }
  ];
  
  let filteredStudents = mockStudents;
  if (search) {
    filteredStudents = mockStudents.filter(student => 
      student.fullName.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedStudents,
    pagination: {
      page,
      limit,
      total: filteredStudents.length,
      pages: Math.ceil(filteredStudents.length / limit)
    }
  });
};

exports.getStudentStats = async (req, res) => {
  console.log('📈 Mock getStudentStats called');
  res.json({
    success: true,
    data: {
      totalStudents: 150,
      activeStudents: 120,
      inactiveStudents: 30,
      averagePerformance: 78.5,
      recentActivity: 45
    }
  });
};

exports.createUser = async (req, res) => {
  console.log('👤 Mock createUser called');
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: { _id: 'new_user_' + Date.now(), ...req.body }
  });
};

exports.updateUser = async (req, res) => {
  console.log('✏️ Mock updateUser called');
  res.json({
    success: true,
    message: 'User updated successfully',
    data: { _id: req.params.id, ...req.body }
  });
};

exports.deleteUser = async (req, res) => {
  console.log('🗑️ Mock deleteUser called');
  res.json({
    success: true,
    message: 'User deleted successfully',
    data: { _id: req.params.id }
  });
};

exports.getSubjects = async (req, res) => {
  console.log('📚 Mock getSubjects called');
  res.json({
    success: true,
    data: [
      { _id: '1', name: 'Computer Science', code: 'CS101', description: 'Introduction to programming' },
      { _id: '2', name: 'Mathematics', code: 'MATH101', description: 'Calculus and algebra' },
      { _id: '3', name: 'Physics', code: 'PHY101', description: 'Mechanics and thermodynamics' }
    ]
  });
};

exports.createSubject = async (req, res) => {
  console.log('📝 Mock createSubject called');
  res.status(201).json({
    success: true,
    message: 'Subject created successfully',
    data: { _id: 'new_subject_' + Date.now(), ...req.body }
  });
};

exports.getMonitoringStats = async (req, res) => {
  console.log('📊 Mock getMonitoringStats called');
  res.json({
    success: true,
    data: {
      serverUptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      activeConnections: 15,
      requestsPerMinute: 45,
      errorRate: 0.02
    }
  });
};

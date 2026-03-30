// Mock exam controller for testing (bypasses database)
exports.createExam = async (req, res) => {
  console.log('📝 Mock createExam called');
  res.status(201).json({
    success: true,
    message: 'Exam created successfully',
    data: { _id: 'mock_exam_' + Date.now(), ...req.body }
  });
};

exports.getAdminExams = async (req, res) => {
  console.log('📋 Mock getAdminExams called');
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const status = req.query.status;
  
  const mockExams = [
    { _id: '1', title: 'Math Final Exam', status: 'active', course: 'Mathematics', createdAt: new Date('2024-01-15') },
    { _id: '2', title: 'Physics Quiz', status: 'published', course: 'Physics', createdAt: new Date('2024-01-20') },
    { _id: '3', title: 'Chemistry Test', status: 'draft', course: 'Chemistry', createdAt: new Date('2024-01-25') }
  ];
  
  let filteredExams = mockExams;
  if (status) {
    filteredExams = mockExams.filter(exam => exam.status === status);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedExams = filteredExams.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedExams,
    pagination: {
      page,
      limit,
      total: filteredExams.length,
      pages: Math.ceil(filteredExams.length / limit)
    }
  });
};

exports.getExamById = async (req, res) => {
  console.log('📖 Mock getExamById called');
  const mockExam = {
    _id: '1',
    title: 'Math Final Exam',
    description: 'Comprehensive mathematics exam covering algebra, calculus, and statistics',
    course: 'Mathematics',
    courseCode: 'MATH101',
    status: 'active',
    duration: 120,
    passingScore: 70,
    maxAttempts: 3,
    questions: [
      {
        _id: 'q1',
        questionText: 'What is the derivative of x²?',
        questionType: 'short-answer',
        points: 10
      },
      {
        _id: 'q2',
        questionText: 'What is the integral of sin(x)?',
        questionType: 'multiple-choice',
        points: 15,
        options: [
          { _id: 'opt1', text: 'cos(x)' },
          { _id: 'opt2', text: '-cos(x)' },
          { _id: 'opt3', text: '0' }
        ]
      }
    ],
    settings: {
      scheduling: {
        startDate: '2024-02-01T09:00:00.000Z',
        endDate: '2024-02-01T11:00:00.000Z'
      }
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20')
  };
  
  res.json({
    success: true,
    data: mockExam
  });
};

exports.updateExam = async (req, res) => {
  console.log('✏️ Mock updateExam called');
  res.json({
    success: true,
    message: 'Exam updated successfully',
    data: { _id: req.params.id, ...req.body }
  });
};

exports.updateExamStatus = async (req, res) => {
  console.log('🔄 Mock updateExamStatus called');
  res.json({
    success: true,
    message: 'Exam status updated successfully',
    data: { _id: req.params.id, status: req.body.status }
  });
};

exports.deleteExam = async (req, res) => {
  console.log('🗑️ Mock deleteExam called');
  res.json({
    success: true,
    message: 'Exam deleted successfully',
    data: { _id: req.params.id }
  });
};

exports.getExamStats = async (req, res) => {
  console.log('📊 Mock getExamStats called');
  res.json({
    success: true,
    data: {
      totalExams: 45,
      activeExams: 12,
      completedExams: 28,
      averageScore: 76.5,
      totalAttempts: 156,
      passRate: 78.5
    }
  });
};

// Other functions (minimal implementations)
exports.startExamAttempt = async (req, res) => {
  console.log('▶️ Mock startExamAttempt called');
  res.json({
    success: true,
    message: 'Exam attempt started',
    data: { attemptId: 'attempt_' + Date.now() }
  });
};

exports.getExamAttempt = async (req, res) => {
  console.log('📋 Mock getExamAttempt called');
  res.json({
    success: true,
    data: {
      attemptId: req.params.id,
      status: 'in_progress',
      startTime: new Date(),
      answers: []
    }
  });
};

exports.submitAnswer = async (req, res) => {
  console.log('📝 Mock submitAnswer called');
  res.json({
    success: true,
    message: 'Answer submitted successfully'
  });
};

exports.submitExamAttempt = async (req, res) => {
  console.log('✅ Mock submitExamAttempt called');
  res.json({
    success: true,
    message: 'Exam submitted successfully',
    data: {
      attemptId: req.params.id,
      status: 'completed',
      score: 85,
      passed: true
    }
  });
};

exports.getAvailableExams = async (req, res) => {
  console.log('📚 Mock getAvailableExams called');
  res.json({
    success: true,
    data: [
      { _id: '1', title: 'Available Math Exam', course: 'Mathematics' },
      { _id: '2', title: 'Available Physics Exam', course: 'Physics' }
    ]
  });
};

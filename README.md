# 🎓 Professional Online Exam Monitoring System

A comprehensive, secure, and professional online examination platform designed for colleges and educational institutions. This system provides robust proctoring capabilities, admin dashboards, and secure exam delivery with AI-based monitoring.

## ✨ Features

### 🔐 Admin Dashboard
- **User Management**: Create, manage, and organize students, teachers, and administrators
- **Bulk Upload**: Import users via CSV/Excel files with comprehensive validation
- **Exam Creation**: Build exams with multiple question types and advanced settings
- **Real-time Monitoring**: Live proctoring dashboard with suspicious activity tracking
- **Comprehensive Reports**: Generate detailed exam reports with analytics and insights
- **Subject Management**: Organize courses and subjects with teacher assignments

### 🛡️ AI-Based Proctoring
- **Webcam Monitoring**: Continuous video surveillance during exams
- **Microphone Detection**: Audio monitoring for suspicious sounds
- **Tab Switching Detection**: Automatic flagging of navigation away from exam
- **Right-Click Prevention**: Disable context menus and copy-paste operations
- **Fullscreen Enforcement**: Force fullscreen mode with exit detection
- **Developer Tools Detection**: Identify attempts to open browser developer tools
- **Risk Score Calculation**: Automatic scoring based on suspicious activities
- **Manual Review System**: Teachers can review flagged attempts

### 🔒 Lockdown Browser Features
- **Keyboard Shortcut Blocking**: Prevent common shortcuts (Ctrl+C, Ctrl+V, Alt+Tab, F12, etc.)
- **Context Menu Disabling**: Right-click prevention
- **Text Selection Prevention**: Disable text selection during exams
- **Window Focus Monitoring**: Track when students switch windows or applications
- **Auto-Save Functionality**: Automatically save answers every 30 seconds
- **Time Limit Enforcement**: Automatic submission when time expires

### 👨‍🎓 Student Interface
- **Secure Login**: Unique exam links and access keys
- **System Requirements Check**: Pre-exam validation of camera, microphone, and browser
- **Intuitive Exam Interface**: Clean, distraction-free exam taking experience
- **Question Navigation**: Forward/backward navigation with progress indicators
- **Multiple Question Types**: Support for multiple-choice, true/false, and short-answer questions
- **Auto-Save**: Continuous saving of progress

### 📊 Analytics & Reporting
- **Comprehensive Exam Reports**: Detailed performance analytics
- **Student Performance Tracking**: Individual progress monitoring
- **Question-wise Analysis**: Identify difficult questions and common mistakes
- **Proctoring Insights**: Suspicious activity patterns and trends
- **CSV Export**: Export data for external analysis
- **Department-wise Analytics**: Institution-wide performance insights

## 🚀 Quick Start

### Prerequisites
- Node.js 16 or higher
- MongoDB (local or cloud instance)
- Modern web browser with camera/microphone support

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd exam-monitoring-system
   ```

2. **Run the automated setup**
   ```bash
   node setup.js
   ```
   This will:
   - Install all dependencies for both frontend and backend
   - Create necessary directories
   - Set up environment files
   - Create sample data files
   - Validate system requirements

3. **Start MongoDB**
   - Windows: Start MongoDB service from Services
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

4. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on http://localhost:5000

5. **Start the frontend server**
   ```bash
   npm run dev
   ```
   Frontend will run on http://localhost:5173

### Manual Installation (Alternative)

If you prefer manual setup:

1. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env  # Configure your environment variables
   npm run dev
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Configure the following in `backend/.env`:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/exammonitor
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
BCRYPT_SALT_ROUNDS=12

# Optional: Email configuration for notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File upload limits
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=./uploads
```

## 📁 Project Structure

```
exam-monitoring-system/
├── backend/                 # Node.js Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middlewares/        # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── uploads/           # File uploads directory
│   └── server.js          # Entry point
├── src/                    # React frontend
│   ├── components/        # Reusable components
│   ├── contexts/          # React contexts
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── App.jsx           # Main app component
├── sample-data/           # Sample CSV files
├── setup.js              # Automated setup script
└── README.md             # This file
```

## 🏗️ API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `GET /api/v1/auth/me` - Get current user

### Admin Management
- `GET /api/v1/admin/dashboard` - Admin dashboard data
- `GET /api/v1/admin/users` - Get users with filtering
- `POST /api/v1/admin/users` - Create users
- `POST /api/v1/admin/users/upload` - Bulk upload users
- `PUT /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user

### Exams
- `GET /api/v1/exams` - Get exams
- `POST /api/v1/exams` - Create exam
- `GET /api/v1/exams/:id` - Get exam details
- `PUT /api/v1/exams/:id` - Update exam
- `DELETE /api/v1/exams/:id` - Delete exam

### Proctoring
- `POST /api/v1/proctoring/initialize` - Initialize proctoring session
- `POST /api/v1/proctoring/event` - Record proctoring event
- `GET /api/v1/proctoring/stats/:examId` - Get proctoring statistics
- `GET /api/v1/proctoring/realtime/:examId` - Real-time proctoring data
- `PUT /api/v1/proctoring/review/:attemptId` - Review flagged attempt

### Reports
- `GET /api/v1/reports/exam/:examId` - Generate exam report
- `GET /api/v1/reports/student/:studentId` - Generate student report
- `GET /api/v1/reports/analytics` - Institution analytics

## 👥 User Roles & Permissions

### 🔑 Admin
- Full system access
- User management (create, edit, delete)
- System-wide analytics
- All exam management capabilities

### 👨‍🏫 Teacher
- Create and manage their own exams
- View students assigned to their subjects
- Access proctoring dashboard for their exams
- Generate reports for their exams
- Review flagged exam attempts

### 👨‍🎓 Student
- Take assigned exams
- View their exam results
- Access their performance history
- System requirements check before exams

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: BCrypt with configurable salt rounds
- **Rate Limiting**: Prevent brute force attacks
- **CORS Protection**: Configurable cross-origin policies
- **Input Validation**: Comprehensive request validation
- **File Upload Security**: Type and size restrictions
- **SQL Injection Protection**: MongoDB query sanitization
- **XSS Prevention**: Content Security Policy headers

## 📊 Proctoring Events

The system monitors and records the following events:

- `tab_switch` - Student switched browser tabs
- `window_blur` - Browser window lost focus
- `copy_paste` - Copy/paste operations attempted
- `right_click` - Right-click context menu access
- `full_screen_exit` - Exited fullscreen mode
- `camera_disabled` - Camera was disabled or blocked
- `microphone_disabled` - Microphone access lost
- `multiple_faces` - Multiple faces detected in camera
- `no_face_detected` - No face visible in camera
- `suspicious_noise` - Unusual audio patterns detected
- `screen_share_detected` - Screen sharing software detected

## 🚦 System Requirements

### Server Requirements
- Node.js 16+
- MongoDB 4.4+
- 2GB RAM minimum
- 10GB storage space

### Client Requirements
- Modern web browser (Chrome 88+, Firefox 85+, Safari 14+)
- Camera and microphone access
- Stable internet connection
- JavaScript enabled
- Fullscreen API support

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

2. **Camera/Microphone Not Working**
   - Grant browser permissions
   - Check device privacy settings
   - Use HTTPS in production

3. **Fullscreen Issues**
   - Use supported browser
   - Disable browser extensions
   - Check browser security settings

4. **File Upload Errors**
   - Check file size limits
   - Verify file format (CSV/Excel)
   - Ensure proper column headers

### Getting Help

- Check the console for error messages
- Review server logs in the terminal
- Verify all dependencies are installed
- Ensure environment variables are set correctly

## 🔄 Development

### Running in Development Mode

```bash
# Backend (with auto-restart)
cd backend
npm run dev

# Frontend (with hot reload)
npm run dev
```

### Building for Production

```bash
# Build frontend
npm run build

# Start production server
cd backend
npm start
```

### Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

## 📝 Sample Data

Use the provided sample CSV file in `sample-data/sample-users.csv` to test bulk user uploads. The file includes:
- Sample students with proper formatting
- Teacher accounts
- Admin users
- Required and optional fields

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See LICENSE file for details.

## 🎯 Roadmap

- [ ] Mobile app for exam taking
- [ ] Integration with Learning Management Systems (LMS)
- [ ] Advanced AI proctoring with facial recognition
- [ ] Multi-language support
- [ ] Offline exam capability
- [ ] Advanced analytics dashboard
- [ ] Question bank management
- [ ] Plagiarism detection

---

**Built with ❤️ for educational institutions worldwide**

For support or questions, please open an issue in the repository.
#   E x a m G e n  
 #   E x a m G e n  
 
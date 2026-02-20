# Exam Monitor System - Frontend

Professional Online Examination Monitoring System - Frontend Application

## Overview

This is the frontend application for the Exam Monitor System, a comprehensive online examination platform with AI-powered proctoring capabilities. The frontend is built with React, Vite, and modern web technologies to provide a smooth and responsive user experience.

## Features

### 🎯 Core Features
- **Modern React Architecture** - Built with React 18 and modern hooks
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Real-time Updates** - Live monitoring and instant notifications
- **Professional UI/UX** - Clean, intuitive interface with smooth animations

### 👥 User Roles
- **Admin Dashboard** - Comprehensive exam management and monitoring
- **Student Portal** - Exam access, submission, and results viewing
- **Proctoring Interface** - Real-time monitoring and incident detection

### 🚀 Key Components
- **Exam Management** - Create, schedule, and manage examinations
- **Student Management** - Bulk upload and manage student accounts
- **Live Monitoring** - Real-time exam proctoring with AI detection
- **Analytics & Reports** - Comprehensive performance and integrity reports
- **Coding Questions** - Programming assessment platform with test cases

## Technology Stack

- **React 18** - Modern React with hooks and concurrent features
- **Vite** - Fast build tool and development server
- **React Router** - Client-side routing and navigation
- **Axios** - HTTP client for API communication
- **React Toastify** - Beautiful notification system
- **Recharts** - Data visualization and analytics charts
- **Date-fns** - Date manipulation and formatting
- **ESLint** - Code quality and linting

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:5174
```

### Available Scripts

- `npm start` - Start the development server
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── logo2.png          # Application logo
│   └── vite.svg           # Vite logo
├── src/                   # Source code
│   ├── components/        # Reusable components
│   │   ├── Navbar/        # Navigation component
│   │   ├── AuthModal/     # Authentication modal
│   │   └── ...            # Other components
│   ├── contexts/          # React contexts
│   │   └── AuthContext.js # Authentication context
│   ├── pages/             # Page components
│   │   ├── Home/          # Landing page
│   │   ├── Admin/         # Admin pages
│   │   │   ├── Dashboard/ # Admin dashboard
│   │   │   ├── Exams/     # Exam management
│   │   │   ├── Students/  # Student management
│   │   │   └── ...        # Other admin pages
│   │   └── Student/       # Student pages
│   │       ├── Dashboard/ # Student dashboard
│   │       ├── Exams/     # Exam access
│   │       └── ...        # Other student pages
│   ├── App.jsx            # Main application component
│   ├── main.jsx           # Application entry point
│   └── App.css            # Global styles
├── index.html             # HTML template
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint configuration
└── package.json           # Package configuration
```

## Configuration

### Environment Variables
Create a `.env` file in the frontend root:

```env
VITE_API_URL=http://localhost:5001
VITE_APP_TITLE=Exam Monitor System
```

### Vite Configuration
The `vite.config.js` file includes:
- Development server configuration
- Proxy settings for API calls
- Build optimization settings
- Plugin configuration

## API Integration

The frontend communicates with the backend API through:
- **Axios HTTP client** for API requests
- **React Context** for state management
- **JWT tokens** for authentication
- **Toast notifications** for user feedback

### API Endpoints
- `/api/v1/auth/*` - Authentication endpoints
- `/api/v1/exams/*` - Exam management
- `/api/v1/students/*` - Student management
- `/api/v1/coding-questions/*` - Coding questions
- `/api/v1/monitoring/*` - Live monitoring

## Development

### Code Style
- Follow ESLint rules for consistent code style
- Use functional components with hooks
- Implement proper error handling
- Write meaningful comments and documentation

### Component Guidelines
- Create reusable, modular components
- Use proper TypeScript/JavaScript prop types
- Implement loading states and error boundaries
- Follow React best practices

### State Management
- Use React Context for global state
- Local state with useState/useReducer hooks
- Server state with API calls and caching
- Form state with controlled components

## Deployment

### Production Build
```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service.

### Environment-Specific Builds
- **Development**: Hot reload, detailed error messages
- **Production**: Optimized bundle, minified code
- **Preview**: Production build with dev server

## Contributing

1. Follow the existing code style and patterns
2. Write meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed

## Support

For technical support or questions:
- Check the main project README
- Review the API documentation
- Contact the development team

## License

This project is licensed under the MIT License - see the main project LICENSE file for details.

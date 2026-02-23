import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [settings, setSettings] = useState(null);

  // Fetch admin dashboard data
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/dashboard/isolated', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const data = await response.json();
      setDashboardData(data.data);
      setAdminProfile(data.data.admin);
      
      console.log('📊 Admin dashboard data:', data.data);
      
    } catch (error) {
      console.error('❌ Dashboard error:', error);
      setError(error.message);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch admin settings
  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/v1/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data.data);
      
    } catch (error) {
      console.error('❌ Settings error:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-state">
          <div className="modern-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h3>Dashboard Error</h3>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="admin-dashboard">
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h3>No Dashboard Data Available</h3>
          <p>Your dashboard data will appear here once you have students and exams.</p>
        </div>
      </div>
    );
  }

  const { admin, students, exams } = dashboardData;
  const stats = admin.dashboard;

  return (
    <div className="admin-dashboard">
      {/* Admin Profile Header */}
      <div className="dashboard-header">
        <div className="admin-profile">
          <div className="admin-avatar">
            {adminProfile?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="admin-info">
            <h1>Welcome, {adminProfile?.fullName || 'Admin'}!</h1>
            <p className="admin-role">Administrator</p>
            <p className="admin-email">{adminProfile?.email || 'admin@example.com'}</p>
          </div>
        </div>
        <div className="admin-actions">
          <button className="btn btn-secondary">
            ⚙️ Settings
          </button>
          <button className="btn btn-primary">
            📊 Full Report
          </button>
        </div>
      </div>

      {/* Dashboard Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card total-students">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>{stats.totalStudents}</h3>
            <p>Total Students</p>
            <span className="stat-change">+{stats.recentRegistrations} this week</span>
          </div>
        </div>

        <div className="stat-card active-students">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <h3>{stats.activeStudents}</h3>
            <p>Active Students</p>
            <span className="stat-change">
              {stats.totalStudents > 0 ? 
                `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% active` : 
                'No students yet'
              }
            </span>
          </div>
        </div>

        <div className="stat-card total-exams">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <h3>{stats.totalExams}</h3>
            <p>Total Exams</p>
            <span className="stat-change">
              {stats.activeExams} active
            </span>
          </div>
        </div>

        <div className="stat-card recent-activity">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <h3>{stats.recentRegistrations}</h3>
            <p>Recent Registrations</p>
            <span className="stat-change">Last 7 days</span>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="analytics-section">
        <div className="chart-container">
          <h3>📚 Course Distribution</h3>
          <div className="course-stats">
            {Object.entries(stats.courseDistribution).length > 0 ? (
              Object.entries(stats.courseDistribution).map(([course, count]) => (
                <div key={course} className="course-item">
                  <span className="course-name">{course}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(count / stats.totalStudents) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="course-count">{count}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No course data available</p>
            )}
          </div>
        </div>

        <div className="chart-container">
          <h3>🎓 Batch Distribution</h3>
          <div className="batch-stats">
            {Object.entries(stats.batchDistribution).length > 0 ? (
              Object.entries(stats.batchDistribution).map(([batch, count]) => (
                <div key={batch} className="batch-item">
                  <span className="batch-name">Batch {batch}</span>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${(count / stats.totalStudents) * 100}%` 
                      }}
                    ></div>
                  </div>
                  <span className="batch-count">{count}</span>
                </div>
              ))
            ) : (
              <p className="no-data">No batch data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="recent-students-section">
        <h3>👥 Recent Student Registrations</h3>
        <div className="students-table">
          {students && students.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Course</th>
                  <th>Status</th>
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 5).map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName}</td>
                    <td>{student.email}</td>
                    <td>{student.course || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${student.isActive ? 'active' : 'inactive'}`}>
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-students">
              <p>No students registered yet</p>
              <button className="btn btn-primary">
                ➕ Add First Student
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>🚀 Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">➕</span>
            <span className="action-text">Add Student</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📁</span>
            <span className="action-text">Bulk Upload</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📝</span>
            <span className="action-text">Create Exam</span>
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            <span className="action-text">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

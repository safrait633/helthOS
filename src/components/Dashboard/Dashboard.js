import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import AdminDashboard from './AdminDashboard';
import NurseDashboard from './NurseDashboard';
import PatientDashboard from './PatientDashboard';
import './Dashboard.css';

function Dashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Redirect based on user role
  useEffect(() => {
    if (user) {
      switch (user.role) {
        case 'admin':
          return;
        case 'nurse':
          return;
        case 'patient':
          return;
        case 'doctor':
          return;
        default:
          // Default to doctor dashboard (current dashboard)
          return;
      }
    }
  }, [user]);

  // Render appropriate dashboard based on role
  if (user) {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'nurse':
        return <NurseDashboard />;
      case 'patient':
        return <PatientDashboard />;
      case 'doctor':
        // Default to doctor dashboard (current dashboard)
        break;
      default:
        // Default to doctor dashboard (current dashboard)
        break;
    }
  }

  const specialties = [
    { name: t('specialties.cardiology'), icon: 'fas fa-heartbeat', path: 'cardiology', color: '#e53e3e' },
    { name: t('specialties.neurology'), icon: 'fas fa-brain', path: 'neurology', color: '#9f7aea' },
    { name: t('specialties.gastroenterology'), icon: 'fas fa-stomach', path: 'gastroenterology', color: '#38a169' },
    { name: t('specialties.dermatology'), icon: 'fas fa-user-md', path: 'dermatology', color: '#d69e2e' },
    { name: t('specialties.endocrinology'), icon: 'fas fa-pills', path: 'endocrinology', color: '#3182ce' },
    { name: t('specialties.hematology'), icon: 'fas fa-tint', path: 'hematology', color: '#c53030' },
    { name: t('specialties.infectiousDiseases'), icon: 'fas fa-virus', path: 'infectious_diseases', color: '#d53f8c' },
    { name: t('specialties.musculoskeletal'), icon: 'fas fa-bone', path: 'musculoskeletal', color: '#805ad5' },
    { name: t('specialties.ophthalmology'), icon: 'fas fa-eye', path: 'ophthalmology', color: '#319795' },
    { name: t('specialties.otolaryngology'), icon: 'fas fa-head-side-mask', path: 'otolaryngology', color: '#dd6b20' },
    { name: t('specialties.pneumology'), icon: 'fas fa-lungs', path: 'pneumology', color: '#2b6cb0' },
    { name: t('specialties.psychiatry'), icon: 'fas fa-brain', path: 'psychiatry', color: '#553c9a' },
    { name: t('specialties.rheumatology'), icon: 'fas fa-hand-paper', path: 'rheumatology', color: '#2d3748' },
    { name: t('specialties.urology'), icon: 'fas fa-kidneys', path: 'urology', color: '#2c5282' },
    { name: t('specialties.geriatrics'), icon: 'fas fa-user-clock', path: 'geriatrics', color: '#4a5568' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-heartbeat"></i>
            {!sidebarCollapsed && <span className="app-title">HealthOS</span>}
          </div>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <a href="#" className="nav-link active">
                <i className="fas fa-th-large"></i>
                {!sidebarCollapsed && <span>{t('dashboard.title')}</span>}
              </a>
            </li>
            <li className="nav-item">
              <Link to="/admin" className="nav-link">
                <i className="fas fa-users-cog"></i>
                {!sidebarCollapsed && <span>{t('dashboard.administration')}</span>}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{user?.specialty}</div>
              </div>
            )}
          </div>
          <button className="logout-btn" onClick={handleLogout} title={t('auth.logout')}>
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>{t('auth.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              <h1>{t('dashboard.welcome')}, {user?.firstName}!</h1>
              <p>{t('dashboard.selectSpecialty')}</p>
            </div>
            <div className="header-right">
              <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stat-info">
                <h3>15</h3>
                <p>{t('admin.specialties')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clipboard-list"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('admin.completedExaminations')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('dashboard.reports')}</p>
              </div>
            </div>
          </div>

          {/* Specialties Grid */}
          <div className="specialties-section">
            <h2>{t('landing.medicalSpecialties')}</h2>
            <div className="specialties-grid">
              {specialties.map((specialty) => (
                <Link 
                  key={specialty.path}
                  to={`/specialty/${specialty.path}`}
                  className="specialty-card"
                  style={{ '--specialty-color': specialty.color }}
                >
                  <div className="specialty-icon">
                    <i className={specialty.icon}></i>
                  </div>
                  <h3>{specialty.name}</h3>
                  <p>{t('dashboard.conductExamination')}</p>
                  <div className="specialty-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="recent-activity">
            <h2>{t('dashboard.recentActivity')}</h2>
            <div className="activity-list">
              <div className="activity-item empty">
                <div className="activity-icon">
                  <i className="fas fa-info-circle"></i>
                </div>
                <div className="activity-content">
                  <p>{t('dashboard.noActivity')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
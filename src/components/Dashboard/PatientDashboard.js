import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Dashboard.css';

function PatientDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const patientActions = [
    { name: t('patient.appointments'), icon: 'fas fa-calendar-check', path: '/patient/appointments', color: '#3182ce' },
    { name: t('patient.medicalHistory'), icon: 'fas fa-file-medical', path: '/patient/history', color: '#38a169' },
    { name: t('patient.prescriptions'), icon: 'fas fa-prescription-bottle', path: '/patient/prescriptions', color: '#d69e2e' },
    { name: t('patient.testResults'), icon: 'fas fa-vial', path: '/patient/results', color: '#9f7aea' },
    { name: t('patient.healthMetrics'), icon: 'fas fa-chart-line', path: '/patient/metrics', color: '#e53e3e' },
    { name: t('patient.messages'), icon: 'fas fa-comments', path: '/patient/messages', color: '#319795' }
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
              <Link to="/patient/appointments" className="nav-link">
                <i className="fas fa-calendar-check"></i>
                {!sidebarCollapsed && <span>{t('patient.appointments')}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/patient/history" className="nav-link">
                <i className="fas fa-file-medical"></i>
                {!sidebarCollapsed && <span>{t('patient.medicalHistory')}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/patient/prescriptions" className="nav-link">
                <i className="fas fa-prescription-bottle"></i>
                {!sidebarCollapsed && <span>{t('patient.prescriptions')}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/patient/profile" className="nav-link">
                <i className="fas fa-user-edit"></i>
                {!sidebarCollapsed && <span>{t('patient.profile')}</span>}
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
                <div className="user-role">{t('auth.patient')}</div>
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
              <p>{t('patient.dashboardDescription')}</p>
            </div>
            <div className="header-right">
              <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Patient Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('patient.upcomingAppointments')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-prescription-bottle"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('patient.activePrescriptions')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-vial"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('patient.pendingResults')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-envelope"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('patient.unreadMessages')}</p>
              </div>
            </div>
          </div>

          {/* Patient Actions Grid */}
          <div className="specialties-section">
            <h2>{t('patient.healthServices')}</h2>
            <div className="specialties-grid">
              {patientActions.map((action) => (
                <Link 
                  key={action.path}
                  to={action.path}
                  className="specialty-card"
                  style={{ '--specialty-color': action.color }}
                >
                  <div className="specialty-icon">
                    <i className={action.icon}></i>
                  </div>
                  <h3>{action.name}</h3>
                  <p>{t('patient.accessService')}</p>
                  <div className="specialty-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Health Summary */}
          <div className="recent-activity">
            <h2>{t('patient.healthSummary')}</h2>
            <div className="activity-list">
              <div className="activity-item empty">
                <div className="activity-icon">
                  <i className="fas fa-heart"></i>
                </div>
                <div className="activity-content">
                  <p>{t('patient.noHealthData')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default PatientDashboard;
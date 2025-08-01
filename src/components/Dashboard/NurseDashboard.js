import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Dashboard.css';

function NurseDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const nurseActions = [
    { name: t('nurse.patientCare'), icon: 'fas fa-user-injured', path: '/nurse/patients', color: '#e53e3e' },
    { name: t('nurse.vitalSigns'), icon: 'fas fa-heartbeat', path: '/nurse/vitals', color: '#38a169' },
    { name: t('nurse.medications'), icon: 'fas fa-pills', path: '/nurse/medications', color: '#3182ce' },
    { name: t('nurse.schedules'), icon: 'fas fa-calendar-alt', path: '/nurse/schedules', color: '#d69e2e' },
    { name: t('nurse.reports'), icon: 'fas fa-clipboard-list', path: '/nurse/reports', color: '#9f7aea' },
    { name: t('nurse.emergencies'), icon: 'fas fa-ambulance', path: '/nurse/emergencies', color: '#c53030' }
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
              <Link to="/nurse/patients" className="nav-link">
                <i className="fas fa-user-injured"></i>
                {!sidebarCollapsed && <span>{t('nurse.patients')}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/nurse/schedules" className="nav-link">
                <i className="fas fa-calendar-alt"></i>
                {!sidebarCollapsed && <span>{t('nurse.schedules')}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/nurse/reports" className="nav-link">
                <i className="fas fa-clipboard-list"></i>
                {!sidebarCollapsed && <span>{t('nurse.reports')}</span>}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-nurse"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{t('auth.nurse')}</div>
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
              <p>{t('nurse.dashboardDescription')}</p>
            </div>
            <div className="header-right">
              <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Nurse Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-user-injured"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('nurse.assignedPatients')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-tasks"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('nurse.pendingTasks')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-pills"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('nurse.medicationsToday')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-info">
                <h3>8</h3>
                <p>{t('nurse.shiftHours')}</p>
              </div>
            </div>
          </div>

          {/* Nurse Actions Grid */}
          <div className="specialties-section">
            <h2>{t('nurse.nursingActions')}</h2>
            <div className="specialties-grid">
              {nurseActions.map((action) => (
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
                  <p>{t('nurse.manageAction')}</p>
                  <div className="specialty-arrow">
                    <i className="fas fa-arrow-right"></i>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="recent-activity">
            <h2>{t('nurse.todaySchedule')}</h2>
            <div className="activity-list">
              <div className="activity-item empty">
                <div className="activity-icon">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div className="activity-content">
                  <p>{t('nurse.noScheduledTasks')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NurseDashboard;
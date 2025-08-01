import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import './Dashboard.css';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
            <li className="nav-item">
              <Link to="/admin/users" className="nav-link">
                <i className="fas fa-users"></i>
                {!sidebarCollapsed && <span>{t('admin.userManagement')}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/admin/settings" className="nav-link">
                <i className="fas fa-cog"></i>
                {!sidebarCollapsed && <span>{t('admin.systemSettings')}</span>}
              </Link>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              <i className="fas fa-user-shield"></i>
            </div>
            {!sidebarCollapsed && (
              <div className="user-details">
                <div className="user-name">{user?.firstName} {user?.lastName}</div>
                <div className="user-role">{t('auth.administrator')}</div>
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
              <p>{t('admin.adminPanelDescription')}</p>
            </div>
            <div className="header-right">
              <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Admin Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('admin.totalUsers')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('admin.doctors')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="stat-info">
                <h3>0</h3>
                <p>{t('admin.administrators')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stat-info">
                <h3>15</h3>
                <p>{t('admin.specialties')}</p>
              </div>
            </div>
          </div>

          {/* Admin Quick Actions */}
          <div className="admin-actions">
            <h2>{t('admin.quickActions')}</h2>
            <div className="actions-grid">
              <Link to="/admin" className="action-card">
                <div className="action-icon">
                  <i className="fas fa-users-cog"></i>
                </div>
                <h3>{t('admin.userManagement')}</h3>
                <p>{t('admin.manageUsersDescription')}</p>
              </Link>
              
              <Link to="/admin/settings" className="action-card">
                <div className="action-icon">
                  <i className="fas fa-cog"></i>
                </div>
                <h3>{t('admin.systemSettings')}</h3>
                <p>{t('admin.systemSettingsDescription')}</p>
              </Link>
              
              <Link to="/admin/analytics" className="action-card">
                <div className="action-icon">
                  <i className="fas fa-chart-bar"></i>
                </div>
                <h3>{t('admin.systemAnalytics')}</h3>
                <p>{t('admin.analyticsDescription')}</p>
              </Link>
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

export default AdminDashboard;
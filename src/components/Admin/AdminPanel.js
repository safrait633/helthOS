import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import './AdminPanel.css';

function AdminPanel() {
  const { user, logout, userDatabase } = useAuth();
  const { t } = useLanguage();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    const allUsers = userDatabase.getAllUsers();
    setUsers(allUsers);
  };

  const deleteUser = (userId) => {
    if (window.confirm(t('admin.confirmDelete'))) {
      const result = userDatabase.deleteUser(userId);
      if (result.success) {
        loadUsers(); // Reload users list
      } else {
        alert(result.error);
      }
    }
  };

  const toggleUserRole = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      const result = userDatabase.updateUser(userId, { role: newRole });
      if (result.success) {
        loadUsers(); // Reload users list
      } else {
        alert(result.error);
      }
    }
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const getStats = () => {
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    const specialties = [...new Set(users.map(u => u.specialty).filter(Boolean))].length;
    
    return { totalUsers, adminUsers, regularUsers, specialties };
  };

  const stats = getStats();

  return (
    <div className="admin-panel">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <i className="fas fa-heartbeat"></i>
            {!sidebarCollapsed && <span className="app-title">HealthOS Admin</span>}
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <i className="fas fa-th-large"></i>
                {!sidebarCollapsed && <span>{t('admin.dashboard')}</span>}
              </Link>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                <i className="fas fa-users"></i>
                {!sidebarCollapsed && <span>{t('admin.users')}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="fas fa-chart-bar"></i>
                {!sidebarCollapsed && <span>{t('admin.analytics')}</span>}
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <i className="fas fa-cog"></i>
                {!sidebarCollapsed && <span>{t('admin.settings')}</span>}
              </button>
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
          <button className="logout-btn" onClick={logout} title={t('auth.logout')}>
            <i className="fas fa-sign-out-alt"></i>
            {!sidebarCollapsed && <span>{t('auth.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-content">
            <h1>{t('admin.title')}</h1>
            <p>{t('admin.description')}</p>
          </div>
        </header>

        <div className="admin-content">
          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">
                <i className="fas fa-users"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>{t('admin.totalUsers')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon admins">
                <i className="fas fa-user-shield"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.adminUsers}</h3>
                <p>{t('admin.adminUsers')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon doctors">
                <i className="fas fa-user-md"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.regularUsers}</h3>
                <p>{t('admin.doctors')}</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon specialties">
                <i className="fas fa-stethoscope"></i>
              </div>
              <div className="stat-info">
                <h3>{stats.specialties}</h3>
                <p>{t('admin.specialties')}</p>
              </div>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'users' && (
            <div className="tab-content">
              <div className="section-header">
                <h2>{t('admin.userManagement')}</h2>
                <button className="btn btn-primary" onClick={loadUsers}>
                  <i className="fas fa-sync-alt"></i>
                  {t('admin.refresh')}
                </button>
              </div>
              
              <div className="users-table-container">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>{t('admin.user')}</th>
                      <th>Email</th>
                      <th>{t('auth.specialty')}</th>
                      <th>{t('auth.role')}</th>
                      <th>{t('admin.registrationDate')}</th>
                      <th>{t('admin.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small">
                              <i className={`fas ${user.role === 'admin' ? 'fa-user-shield' : 'fa-user-md'}`}></i>
                            </div>
                            <div>
                              <div className="user-name">{user.firstName} {user.lastName}</div>
                              <div className="user-license">{user.licenseNumber || t('admin.notSpecified')}</div>
                            </div>
                          </div>
                        </td>
                        <td>{user.email}</td>
                        <td>{user.specialty || t('admin.notSpecified')}</td>
                        <td>
                          <span className={`role-badge ${user.role}`}>
                            {user.role === 'admin' ? t('auth.administrator') : t('auth.doctor')}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
                        <td>
                          <div className="action-buttons">
                            <button 
                              className="btn btn-sm btn-info"
                              onClick={() => viewUserDetails(user)}
                              title={t('admin.view')}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-warning"
                              onClick={() => toggleUserRole(user.id)}
                              title={t('admin.changeRole')}
                            >
                              <i className="fas fa-user-cog"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => deleteUser(user.id)}
                              title={t('admin.delete')}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {users.length === 0 && (
                  <div className="empty-state">
                    <i className="fas fa-users"></i>
                    <h3>{t('admin.noUsersFound')}</h3>
                    <p>{t('admin.noUsersDescription')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="tab-content">
              <h2>{t('admin.systemAnalytics')}</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>{t('admin.roleDistribution')}</h3>
                  <div className="chart-placeholder">
                    <div className="chart-item">
                      <span className="chart-label">{t('admin.doctors')}</span>
                      <div className="chart-bar">
                        <div className="chart-fill" style={{width: `${(stats.regularUsers / stats.totalUsers) * 100}%`}}></div>
                      </div>
                      <span className="chart-value">{stats.regularUsers}</span>
                    </div>
                    <div className="chart-item">
                      <span className="chart-label">{t('admin.administrators')}</span>
                      <div className="chart-bar">
                        <div className="chart-fill admin" style={{width: `${(stats.adminUsers / stats.totalUsers) * 100}%`}}></div>
                      </div>
                      <span className="chart-value">{stats.adminUsers}</span>
                    </div>
                  </div>
                </div>
                
                <div className="analytics-card">
                  <h3>{t('admin.systemActivity')}</h3>
                  <div className="activity-stats">
                    <div className="activity-item">
                      <i className="fas fa-clipboard-list"></i>
                      <span>{t('admin.completedExaminations')}: 0</span>
                    </div>
                    <div className="activity-item">
                      <i className="fas fa-file-medical"></i>
                      <span>{t('admin.createdReports')}: 0</span>
                    </div>
                    <div className="activity-item">
                      <i className="fas fa-calendar"></i>
                      <span>{t('admin.activeSessions')}: {users.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="tab-content">
              <h2>{t('admin.systemSettings')}</h2>
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>{t('admin.generalSettings')}</h3>
                  <div className="setting-item">
                    <label>{t('admin.systemName')}</label>
                    <input type="text" value="HealthOS" readOnly />
                  </div>
                  <div className="setting-item">
                    <label>{t('admin.version')}</label>
                    <input type="text" value="1.0.0" readOnly />
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>{t('admin.security')}</h3>
                  <div className="setting-item">
                    <label>{t('admin.minPasswordLength')}</label>
                    <input type="number" value="6" readOnly />
                  </div>
                  <div className="setting-item">
                    <label>{t('admin.sessionTime')}</label>
                    <input type="number" value="60" readOnly />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowUserModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{t('admin.userDetails')}</h3>
              <button className="modal-close" onClick={() => setShowUserModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="user-detail-grid">
                <div className="detail-item">
                  <label>{t('auth.firstName')}:</label>
                  <span>{selectedUser.firstName}</span>
                </div>
                <div className="detail-item">
                  <label>{t('auth.lastName')}:</label>
                  <span>{selectedUser.lastName}</span>
                </div>
                <div className="detail-item">
                  <label>Email:</label>
                  <span>{selectedUser.email}</span>
                </div>
                <div className="detail-item">
                  <label>{t('auth.role')}:</label>
                  <span className={`role-badge ${selectedUser.role}`}>
                    {selectedUser.role === 'admin' ? t('auth.administrator') : t('auth.doctor')}
                  </span>
                </div>
                <div className="detail-item">
                  <label>{t('auth.specialty')}:</label>
                  <span>{selectedUser.specialty || t('admin.notSpecified')}</span>
                </div>
                <div className="detail-item">
                  <label>{t('auth.licenseNumber')}:</label>
                  <span>{selectedUser.licenseNumber || t('admin.notSpecified')}</span>
                </div>
                <div className="detail-item">
                  <label>{t('admin.registrationDate')}:</label>
                  <span>{new Date(selectedUser.createdAt).toLocaleString('ru-RU')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
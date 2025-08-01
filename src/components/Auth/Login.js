import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import ParticleBackground from './ParticleBackground';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        // Redirect based on user role
        const userRole = result.user?.role;
        switch (userRole) {
          case 'admin':
            navigate('/admin-dashboard');
            break;
          case 'nurse':
            navigate('/nurse-dashboard');
            break;
          case 'patient':
            navigate('/patient-dashboard');
            break;
          case 'doctor':
          default:
            navigate('/dashboard');
            break;
        }
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(t('auth.loginError'));
    }

    setLoading(false);
  };

  const fillDemoCredentials = (email, password) => {
    setFormData({
      email: email,
      password: password
    });
  };

  return (
    <div className="auth-container">
      <div className="register-page">
        <div className="auth-form-container">
          <div className="auth-header">
            <div className="auth-header-top">
              <Link to="/" className="back-link">
                <i className="fas fa-arrow-left"></i>
                {t('auth.backToHome')}
              </Link>
              <button 
                className="theme-toggle" 
                onClick={toggleTheme}
                title={isDarkMode ? t('theme.switchToLight') : t('theme.switchToDark')}
              >
                <i className={isDarkMode ? 'fas fa-sun' : 'fas fa-moon'}></i>
              </button>
            </div>
            <div className="auth-logo">
              <i className="fas fa-heartbeat"></i>
              <h1>HealthOS</h1>
            </div>
            <h2>{t('auth.login')}</h2>
            <p>{t('auth.welcomeBack')}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">
                <i className="fas fa-envelope"></i>
                {t('auth.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t('auth.enterEmail')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">
                <i className="fas fa-lock"></i>
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder={t('auth.enterPassword')}
              />
            </div>

            <button 
              type="submit" 
              className="auth-button"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t('auth.loggingIn')}
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  {t('auth.login')}
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {t('auth.noAccount')} 
              <Link to="/register">{t('auth.register')}</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="demo-credentials">
            <h4>{t('auth.demoAccounts')}</h4>
            <div className="demo-account" onClick={() => fillDemoCredentials('admin@healthos.com', 'admin123')}>
              <strong>{t('auth.administrator')}:</strong>
              <br />{t('auth.email')}: admin@healthos.com
              <br />{t('auth.password')}: admin123
            </div>
            <div className="demo-account" onClick={() => fillDemoCredentials('doctor@healthos.com', 'doctor123')}>
              <strong>{t('auth.doctor')}:</strong>
              <br />{t('auth.email')}: doctor@healthos.com
              <br />{t('auth.password')}: doctor123
            </div>
            <div className="demo-account" onClick={() => fillDemoCredentials('nurse@healthos.com', 'nurse123')}>
              <strong>{t('auth.nurse')}:</strong>
              <br />{t('auth.email')}: nurse@healthos.com
              <br />{t('auth.password')}: nurse123
            </div>
            <div className="demo-account" onClick={() => fillDemoCredentials('patient@healthos.com', 'patient123')}>
              <strong>{t('auth.patient')}:</strong>
              <br />{t('auth.email')}: patient@healthos.com
              <br />{t('auth.password')}: patient123
            </div>
          </div>
        </div>
        
        <div className="auth-promo-container modern-banner desktop-only">
          <ParticleBackground />
          <div className="modern-banner-content">
            <h2 className="glowing-text">BETA</h2>
            <div className="modern-banner-logo">
              <i className="fas fa-heartbeat"></i>
              <span>HealthOS</span>
            </div>
            <h2>{t('auth.modernPromoTitle')}</h2>
            <p>{t('auth.modernPromoText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import ParticleBackground from './ParticleBackground';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    specialty: '',
    licenseNumber: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const specialties = [
    { key: 'cardiology', label: t('specialties.cardiology') },
    { key: 'neurology', label: t('specialties.neurology') },
    { key: 'gastroenterology', label: t('specialties.gastroenterology') },
    { key: 'dermatology', label: t('specialties.dermatology') },
    { key: 'endocrinology', label: t('specialties.endocrinology') },
    { key: 'hematology', label: t('specialties.hematology') },
    { key: 'infectiousDiseases', label: t('specialties.infectiousDiseases') },
    { key: 'musculoskeletal', label: t('specialties.musculoskeletal') },
    { key: 'ophthalmology', label: t('specialties.ophthalmology') },
    { key: 'otolaryngology', label: t('specialties.otolaryngology') },
    { key: 'pneumology', label: t('specialties.pneumology') },
    { key: 'psychiatry', label: t('specialties.psychiatry') },
    { key: 'rheumatology', label: t('specialties.rheumatology') },
    { key: 'urology', label: t('specialties.urology') },
    { key: 'geriatrics', label: t('specialties.geriatrics') }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (formData.password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(t('auth.registerError'));
    }

    setLoading(false);
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
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
            >
              <i className={`fas ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
            </button>
          </div>
          <div className="auth-logo">
            <i className="fas fa-heartbeat"></i>
            <h1>HealthOS</h1>
          </div>
          <h2>{t('auth.register')}</h2>
          <p>{t('auth.registerSubtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="error-message">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">
                <i className="fas fa-user"></i>
                {t('auth.firstName')}
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder={t('auth.enterFirstName')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">
                <i className="fas fa-user"></i>
                {t('auth.lastName')}
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder={t('auth.enterLastName')}
              />
            </div>
          </div>

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

          <div className="form-row">
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
                placeholder={t('auth.passwordMinLength')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">
                <i className="fas fa-lock"></i>
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder={t('auth.confirmPasswordPlaceholder')}
              />
            </div>
          </div>

            <div className="form-group">
              <label htmlFor="role">
                <i className="fas fa-user-tag"></i>
                {t('auth.role')}
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="user">{t('auth.doctor')}</option>
                <option value="admin">{t('auth.administrator')}</option>
                <option value="nurse">{t('auth.nurse')}</option>
                <option value="patient">{t('auth.patient')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialty">
                <i className="fas fa-stethoscope"></i>
                {t('auth.specialty')}
              </label>
              <select
                id="specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                required
              >
                <option value="">{t('auth.selectSpecialty')}</option>
                {specialties.map(specialty => (
                  <option key={specialty.key} value={specialty.label}>
                    {specialty.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="licenseNumber">
                <i className="fas fa-id-card"></i>
                {t('auth.licenseNumber')}
              </label>
              <input
                type="text"
                id="licenseNumber"
                name="licenseNumber"
                value={formData.licenseNumber}
                onChange={handleChange}
                placeholder={t('auth.enterLicenseNumber')}
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
                  {t('auth.registering')}
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus"></i>
                  {t('auth.register')}
                </>
              )}
            </button>
        </form>

        <div className="auth-footer">
          <p>
            {t('auth.hasAccount')} 
            <Link to="/login">{t('auth.login')}</Link>
          </p>
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

export default Register;
import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import './LandingPage.css';

function LandingPage() {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  return (
    <div className={`landing-page ${theme}`}>
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-heartbeat"></i>
              <span>HealthOS</span>
            </div>
            <nav className="nav-links">
              <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
                <i className={`fas ${theme === 'light' ? 'fa-moon' : 'fa-sun'}`}></i>
              </button>
              <Link to="/login" className="btn btn-outline">{t('auth.login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('auth.register')}</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>{t('landing.title')} <span>HealthOS</span></h1>
              <p className="hero-description">
                {t('landing.description')}
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary btn-large">
                  {t('landing.getStarted')}
                </Link>
                <Link to="/login" className="btn btn-outline btn-large">
                  {t('landing.hasAccount')}
                </Link>
              </div>
            </div>
            <div className="hero-image">
              <img src="/img/hero-image.svg" alt="HealthOS platform illustration" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2>{t('landing.features')}</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-stethoscope"></i>
              </div>
              <h3>{t('landing.specialtiesCount')}</h3>
              <p>{t('landing.specialtiesDescription')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3>{t('landing.analytics')}</h3>
              <p>{t('landing.analyticsDescription')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>{t('landing.patientManagement')}</h3>
              <p>{t('landing.patientManagementDescription')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>{t('landing.dataSecurity')}</h3>
              <p>{t('landing.dataSecurityDescription')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="specialties">
        <div className="container">
          <h2>{t('landing.medicalSpecialties')}</h2>
          <div className="specialties-grid">
            <div className="specialty-card">
              <i className="fas fa-heartbeat"></i>
              <span>{t('specialties.cardiology')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-brain"></i>
              <span>{t('specialties.neurology')}</span>
            </div>
            <div className="specialty-card">
              <img src="/img/gastroenterology.svg" alt="Gastroenterology icon" className="specialty-icon" />
              <span>{t('specialties.gastroenterology')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-eye"></i>
              <span>{t('specialties.ophthalmology')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-lungs"></i>
              <span>{t('specialties.pneumology')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-bone"></i>
              <span>{t('specialties.musculoskeletal')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-user-md"></i>
              <span>{t('specialties.dermatology')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-pills"></i>
              <span>{t('specialties.endocrinology')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-kidneys"></i>
              <span>{t('specialties.urology')}</span>
            </div>
            <div className="specialty-card">
              <i className="fas fa-head-side-virus"></i>
              <span>{t('specialties.psychiatry')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <i className="fas fa-heartbeat"></i>
              <span>HealthOS</span>
            </div>
            <p>{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
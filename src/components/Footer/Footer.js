import React from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import './Footer.css';

function Footer() {
  const { t } = useLanguage();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  
  const isSpecialtyPage = location.pathname.startsWith('/specialty/');

  return (
    <footer className="app-footer">
      {!isSpecialtyPage && (
        <div className="footer-content">
          <div className="footer-section">
            <h4>HealthOS</h4>
            <p>{t('footer.description')}</p>
          </div>
          
          <div className="footer-section">
            <h5>{t('footer.quickLinks')}</h5>
            <ul>
              <li><a href="/">{t('landing.title')}</a></li>
              <li><a href="/login">{t('auth.login')}</a></li>
              <li><a href="/register">{t('auth.register')}</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h5>{t('footer.contact')}</h5>
            <p>Email: info@healthos.com</p>
            <p>{t('footer.phone')}: +34 900 123 456</p>
          </div>
        </div>
      )}
      
      <div className="footer-bottom">
        <div className="copyright">
          <p>
            © {currentYear} HealthOS. {t('footer.copyright')} 
            <span className="separator">|</span> 
            {t('footer.allRightsReserved')}
          </p>
        </div>
        
        <div className="footer-links">
          <a href="#">{t('footer.privacy')}</a>
          <span className="separator">|</span>
          <a href="#">{t('footer.terms')}</a>
          <span className="separator">|</span>
          <a href="#">{t('footer.support')}</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
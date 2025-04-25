import React from 'react';
import type { Language } from '../interfaces'; // Import Language type
import styles from '../styles/Home.module.css'; // Assuming styles are here

// Define props interface
interface FooterProps {
  currentLanguage: Language;
  onDownloadJson: () => void; // Function prop type
}

const Footer: React.FC<FooterProps> = ({ currentLanguage, onDownloadJson }) => {
  return (
    <footer className={styles.footer}>
      <div className="container footer-content">
        <div className={styles.footerLinks}>
          <a
             href="https://github.com/ta0a2000t/bwsalitech" // Update link if repo changes
             className={styles.footerLink}
             target="_blank"
             rel="noopener noreferrer"
          >
            <i className="fab fa-github"></i> GitHub
          </a>
          {/* Use a button element for semantic click action */}
          <button onClick={onDownloadJson} className={styles.footerLinkButton}>
            <i className="fas fa-download"></i>{' '}
            {currentLanguage === 'ar' ? 'تنزيل البيانات' : 'Download Data'}
          </button>
        </div>
        <p>
          {currentLanguage === 'ar'
            ? 'مشروع مفتوح المصدر - ساهم في بوصلة➝ك!'
            : 'Open Source Project - Contribute to Bawsalatuk!'}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
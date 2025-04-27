// File: bwsalitech-nextjs/components/Footer.tsx
import React from 'react';
import type { Language } from '../interfaces'; // Import Language type
import styles from '../styles/Home.module.css'; // Assuming styles are here

// Define props interface
interface FooterProps {
  currentLanguage: Language;
}

// --- Define the constant link for the Google Form ---
const GOOGLE_FORM_LINK = "https://forms.gle/Hrz4Z4FjqeMU1fdFA";

const Footer: React.FC<FooterProps> = ({ currentLanguage }) => {
  // --- Define contribution link text based on language ---
  const addCompanyText = currentLanguage === 'ar' ? 'أضف شركة' : 'Add Company';

  // --- Define the non-profit description based on language ---
  const nonProfitDescription = currentLanguage === 'ar'
    ? 'مشروع غير ربحي، يهدف لدعم الثقافة التقنية في السعودية والمنطقة المحيطة.' // Added period for consistency
    : 'A non-profit project aimed at supporting the tech culture in Saudi Arabia and the surrounding region.';

  return (
    <footer className={styles.footer}>
      {/* Ensure container class is applied correctly if needed globally */}
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.footerLinks}>
          {/* GitHub Link */}
          <a
             href="https://github.com/ta0a2000t/bwsalitech"
             className={styles.footerLink}
             target="_blank"
             rel="noopener noreferrer"
             title="GitHub Repository" // Added title for accessibility
          >
            <i className="fab fa-github"></i> مصدر الكود
          </a>

          {/* --- Add Company Link --- */}
          <a
             href={GOOGLE_FORM_LINK} // Link directly to the Google Form
             className={styles.footerLink} // Reuse existing link style
             target="_blank" // Open in new tab
             rel="noopener noreferrer"
             title={addCompanyText} // Accessibility title
          >
            <i className="fas fa-plus-circle"></i> {/* Icon suggesting addition */}
            {' '}{addCompanyText}
          </a>
          {/* --- End of Add Company Link --- */}

        </div>

        {/* --- ADDED the non-profit description paragraph --- */}
        {/* Using the class name from Home.module.css if defined, or add one here */}
        <p className={styles.footerDescription}>
            {nonProfitDescription}
        </p>

        {/* Existing "Open Source" paragraph */}
        <p>
          {currentLanguage === 'ar'
            ? 'مشروع مفتوح المصدر - ساهم في بوصلة➝ك!'
            : 'Open Source Project - Contribute to Bawsalatuk!'}
        </p>

        {/* Optional: Add a link to the detailed contributing guide for advanced users */}
        {/*
        <p style={{ fontSize: '0.8em', opacity: 0.7 }}>
          (<a href="https://github.com/ta0a2000t/bwsalitech/blob/main/CONTRIBUTING.md" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
            {currentLanguage === 'ar' ? 'طرق مساهمة أخرى' : 'Other ways to contribute'}
          </a>)
        </p>
        */}
      </div>
    </footer>
  );
};

export default Footer;
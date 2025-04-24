import Link from 'next/link';
import React from 'react';
import type { Language } from '../interfaces'; // Import Language type
import styles from '../styles/Home.module.css'; // Assuming styles are here

// Define props interface
interface HeaderProps {
  currentLanguage: Language;
  onToggleLanguage: () => void; // Function prop type
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, onToggleLanguage }) => {
  return (
    <header className={styles.header}>
      <div className="container header-content">
        <Link href="/" className={styles.logo}>
          بوصلةك
        </Link>
        <button
          className={styles.languageToggle}
          onClick={onToggleLanguage}
          aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
         >
          {currentLanguage === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>
    </header>
  );
};

export default Header;
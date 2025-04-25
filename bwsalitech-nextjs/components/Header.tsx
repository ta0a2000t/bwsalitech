// File: bwsalitech-nextjs/components/Header.tsx
import Link from 'next/link';
import React from 'react';
import type { Language } from '../interfaces';
// Ensure the correct CSS module is imported
import styles from '../styles/Home.module.css';

interface HeaderProps {
  currentLanguage: Language;
  onToggleLanguage: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, onToggleLanguage }) => {
  return (
    // Apply the main header style
    <header className={styles.header}>
      {/* Apply the specific header content style from the module */}
      <div className={styles.headerContent}> {/* MODIFIED: Use styles.headerContent */}

        {/* Logo Link (will be ordered to the right) */}
        <Link href="/" className={styles.logo}>
          بوصلةك
        </Link>

        {/* Language Toggle Button (will be ordered to the left) */}
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
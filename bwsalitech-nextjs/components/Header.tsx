// File: bwsalitech-nextjs/components/Header.tsx
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
    // Apply the main header style from the module
    <header className={styles.header}>
      {/*
         This div uses BOTH a global 'container' class (from globals.css)
         AND a 'header-content' class defined within Home.module.css.
         While this works, mixing global and module classes like this
         can sometimes be confusing. Often, you'd nest the module styles
         or handle layout purely within the module if possible.
         e.g., <div className={styles.headerContentWrapper}>
                  <div className={styles.headerContentInner}>...</div>
               </div>
         But the current structure is functional.
      */}
      <div className="container header-content"> {/* Uses global 'container' and module 'header-content' */}
        <Link href="/" className={styles.logo}>
          بوصلةك
        </Link>
        <button
          className={styles.languageToggle} // Style comes from Home.module.css
          onClick={onToggleLanguage}
          aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
         >
          {/* This logic correctly shows 'English' when Arabic is active, and 'العربية' when English is active */}
          {currentLanguage === 'ar' ? 'English' : 'العربية'}
        </button>
      </div>
    </header>
  );
};

export default Header;
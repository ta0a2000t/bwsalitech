// File: bwsalitech-nextjs/components/Header.tsx
// Keep this structure: Button first, then Logo
import Link from 'next/link';
import React from 'react';
import type { Language } from '../interfaces';
import styles from '../styles/Home.module.css';

interface HeaderProps {
  currentLanguage: Language;
  onToggleLanguage: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentLanguage, onToggleLanguage }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}> {/* Use module style */}

        {/* Language Toggle Button */}
        <button
          className={styles.languageToggle}
          onClick={onToggleLanguage}
          aria-label={currentLanguage === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
         >
          {currentLanguage === 'ar' ? 'English🇬🇧' : '🇸🇦العربية'}
        </button>

        {/* Logo Link */}
        <Link href="/" className={styles.logo}>
          بوصلة➝ك
        </Link>

      </div>
    </header>
  );
};

export default Header;
import Image from 'next/image';
import React from 'react';
import type { Company, CompanyLinks, Language } from '../interfaces';
import styles from '../styles/CompanyCard.module.css';

// --- Props Interface ---
interface CompanyCardProps {
  company: Company;
  language: Language;
}

// --- Helper Function (Typed) ---
const renderSocialLinks = (links: CompanyLinks | undefined, language: Language): React.ReactNode => {
    if (!links) return null;

    const socialIcons: { [key in keyof CompanyLinks]?: string } = { // Type the keys
      twitter: 'fab fa-twitter',
      linkedin: 'fab fa-linkedin',
      facebook: 'fab fa-facebook',
      instagram: 'fab fa-instagram',
      github: 'fab fa-github',
      blog: 'fas fa-blog',
    };

    // Use Object.entries and filter/map
    return Object.entries(links)
      .filter(([platform, url]) => socialIcons[platform as keyof CompanyLinks] && url) // Ensure platform is known and URL exists
      .map(([platform, url]) => (
        <a
          key={platform}
          href={url}
          className={styles.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          title={platform}
          aria-label={`${language === 'ar' ? 'زيارة' : 'Visit'} ${platform}`}
        >
          <i className={socialIcons[platform as keyof CompanyLinks]}></i>
        </a>
      ));
};


// --- Component ---
const CompanyCard: React.FC<CompanyCardProps> = ({ company, language }) => {
  const name = language === 'ar' ? company.name_ar : company.name_en;
  const description = language === 'ar'
    ? company.description_ar
    : (company.description_en || company.description_ar);

  // ← new fallback logic
  const hostname = new URL(company.website).hostname;
  const logoSrc =
    company.logo_url ||
    `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}&sz=64`;

  return (
    <div className={styles.companyCard} data-id={company.id}>
      <div className={styles.companyInfo}>
        {/* Header */}
        <div className={styles.companyHeader}>
          <div className={styles.logoWrapper}>
            <Image
              src={logoSrc}
              alt={`${name} logo`}
              width={40}
              height={40}
              className={styles.companyHeaderLogo}
            />
          </div>
          <h3 className={styles.companyName}>{name}</h3>
        </div>

        {/* Description */}
        <p className={styles.companyDesc}>{description}</p>

        {/* Meta Info */}
        <div className={styles.companyMeta}>
          <div>
            <i className="fas fa-map-marker-alt"></i> {company.headquarters || '-'}
          </div>
          <div>
            <i className="fas fa-calendar-alt"></i> {company.founding_year || '-'}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.companyTags}>
          {company.tags.map(tag => (
            <span key={tag} className={styles.companyTag}>
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className={styles.companyActions}>
          <a
            href={company.website}
            className={`${styles.btn} ${styles.btnPrimary}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
          </a>
          {company.links?.careers && (
            <a
              href={company.links.careers}
              className={`${styles.btn} ${styles.btnSecondary}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {language === 'ar' ? 'الوظائف' : 'Careers'}
            </a>
          )}
        </div>

        {/* Social Links */}
        <div className={styles.socialLinksContainer}>
            {renderSocialLinks(company.links, language)}
        </div>

      </div>
    </div>
  );
};

export default CompanyCard;
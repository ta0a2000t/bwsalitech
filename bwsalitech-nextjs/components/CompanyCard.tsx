// bwsalitech-nextjs/components/CompanyCard.tsx
import Image from 'next/image';
import React from 'react';
import type { Company, CompanyLinks, Language } from '../interfaces';
// Import the specific CSS module for this component
import styles from '../styles/CompanyCard.module.css';

interface CompanyCardProps {
  company: Company;
  language: Language;
}

// Helper function to render social links
const renderSocialLinks = (links: CompanyLinks | undefined, language: Language): React.ReactNode => {
    if (!links) return null;
    // Use Font Awesome classes as defined in _document.tsx
    const socialIcons: { [key in keyof CompanyLinks]?: string } = {
      twitter: 'fab',
      linkedin: 'fab fa-linkedin',
      facebook: 'fab fa-facebook',
      instagram: 'fab fa-instagram',
      github: 'fab fa-github',
      blog: 'fas fa-blog',
    };
    return Object.entries(links)
      .filter(([platform, url]) => socialIcons[platform as keyof CompanyLinks] && url)
      .map(([platform, url]) => (
        <a
            key={platform}
            href={url as string} // Ensure URL is treated as string
            className={styles.socialLink}
            target="_blank"
            rel="noopener noreferrer"
            title={platform.charAt(0).toUpperCase() + platform.slice(1)} // Capitalize title
            aria-label={`${language === 'ar' ? 'زيارة صفحة' : 'Visit'} ${platform}`}
        >
          <i className={socialIcons[platform as keyof CompanyLinks]}>{platform === 'twitter' ? '𝕏' : null}</i>
        </a>
      ));
};

// Component Logic
const CompanyCard: React.FC<CompanyCardProps> = ({ company, language }) => {
  // Basic localized fields
  const name = language === 'ar' ? company.name_ar : company.name_en;
  const description = language === 'ar'
    ? company.description_ar
    : (company.description_en || company.description_ar); // Fallback

  // Get localized industry/subindustry from the tuple
  const industryName = language === 'ar' ? company.industry[1] : company.industry[0];
  const subIndustryName = language === 'ar' ? company.subindustry[1] : company.subindustry[0];

  // Logic for logo (fallback to favicon service)
  const hostname = new URL(company.website).hostname;
  const logoSrc = company.logo_path || `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}&sz=64`;

  // Render JSX
  return (
    <div className={styles.companyCard} data-id={company.id}>
      <div className={styles.companyInfo}>
        {/* Header */}
        <div className={styles.companyHeader}>
             <div className={styles.logoWrapper}>
                {/* Use Next.js Image component */}
                <Image
                    src={logoSrc}
                    alt={`${name} logo`}
                    width={40} // Intrinsic size for layout calculation
                    height={40}
                    className={styles.companyHeaderLogo} // Apply style to the Image component itself
                    unoptimized={logoSrc.includes('googleusercontent.com')} // Don't optimize favicons
                    onError={(e) => { // Fallback if image fails
                        // Optionally hide the wrapper or show placeholder
                        e.currentTarget.style.display = 'none';
                        // e.currentTarget.parentElement?.classList.add(styles.imageError); // Add class to wrapper if needed
                    }}
                />
            </div>
            <h3 className={styles.companyName}>{name}</h3>
        </div>

        {/* Description */}
        <p className={styles.companyDesc}>{description}</p>

        {/* --- Structure matches user's CSS expectations --- */}
        <div className={styles.companyIndustryInfo}>
          <span className={styles.industryLabel}>{language === 'ar' ? 'الصناعة:' : 'Industry:'}</span>
          <span>{industryName}</span>
          <span className={styles.divider}>|</span> {/* Divider as expected by CSS */}
          <span className={styles.subIndustryLabel}>{language === 'ar' ? 'الفرعية:' : 'Subindustry:'}</span>
          <span>{subIndustryName}</span>
        </div>
        {/* --- End Structure --- */}


        {/* Meta Info (Headquarters & Founding Year) */}
        <div className={styles.companyMeta}>
            {/* Headquarters */}
             <span> {/* Wrap each meta item for flex gap */}
                <i className="fas fa-map-marker-alt"></i> {/* Font Awesome icon */}
                {company.headquarters ? company.headquarters : '-'}
             </span>
            {/* Founding Year */}
             <span> {/* Wrap each meta item for flex gap */}
                <i className="fas fa-calendar-alt"></i> {/* Font Awesome icon */}
                {company.founding_year ? company.founding_year : '-'}
             </span>
        </div>

        {/* Tags */}
        <div className={styles.companyTags}>
          {(company.tags || []).map(tag => (
            <span key={tag} className={styles.companyTag}>
              {tag}
            </span>
          ))}
        </div>

        {/* Action Buttons - Placed within companyInfo to allow flex-grow on description */}
        <div className={styles.companyActions}>
            <a
                href={company.website}
                className={`${styles.btn} ${styles.btnPrimary}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                {language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
            </a>
            {/* Conditionally render Careers button */}
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

         {/* Social Links - Placed within companyInfo */}
         <div className={styles.socialLinksContainer}>
             {renderSocialLinks(company.links, language)}
         </div>

      </div> {/* End companyInfo */}
    </div> // End companyCard
  );
};

export default CompanyCard;
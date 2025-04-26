// bwsalitech-nextjs/components/CompanyCard.tsx
import Image from 'next/image';
import React from 'react';
// Import the updated Company interface
import type { Company, CompanyLinks, Language } from '../interfaces';
import styles from '../styles/CompanyCard.module.css';

// Props Interface remains the same
interface CompanyCardProps {
  company: Company; // Expects a validated Company object
  language: Language;
}

// Helper function to render social links (no changes needed)
const renderSocialLinks = (links: CompanyLinks | undefined, language: Language): React.ReactNode => {
    if (!links) return null;
    const socialIcons: { [key in keyof CompanyLinks]?: string } = {
      twitter: 'fab fa-twitter', linkedin: 'fab fa-linkedin', facebook: 'fab fa-facebook',
      instagram: 'fab fa-instagram', github: 'fab fa-github', blog: 'fas fa-blog',
    };
    return Object.entries(links)
      .filter(([platform, url]) => socialIcons[platform as keyof CompanyLinks] && url)
      .map(([platform, url]) => (
        <a key={platform} href={url} className={styles.socialLink} target="_blank" rel="noopener noreferrer" title={platform} aria-label={`${language === 'ar' ? 'زيارة' : 'Visit'} ${platform}`}>
          <i className={socialIcons[platform as keyof CompanyLinks]}></i>
        </a>
      ));
};


// Component Logic
const CompanyCard: React.FC<CompanyCardProps> = ({ company, language }) => {
  // Basic localized fields
  const name = language === 'ar' ? company.name_ar : company.name_en;
  const description = language === 'ar'
    ? company.description_ar
    : (company.description_en || company.description_ar); // Fallback to Arabic description if English is missing

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
            <Image
              src={logoSrc}
              alt={`${name} logo`}
              width={40} // Fixed size for consistency
              height={40}
              className={styles.companyHeaderLogo}
              unoptimized={logoSrc.includes('googleusercontent.com')} // Avoid optimizing external favicons
              onError={(e) => { // Optional: Handle broken favicon links
                e.currentTarget.style.display = 'none'; // Hide broken image icon
              }}
            />
          </div>
          <h3 className={styles.companyName}>{name}</h3>
        </div>

        {/* Description */}
        <p className={styles.companyDesc}>{description}</p>

        {/* Industry & Subindustry */}
        <div className={styles.companyIndustryInfo}>
          <span className={styles.industryLabel}>{language === 'ar' ? 'الصناعة:' : 'Industry:'}</span> {industryName}
          <span className={styles.divider}>|</span>
          <span className={styles.subIndustryLabel}>{language === 'ar' ? 'الفرعية:' : 'Subindustry:'}</span> {subIndustryName}
        </div>

        {/* Meta Info (Headquarters & Founding Year) */}
        <div className={styles.companyMeta}>
          <div>
             {/* Use conditional rendering for potentially missing HQ */}
            {company.headquarters ? (
                <><i className="fas fa-map-marker-alt"></i> {company.headquarters}</>
            ) : (
                 <><i className="fas fa-map-marker-alt"></i> {'-'}</> // Placeholder if missing
            )}
          </div>
          <div>
             {/* Use conditional rendering for potentially missing year */}
             {company.founding_year ? (
                 <><i className="fas fa-calendar-alt"></i> {company.founding_year}</>
             ) : (
                  <><i className="fas fa-calendar-alt"></i> {'-'}</> // Placeholder if missing
             )}
          </div>
        </div>

        {/* Tags */}
        <div className={styles.companyTags}>
          {/* Ensure tags is always an array before mapping */}
          {(company.tags || []).map(tag => (
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
            rel="noopener noreferrer" // Important for security/SEO
          >
            {language === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
          </a>
          {/* Conditionally render Careers button only if link exists */}
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
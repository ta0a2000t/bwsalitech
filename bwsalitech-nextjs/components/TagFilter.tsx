import React from 'react';
import type { Language } from '../interfaces';
import styles from '../styles/Home.module.css'; // Assuming styles are here

// Define props interface
interface TagFilterProps {
  tags: string[];
  activeFilters: Set<string>;
  onToggleFilter: (tag: string) => void; // Function prop type
  language: Language;
}

const TagFilter: React.FC<TagFilterProps> = ({ tags, activeFilters, onToggleFilter, language }) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <div className={styles.tagFilters}>
      {tags.map(tag => {
        const isActive = activeFilters.has(tag);
        return (
          <button
            key={tag}
            className={`${styles.tag} ${isActive ? styles.active : ''}`} // Use styles.active
            onClick={() => onToggleFilter(tag)}
            aria-pressed={isActive} // Correct accessibility attribute
            aria-label={`${language === 'ar' ? 'تصفية حسب' : 'Filter by'} ${tag}`}
          >
            {tag}
          </button>
        );
      })}
    </div>
  );
};

export default TagFilter;
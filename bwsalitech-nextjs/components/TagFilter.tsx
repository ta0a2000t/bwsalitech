import React, { useState, useMemo } from 'react';
import type { Language } from '../interfaces';
import styles from '../styles/Home.module.css';

// Define the structure for tags with counts
interface TagWithCount {
  tag: string;
  count: number;
}

// Define props interface - Updated
interface TagFilterProps {
  tagsWithCounts: TagWithCount[];
  activeFilters: Set<string>;
  onToggleFilter: (tag: string) => void;
  onClearFilters: () => void; // New prop for clearing
  language: Language;
}

const NUM_TOP_TAGS = 5; // How many tags to show before collapsing into "Other"

const TagFilter: React.FC<TagFilterProps> = ({
  tagsWithCounts,
  activeFilters,
  onToggleFilter,
  onClearFilters, // Destructure new prop
  language,
}) => {
  const [isOtherExpanded, setIsOtherExpanded] = useState(false);

  // Memoize the split tags to avoid recalculating on every render
  const { topTags, otherTags, otherCount } = useMemo(() => {
    const top = tagsWithCounts.slice(0, NUM_TOP_TAGS);
    const other = tagsWithCounts.slice(NUM_TOP_TAGS);
    const count = other.reduce((sum, current) => sum + current.count, 0);
    return { topTags: top, otherTags: other, otherCount: count };
  }, [tagsWithCounts]); // Recalculate only when tagsWithCounts changes

  if (!tagsWithCounts || tagsWithCounts.length === 0) {
    // Optionally, still show "Clear All" if filters are active but no tags match
    if (activeFilters.size > 0) {
        return (
          <div className={styles.tagFilters}>
            <button
              className={`${styles.tag} ${styles.clearButton}`}
              onClick={onClearFilters}
              aria-label={language === 'ar' ? 'مسح كل المرشحات' : 'Clear all filters'}
            >
              <i className="fas fa-times"></i> {language === 'ar' ? 'مسح الكل' : 'Clear All'}
            </button>
          </div>
        );
    }
    return null; // Return null if no tags and no active filters
  }


  const renderTagButton = (item: TagWithCount) => {
      const isActive = activeFilters.has(item.tag);
      return (
          <button
              key={item.tag}
              className={`${styles.tag} ${isActive ? styles.active : ''}`}
              onClick={() => onToggleFilter(item.tag)}
              aria-pressed={isActive}
              aria-label={`${language === 'ar' ? 'تصفية حسب' : 'Filter by'} ${item.tag} (${item.count} ${language === 'ar' ? 'شركة' : 'companies'})`}
          >
              {item.tag} ({item.count})
          </button>
      );
  };


  return (
    <div className={styles.tagFilters}>
      {/* "Clear All" Button - Show only if filters are active */}
      {activeFilters.size > 0 && (
        <button
          className={`${styles.tag} ${styles.clearButton}`} // Use tag style + specific clear style
          onClick={onClearFilters}
          aria-label={language === 'ar' ? 'مسح كل المرشحات' : 'Clear all filters'}
        >
          {/* Using Font Awesome icon */}
          <i className="fas fa-times"></i> {language === 'ar' ? 'مسح الكل' : 'Clear All'}
        </button>
      )}

      {/* Render Top N Tags */}
      {topTags.map(renderTagButton)}

      {/* Render Expandable "Other" Button if applicable */}
      {otherTags.length > 0 && (
        <button
          className={`${styles.tag} ${styles.otherToggle} ${isOtherExpanded ? styles.active : ''}`}
          onClick={() => setIsOtherExpanded(!isOtherExpanded)}
          aria-expanded={isOtherExpanded}
          aria-controls="other-tags-container" // Link button to the container it controls
        >
          {language === 'ar' ? 'أخرى' : 'Other'} ({otherCount})
          <span aria-hidden="true" style={{ marginLeft: '5px', display: 'inline-block', width: '10px', textAlign: 'center' }}>
            {isOtherExpanded ? '−' : '+'} {/* Simple +/- indicator */}
          </span>
        </button>
      )}

      {/* Conditionally Render Collapsed "Other" Tags */}
      {isOtherExpanded && otherTags.length > 0 && (
        <div id="other-tags-container" className={styles.otherTagsContainer}>
          {otherTags.map(renderTagButton)}
        </div>
      )}
    </div>
  );
};

export default TagFilter;
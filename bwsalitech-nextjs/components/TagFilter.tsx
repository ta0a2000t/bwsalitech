import React from 'react';
import type { Language } from '../interfaces';
import styles from '../styles/Home.module.css'; // Assuming styles are here

// Define the structure for tags with counts
interface TagWithCount {
  tag: string;
  count: number;
}

// Define props interface - Updated
interface TagFilterProps {
  tagsWithCounts: TagWithCount[]; // Changed from tags: string[]
  activeFilters: Set<string>;
  onToggleFilter: (tag: string) => void;
  language: Language;
}

const TagFilter: React.FC<TagFilterProps> = ({
  tagsWithCounts,
  activeFilters,
  onToggleFilter,
  language,
}) => {
  if (!tagsWithCounts || tagsWithCounts.length === 0) {
    return null;
  }

  // --- MODIFICATION START: Slice tags and calculate 'Other' count ---
  const topTags = tagsWithCounts.slice(0, 2);
  const otherTags = tagsWithCounts.slice(2);

  // Calculate the total count for the 'Other' category
  // This sums the counts of each tag appearance in the 'other' group.
  const otherCount = otherTags.reduce((sum, current) => sum + current.count, 0);
  // --- MODIFICATION END ---

  return (
    <div className={styles.tagFilters}>
      {/* Render Top 2 Tags */}
      {topTags.map(item => {
        const isActive = activeFilters.has(item.tag);
        return (
          <button
            key={item.tag}
            className={`${styles.tag} ${isActive ? styles.active : ''}`}
            onClick={() => onToggleFilter(item.tag)}
            aria-pressed={isActive}
            aria-label={`${language === 'ar' ? 'تصفية حسب' : 'Filter by'} ${item.tag} (${item.count} ${language === 'ar' ? 'شركة' : 'companies'})`}
          >
            {item.tag} ({item.count}) {/* Display tag and count */}
          </button>
        );
      })}

      {/* Render "Other" Tag if applicable */}
      {otherTags.length > 0 && (
        // Render as a non-interactive span, as clicking "Other" isn't defined
        <span
           className={`${styles.tag} ${styles.otherTag}`} // Add specific style if needed
           aria-label={`${otherCount} ${language === 'ar' ? 'شركات في فئات أخرى' : 'companies in other categories'}`}
        >
          {language === 'ar' ? 'أخرى' : 'Other'} ({otherCount})
        </span>
      )}
    </div>
  );
};

export default TagFilter;
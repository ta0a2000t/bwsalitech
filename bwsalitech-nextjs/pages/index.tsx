// bwsalitech-nextjs/pages/index.tsx
import Head from 'next/head';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import fs from 'fs';
import path from 'path';
import FlexSearch from 'flexsearch';

// Import Interfaces (using the simplified Company interface)
import type { Company, Language } from '../interfaces';

// Import Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import CompanyCard from '../components/CompanyCard';
import TagFilter from '../components/TagFilter';

// Import Validation Logic & Allowed Lists Constants
import {
    validateCompanySchema,
    ALLOWED_INDUSTRIES,
    ALLOWED_SUBINDUSTRIES
} from '../utils/industries'; // Use the constants from here

// Import Styles
import styles from '../styles/Home.module.css';

// Define the structure for tags with counts for TagFilter component
interface TagWithCount {
  tag: string;
  count: number;
}

// Props Type for the Page
interface HomeProps {
  allCompanies: Company[]; // Receives only validated companies
}

// getStaticProps (uses validateCompanySchema for filtering)
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const dataFilePath = path.join(process.cwd(), 'data', 'companies.json');
  let validatedCompanies: Company[] = [];

  try {
    const jsonData = fs.readFileSync(dataFilePath, 'utf8');
    const rawData = JSON.parse(jsonData);

    if (!Array.isArray(rawData)) {
      throw new Error("companies.json is not an array.");
    }

    // Filter using the validation function which returns a type predicate
    // Only companies passing validation will be included and typed as Company
    validatedCompanies = rawData.filter(validateCompanySchema);
    console.log(`Loaded ${rawData.length} companies, validated ${validatedCompanies.length} companies.`);
    if (rawData.length !== validatedCompanies.length) {
         console.warn(`Warning: ${rawData.length - validatedCompanies.length} companies failed validation and were excluded. Check console logs above for details.`);
    }

  } catch (error) {
    console.error("Error loading or validating companies.json:", error);
    validatedCompanies = []; // Return empty on error to avoid build failure
  }

  return {
    props: {
      allCompanies: validatedCompanies,
    },
     // Optional: Add revalidation if data changes often
     // revalidate: 3600, // e.g., every hour
  };
};

// Helper Function for Grammatically Correct Count
const getCompanyCountText = (count: number, language: Language): string => {
    if (language === 'ar') {
        if (count === 0) {
            return 'لا توجد شركات لعرضها';
        } else if (count === 1) {
            return 'عرض شركة واحدة'; // Singular
        } else if (count === 2) {
            return 'عرض شركتان'; // Dual
        } else {
             // Simplified plural for 3+
            return `عرض ${count} شركات`;
        }
    } else { // language === 'en'
        if (count === 1) {
            return `Showing 1 company`; // English singular
        } else {
            return `Showing ${count} companies`; // English plural (handles 0 too)
        }
    }
};

// --- Define Sorting Types ---
type SortCriteria = 'name' | 'year';
type SortDirection = 'asc' | 'desc';


// Main Page Component
const Home: NextPage<HomeProps> = ({ allCompanies }) => {
  // --- State Variables ---
  const [language, setLanguage] = useState<Language>('ar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set()); // For general tags
  const [searchIndex, setSearchIndex] = useState<FlexSearch.Document<any, true> | null>(null);
  const [searchResults, setSearchResults] = useState<Set<string> | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null); // Stores English name (tuple[0])
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string | null>(null); // Stores English name (tuple[0])
  // --- MODIFICATION START: Add Sorting State ---
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('name'); // Default sort
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc'); // Default direction
  // --- MODIFICATION END ---

  // --- Effects ---
  useEffect(() => {
    // Initialize FlexSearch index
    const index = new FlexSearch.Document<any, true>({
      document: {
        id: 'id',
        index: [
            'name_ar', 'name_en', 'description_ar', 'description_en', 'tags', 'headquarters',
            // Index both languages from the tuple
            'industry_en', 'industry_ar', 'subindustry_en', 'subindustry_ar',
        ],
        store: false, // We don't need to store the doc in the index itself
      },
      tokenize: 'forward', // Basic forward tokenization
      cache: 100, // Enable caching for performance
    });

    allCompanies.forEach(company => {
        // Add flattened data for indexing, accessing tuple elements
        index.add({
            id: company.id,
            name_ar: company.name_ar,
            name_en: company.name_en,
            description_ar: company.description_ar,
            description_en: company.description_en,
            tags: company.tags.join(' '), // Index tags as space-separated string
            headquarters: company.headquarters, // Index headquarters
            industry_en: company.industry[0],     // English name
            industry_ar: company.industry[1],     // Arabic name
            subindustry_en: company.subindustry[0], // English name
            subindustry_ar: company.subindustry[1], // Arabic name
        });
    });
    setSearchIndex(index);
    console.log('FlexSearch index initialized.');
  }, [allCompanies]); // Re-run only if allCompanies changes


  useEffect(() => {
    // Set document language and direction based on state
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]); // Re-run only if language changes

  // --- Event Handlers ---
  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => (prevLang === 'ar' ? 'en' : 'ar'));
  }, []); // Empty dependency array as it doesn't depend on external state/props

  const handleSearchChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults(null); // Clear results if query is empty
      return;
    }

    if (searchIndex) {
      try {
        // Perform asynchronous search
        const results = await searchIndex.searchAsync(query, {
             limit: allCompanies.length, // Adjust limit as needed, here showing all matches
             index: [ // Explicitly define fields to search in for this query
                'name_ar', 'name_en', 'description_ar', 'description_en', 'tags',
                'headquarters', 'industry_en', 'industry_ar', 'subindustry_en', 'subindustry_ar'
             ],
             suggest: true // Enable basic typo tolerance/suggestions
         });
        const matchedIds = new Set<string>();
        // FlexSearch returns results grouped by field; flatten them into a single Set of IDs
        results.forEach(fieldResult => {
            fieldResult.result.forEach(id => {
                matchedIds.add(id.toString()); // Ensure IDs are strings
            });
        });
        setSearchResults(matchedIds);
      } catch (e) {
        console.error("Search failed:", e);
        setSearchResults(new Set()); // Set empty results on error to avoid crashes
      }
    }
  }, [searchIndex, allCompanies.length]); // Depend on searchIndex and data length

  // Handler for general tags filter toggle
  const toggleFilter = useCallback((tag: string) => {
    setActiveFilters(prevFilters => {
      const newFilters = new Set(prevFilters); // Clone the set
      if (newFilters.has(tag)) {
        newFilters.delete(tag); // Toggle off
      } else {
        newFilters.add(tag); // Toggle on
      }
      return newFilters; // Return the new set to update state
    });
  }, []); // No external dependencies needed

  // Handler to clear all filters (tags, industry, subindustry)
  const clearAllFilters = useCallback(() => {
      setActiveFilters(new Set()); // Clear tags
      setSelectedIndustry(null); // Clear industry dropdown
      setSelectedSubIndustry(null); // Clear subindustry dropdown
  }, []); // No external dependencies needed

  // --- MODIFICATION START: Add Sort Handler ---
  // Handler for sort dropdown change
  const handleSortChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
      const [criteria, direction] = event.target.value.split('-') as [SortCriteria, SortDirection];
      setSortCriteria(criteria);
      setSortDirection(direction);
  }, []); // No external dependencies needed
  // --- MODIFICATION END ---

  // Handler to download the current company data as JSON
  const downloadJson = useCallback(() => {
    // Stringify the *original validated* data passed to the component
    const dataStr = JSON.stringify(allCompanies, null, 2); // Use 'allCompanies' prop
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = 'companies.json';

    // Create a temporary link element to trigger the download
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    document.body.appendChild(linkElement); // Append temporarily to ensure click works
    linkElement.click();
    document.body.removeChild(linkElement); // Clean up the temporary link
  }, [allCompanies]); // Depends on the original allCompanies data

  // --- Derived State: Calculate Filtered & Sorted Sets & Options ---

  // 1. Base filtering based on search query and active tag filters
  const baseFilteredCompanies = useMemo(() => {
    let companies = allCompanies;
    // Apply search results first if they exist
    if (searchResults !== null) {
        // Filter based on the set of IDs from search
        companies = companies.filter(company => searchResults.has(company.id));
    }
    // Then, apply active tag filters
    if (activeFilters.size > 0) {
        const filters = Array.from(activeFilters);
        // Filter further: company must include ALL active tags
        companies = companies.filter(company =>
            filters.every(f => company.tags.includes(f))
        );
    }
    return companies;
  }, [allCompanies, searchResults, activeFilters]); // Recalculate when these change

  // 2. Further filter based on the selected industry
  const industryFilteredCompanies = useMemo(() => {
    if (!selectedIndustry) {
        return baseFilteredCompanies; // If no industry selected, pass through
    }
    // Filter based on the ENGLISH name (index 0) of the industry tuple matching the selection
    return baseFilteredCompanies.filter(company => company.industry[0] === selectedIndustry);
  }, [baseFilteredCompanies, selectedIndustry]); // Recalculate when base list or industry changes

  // 3. Further filter based on the selected sub-industry (applied to industry-filtered list)
  const subIndustryFilteredCompanies = useMemo(() => {
     if (!selectedSubIndustry) {
         return industryFilteredCompanies; // If no subindustry selected, pass through
     }
     // Filter based on the ENGLISH name (index 0) of the subindustry tuple matching the selection
     return industryFilteredCompanies.filter(company => company.subindustry[0] === selectedSubIndustry);
  }, [industryFilteredCompanies, selectedSubIndustry]); // Recalculate when industry list or subindustry changes


  // --- MODIFICATION START: Calculate FINAL list with Sorting ---
  // 4. Calculate FINAL list of companies to display (apply sorting to the sub-industry filtered list)
  const filteredAndSortedCompanies = useMemo(() => {
    // Start with the companies filtered by everything *except* sorting
    const companiesToSort = [...subIndustryFilteredCompanies]; // Create a mutable copy for sorting

    // Apply sorting logic based on current state
    companiesToSort.sort((a, b) => {
        if (sortCriteria === 'name') {
            // Get names based on current language
            const nameA = language === 'ar' ? a.name_ar : a.name_en;
            const nameB = language === 'ar' ? b.name_ar : b.name_en;
            // Use localeCompare for proper string sorting in both languages
            const comparison = nameA.localeCompare(nameB, language === 'ar' ? 'ar-SA' : 'en-US'); // Use locale hints
            // Apply direction
            return sortDirection === 'asc' ? comparison : -comparison;
        } else if (sortCriteria === 'year') {
            // Handle null/undefined founding years gracefully (treat them as 0 or oldest)
            const yearA = a.founding_year ?? 0;
            const yearB = b.founding_year ?? 0;
            // Numerical comparison
            const comparison = yearA - yearB;
            // Apply direction (desc means larger year first)
            return sortDirection === 'asc' ? comparison : -comparison;
        }
        return 0; // Default: no change in order if criteria is unknown
    });

    return companiesToSort; // Return the sorted array
  }, [subIndustryFilteredCompanies, sortCriteria, sortDirection, language]); // Dependencies for recalculation
  // --- MODIFICATION END ---


  // --- Dropdown Options Calculation ---
  // Helper to get localized name from a tuple based on current language state
  const getLocalizedName = useCallback((tuple: [string, string]) => {
      return language === 'ar' ? tuple[1] : tuple[0]; // Index 1 for Arabic, 0 for English
  }, [language]); // Depends only on language state

  // 4. Calculate Industry dropdown options based on BASE filtered companies
  const industryOptions = useMemo(() => {
    const counts: { [englishIndustry: string]: number } = {};
    // Count occurrences in the base filtered list (before industry/subindustry filters are applied)
    baseFilteredCompanies.forEach(company => {
        const englishIndustry = company.industry[0]; // Use English name as the key
        counts[englishIndustry] = (counts[englishIndustry] || 0) + 1;
    });

    // Determine unique industries present in the base filtered list
    const presentEnglishIndustries = new Set(baseFilteredCompanies.map(c => c.industry[0]));
    // Filter the master list of allowed industries to only those currently present
    const uniqueIndustryTuples = ALLOWED_INDUSTRIES.filter(tuple => presentEnglishIndustries.has(tuple[0]));

    // Sort the unique options alphabetically based on the current language's name
    uniqueIndustryTuples.sort((a, b) =>
        getLocalizedName(a).localeCompare(getLocalizedName(b), language === 'ar' ? 'ar-SA' : 'en-US')
    );

    // Map to the dropdown option format { value, label }
    return uniqueIndustryTuples.map(tuple => ({
        value: tuple[0], // Use English name as the internal value
        label: `${getLocalizedName(tuple)} (${counts[tuple[0]] || 0})`, // Display localized name + count
    }));
  }, [baseFilteredCompanies, language, getLocalizedName]); // Recalculate if base list or language changes

  // 5. Calculate Subindustry dropdown options based on INDUSTRY filtered companies
  const subIndustryOptions = useMemo(() => {
    const counts: { [englishSubIndustry: string]: number } = {};
     // Count occurrences ONLY within the list already filtered by industry
    industryFilteredCompanies.forEach(company => {
        const englishSubIndustry = company.subindustry[0]; // Use English name as the key
        counts[englishSubIndustry] = (counts[englishSubIndustry] || 0) + 1;
    });

    // Determine unique subindustries present in the industry-filtered list
    const presentEnglishSubIndustries = new Set(industryFilteredCompanies.map(c => c.subindustry[0]));
     // Filter the master list of allowed subindustries based on presence
    const uniqueSubIndustryTuples = ALLOWED_SUBINDUSTRIES.filter(tuple => presentEnglishSubIndustries.has(tuple[0]));

    // Sort the unique options alphabetically based on the current language's name
    uniqueSubIndustryTuples.sort((a, b) =>
       getLocalizedName(a).localeCompare(getLocalizedName(b), language === 'ar' ? 'ar-SA' : 'en-US')
    );

     // Map to the dropdown option format { value, label }
    return uniqueSubIndustryTuples.map(tuple => ({
        value: tuple[0], // Use English name as the internal value
        label: `${getLocalizedName(tuple)} (${counts[tuple[0]] || 0})`, // Display localized name + count
    }));
  }, [industryFilteredCompanies, language, getLocalizedName]); // Recalculate if industry list or language changes

  // --- MODIFICATION START: Calculate tags based on the FINAL sorted list ---
  // 6. Calculate tag counts for the TagFilter component based on the FINAL VISIBLE companies
  const currentVisibleTagsWithCounts = useMemo<TagWithCount[]>(() => {
    const counts: { [tag: string]: number } = {};
    // Iterate over the final filteredAndSortedCompanies list
    filteredAndSortedCompanies.forEach(company => {
      company.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    // Convert counts object to array of { tag, count }
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      // Sort tags primarily by count (descending), then alphabetically for ties
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return a.tag.localeCompare(b.tag); // Alphabetical tie-breaker
      });
  }, [filteredAndSortedCompanies]); // Dependency updated to the final list
  // --- MODIFICATION END ---


  // --- Render ---
  const pageTitle = language === 'ar' ? 'بوصلة➝ك | دليل شركات التقنية العربية' : 'Bawsalatuk | Arab Tech Companies Directory';
  const metaDescription = language === 'ar' ? 'دليل مفتوح المصدر لشركات التقنية في العالم العربي' : 'Open-source directory of tech companies in the Arab world';
  // --- MODIFICATION START: Use final sorted list for count display ---
  const companyCountText = getCompanyCountText(filteredAndSortedCompanies.length, language);
  // --- MODIFICATION END ---


  return (
    <div className={styles.container}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Add rel="icon" links if you have favicons */}
      </Head>

      <Header currentLanguage={language} onToggleLanguage={toggleLanguage} />

      <main className={styles.main}>
        <section className={styles.searchSection}>
          <div className="container"> {/* Use a standard container class if defined globally */}
             {/* Search Bar */}
             <div className={styles.searchBar}>
              <input
                type="search" // Use search type for semantics and potential browser features
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
                placeholder={language === 'ar' ? 'ابحث (شركة، وصف، وسم، مقر، صناعة...)' : 'Search (company, desc, tag, HQ, industry...)'}
                aria-label={language === 'ar' ? 'بحث عن شركة، وصف، وسم، مقر، أو صناعة' : 'Search for company, description, tag, headquarters, or industry'}
              />
            </div>

            {/* --- MODIFICATION START: Add Sort Dropdown and adjust category filter layout --- */}
            <div className={styles.filterSortRow}> {/* Wrapper for filters + sort controls */}
                {/* Category Filters Group */}
                <div className={styles.categoryFilters}>
                    {/* Industry Dropdown */}
                    <select
                        value={selectedIndustry || ''} // Controlled component using state
                        onChange={(e) => {
                            setSelectedIndustry(e.target.value || null); // Update state, null if default selected
                            setSelectedSubIndustry(null); // Reset subindustry when industry changes
                        }}
                        className={styles.categorySelect}
                        aria-label={language === 'ar' ? 'تصفية حسب الصناعة' : 'Filter by Industry'}
                    >
                        {/* Default option showing count before this filter */}
                        <option value="">
                            {language === 'ar'
                                ? `كل الصناعات (${baseFilteredCompanies.length})`
                                : `All Industries (${baseFilteredCompanies.length})`}
                        </option>
                        {/* Populate with calculated options */}
                        {industryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} {/* Label includes localized name and count */}
                            </option>
                        ))}
                    </select>

                    {/* Subindustry Dropdown */}
                    <select
                         value={selectedSubIndustry || ''} // Controlled component using state
                         onChange={(e) => setSelectedSubIndustry(e.target.value || null)} // Update state
                         className={styles.categorySelect}
                         aria-label={language === 'ar' ? 'تصفية حسب الصناعة الفرعية' : 'Filter by Subindustry'}
                         // Disable if no parent industry is selected OR if the selected industry yields no subindustries
                         disabled={!selectedIndustry || subIndustryOptions.length === 0}
                    >
                         {/* Default option showing count before this filter */}
                         <option value="">
                            {language === 'ar'
                                ? `كل الصناعات الفرعية (${industryFilteredCompanies.length})`
                                : `All Subindustries (${industryFilteredCompanies.length})`}
                        </option>
                         {/* Populate with calculated options */}
                        {subIndustryOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label} {/* Label includes localized name and count */}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Sort Control Group */}
                <div className={styles.sortControl}>
                    <label htmlFor="sort-select" className={styles.sortLabel}>
                        {language === 'ar' ? 'ترتيب حسب:' : 'Sort by:'}
                    </label>
                    <select
                        id="sort-select" // Link label and select
                        value={`${sortCriteria}-${sortDirection}`} // Combine state for controlled value
                        onChange={handleSortChange} // Use the sort handler
                        className={styles.sortSelect} // Apply styling
                        aria-label={language === 'ar' ? 'خيارات الترتيب' : 'Sorting options'}
                    >
                        <option value="name-asc">{language === 'ar' ? 'الاسم (أ-ي)' : 'Name (A-Z)'}</option>
                        <option value="name-desc">{language === 'ar' ? 'الاسم (ي-أ)' : 'Name (Z-A)'}</option>
                        <option value="year-desc">{language === 'ar' ? 'سنة التأسيس (الأحدث)' : 'Founding Year (Newest)'}</option>
                        <option value="year-asc">{language === 'ar' ? 'سنة التأسيس (الأقدم)' : 'Founding Year (Oldest)'}</option>
                    </select>
                </div>
            </div>
            {/* --- MODIFICATION END --- */}


            {/* General Tag Filter Component */}
            <TagFilter
              tagsWithCounts={currentVisibleTagsWithCounts} // Pass tags from the FINAL visible list
              activeFilters={activeFilters} // Pass current active tag filters
              onToggleFilter={toggleFilter} // Pass toggle handler
              onClearFilters={clearAllFilters} // Pass clear all handler
              language={language} // Pass current language
             />
          </div>
        </section>

        <section className={styles.companiesSection}>
            <div className="container"> {/* Use a standard container class */}
                {/* Display count of final filtered and sorted companies */}
                <h2 className={styles.companyCount}>
                    {companyCountText}
                </h2>

                 {/* Optional: Loading indicator while index builds (might flash briefly on first load) */}
                 {/* {!searchIndex && allCompanies.length > 0 && <div className={styles.loadingIndicator}>Loading...</div>} */}

                {/* --- MODIFICATION START: Render the final sorted list --- */}
                <div className={styles.companiesGrid}>
                    {filteredAndSortedCompanies.length > 0 ? (
                        // Render company cards from the final sorted list
                        filteredAndSortedCompanies.map(company => (
                            <CompanyCard
                                key={company.id}
                                company={company} // Pass the validated company data object
                                language={language} // Pass the current language
                            />
                        ))
                    ) : (
                         // Show "no results" message *only if* filtering/searching is active or initial data is empty
                         (searchQuery || activeFilters.size > 0 || selectedIndustry || selectedSubIndustry || allCompanies.length === 0) && (
                             <div className={styles.noResults}>
                                {allCompanies.length === 0 // Check if initial data load failed/was empty
                                 ? (language === 'ar' ? 'لم يتم تحميل أو العثور على بيانات شركات صالحة.' : 'No valid company data could be loaded or found.')
                                 : (language === 'ar' // Normal no results message when filters/search yield nothing
                                    ? 'لا توجد نتائج مطابقة للبحث أو المرشحات المحددة.'
                                    : 'No matching results found for your search or selected filters.')
                                }
                             </div>
                         )
                         // Implicitly render nothing if no filters/search active and the grid is just empty (avoids "no results" on initial load)
                    )}
                </div>
                {/* --- MODIFICATION END --- */}
            </div>
        </section>
      </main>

      <Footer currentLanguage={language} onDownloadJson={downloadJson} />
    </div>
  );
};

export default Home;
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


// Main Page Component
const Home: NextPage<HomeProps> = ({ allCompanies }) => {
  // State Variables
  const [language, setLanguage] = useState<Language>('ar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set()); // For general tags
  const [searchIndex, setSearchIndex] = useState<FlexSearch.Document<any, true> | null>(null);
  const [searchResults, setSearchResults] = useState<Set<string> | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null); // Stores English name (tuple[0])
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string | null>(null); // Stores English name (tuple[0])

  // Effects
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
        store: false,
      },
      tokenize: 'forward',
      cache: 100,
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
            headquarters: company.headquarters,
            industry_en: company.industry[0],     // English name
            industry_ar: company.industry[1],     // Arabic name
            subindustry_en: company.subindustry[0], // English name
            subindustry_ar: company.subindustry[1], // Arabic name
        });
    });
    setSearchIndex(index);
    console.log('FlexSearch index initialized.');
  }, [allCompanies]);


  useEffect(() => {
    // Set document language and direction
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // Event Handlers
  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => (prevLang === 'ar' ? 'en' : 'ar'));
  }, []);

  const handleSearchChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults(null); // Clear results if query is empty
      return;
    }

    if (searchIndex) {
      try {
        // Search across relevant fields
        const results = await searchIndex.searchAsync(query, {
             limit: allCompanies.length, // Limit results if needed, here showing all matches
             index: [ // Specify fields to search in
                'name_ar', 'name_en', 'description_ar', 'description_en', 'tags',
                'headquarters', 'industry_en', 'industry_ar', 'subindustry_en', 'subindustry_ar'
             ],
             suggest: true // Enable suggestions for potential typos
         });
        const matchedIds = new Set<string>();
        // Collect unique IDs from results across different fields
        results.forEach(fieldResult => {
            fieldResult.result.forEach(id => {
                matchedIds.add(id.toString());
            });
        });
        setSearchResults(matchedIds);
      } catch (e) {
        console.error("Search failed:", e);
        setSearchResults(new Set()); // Set empty results on error
      }
    }
  }, [searchIndex, allCompanies.length]);

  // Handler for general tags filter
  const toggleFilter = useCallback((tag: string) => {
    setActiveFilters(prevFilters => {
      const newFilters = new Set(prevFilters);
      if (newFilters.has(tag)) {
        newFilters.delete(tag);
      } else {
        newFilters.add(tag);
      }
      return newFilters;
    });
  }, []);

  // Handler to clear general tags filter and category filters
  const clearAllFilters = useCallback(() => {
      setActiveFilters(new Set());
      setSelectedIndustry(null);
      setSelectedSubIndustry(null);
  }, []);

  // Handler to download the current company data as JSON
  const downloadJson = useCallback(() => {
    // Stringify the validated data passed to the component
    const dataStr = JSON.stringify(allCompanies, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = 'companies.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
    linkElement.remove(); // Clean up the temporary link
  }, [allCompanies]);

  // --- Derived State: Calculate Filtered Sets & Options with Counts ---

  // 1. Base filtering based on search and general tags
  const baseFilteredCompanies = useMemo(() => {
    let companies = allCompanies;
    // Apply search results if available
    if (searchResults !== null) {
        companies = companies.filter(company => searchResults.has(company.id));
    }
    // Apply active tag filters
    if (activeFilters.size > 0) {
        const filters = Array.from(activeFilters);
        companies = companies.filter(company =>
            filters.every(f => company.tags.includes(f)) // Company must have ALL active tags
        );
    }
    return companies;
  }, [allCompanies, searchResults, activeFilters]);

  // 2. Further filter based on selected industry
  const industryFilteredCompanies = useMemo(() => {
    if (!selectedIndustry) {
        return baseFilteredCompanies; // No industry filter applied
    }
    // Filter based on the ENGLISH name (index 0) of the industry tuple
    return baseFilteredCompanies.filter(company => company.industry[0] === selectedIndustry);
  }, [baseFilteredCompanies, selectedIndustry]);

  // 3. Calculate FINAL list of companies to display based on subindustry filter
  const filteredCompanies = useMemo(() => {
    if (!selectedSubIndustry) {
        return industryFilteredCompanies; // No subindustry filter applied
    }
    // Filter based on the ENGLISH name (index 0) of the subindustry tuple
    return industryFilteredCompanies.filter(company => company.subindustry[0] === selectedSubIndustry);
  }, [industryFilteredCompanies, selectedSubIndustry]);

  // --- Dropdown Options Calculation ---
  // Helper to get localized name from a tuple based on current language
  const getLocalizedName = useCallback((tuple: [string, string]) => {
      return language === 'ar' ? tuple[1] : tuple[0];
  }, [language]);

  // 4. Calculate Industry counts and generate options for dropdown
  const industryOptions = useMemo(() => {
    const counts: { [englishIndustry: string]: number } = {};
    // Count occurrences in the base filtered list (before industry filter is applied)
    baseFilteredCompanies.forEach(company => {
        const englishIndustry = company.industry[0]; // English name is the key
        counts[englishIndustry] = (counts[englishIndustry] || 0) + 1;
    });

    // Determine unique industries present in the base filtered list
    const presentEnglishIndustries = new Set(baseFilteredCompanies.map(c => c.industry[0]));
    // Filter the master list of allowed industries to only those present
    const uniqueIndustryTuples = ALLOWED_INDUSTRIES.filter(tuple => presentEnglishIndustries.has(tuple[0]));

    // Sort options alphabetically based on the current language
    uniqueIndustryTuples.sort((a, b) =>
        getLocalizedName(a).localeCompare(getLocalizedName(b), language === 'ar' ? 'ar' : 'en')
    );

    // Map to dropdown option format
    return uniqueIndustryTuples.map(tuple => ({
        value: tuple[0], // Use English name as the value for consistency
        label: `${getLocalizedName(tuple)} (${counts[tuple[0]] || 0})`, // Display localized name + count
    }));
  }, [baseFilteredCompanies, language, getLocalizedName]);

  // 5. Calculate Subindustry counts and generate options for dropdown
  const subIndustryOptions = useMemo(() => {
    const counts: { [englishSubIndustry: string]: number } = {};
     // Count occurrences ONLY within the list already filtered by industry
    industryFilteredCompanies.forEach(company => {
        const englishSubIndustry = company.subindustry[0]; // English name is the key
        counts[englishSubIndustry] = (counts[englishSubIndustry] || 0) + 1;
    });

    // Determine unique subindustries present in the industry-filtered list
    const presentEnglishSubIndustries = new Set(industryFilteredCompanies.map(c => c.subindustry[0]));
     // Filter the master list of allowed subindustries
    const uniqueSubIndustryTuples = ALLOWED_SUBINDUSTRIES.filter(tuple => presentEnglishSubIndustries.has(tuple[0]));

    // Sort options alphabetically based on the current language
    uniqueSubIndustryTuples.sort((a, b) =>
       getLocalizedName(a).localeCompare(getLocalizedName(b), language === 'ar' ? 'ar' : 'en')
    );

     // Map to dropdown option format
    return uniqueSubIndustryTuples.map(tuple => ({
        value: tuple[0], // Use English name as the value
        label: `${getLocalizedName(tuple)} (${counts[tuple[0]] || 0})`, // Display localized name + count
    }));
  }, [industryFilteredCompanies, language, getLocalizedName]);

  // 6. Calculate tag counts based on the FINAL VISIBLE companies for TagFilter component
  const currentVisibleTagsWithCounts = useMemo<TagWithCount[]>(() => {
    const counts: { [tag: string]: number } = {};
    filteredCompanies.forEach(company => {
      company.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    // Convert counts object to array and sort by count descending
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCompanies]);

  // --- Render ---
  const pageTitle = language === 'ar' ? 'بوصلة➝ك | دليل شركات التقنية العربية' : 'Bawsalatuk | Arab Tech Companies Directory';
  const metaDescription = language === 'ar' ? 'دليل مفتوح المصدر لشركات التقنية في العالم العربي' : 'Open-source directory of tech companies in the Arab world';
  const companyCountText = getCompanyCountText(filteredCompanies.length, language);

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
          <div className="container">
             {/* Search Bar */}
             <div className={styles.searchBar}>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
                placeholder={language === 'ar' ? 'ابحث (شركة، وصف، وسم، مقر، صناعة...)' : 'Search (company, desc, tag, HQ, industry...)'}
                aria-label={language === 'ar' ? 'بحث عن شركة، وصف، وسم، مقر، أو صناعة' : 'Search for company, description, tag, headquarters, or industry'}
              />
            </div>

            {/* Category Filters */}
            <div className={styles.categoryFilters}>
                {/* Industry Dropdown */}
                <select
                    value={selectedIndustry || ''} // Controlled component
                    onChange={(e) => {
                        setSelectedIndustry(e.target.value || null); // Set filter based on English value
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
                            {option.label} {/* Label is already localized with count */}
                        </option>
                    ))}
                </select>

                {/* Subindustry Dropdown */}
                <select
                     value={selectedSubIndustry || ''} // Controlled component
                     onChange={(e) => setSelectedSubIndustry(e.target.value || null)} // Set filter
                     className={styles.categorySelect}
                     aria-label={language === 'ar' ? 'تصفية حسب الصناعة الفرعية' : 'Filter by Subindustry'}
                     // Disable if no industry is selected OR if the selected industry has no subindustries in the filtered data
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
                            {option.label} {/* Label is already localized with count */}
                        </option>
                    ))}
                </select>
            </div>

            {/* General Tag Filter Component */}
            <TagFilter
              tagsWithCounts={currentVisibleTagsWithCounts} // Pass tags from final visible list
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              onClearFilters={clearAllFilters} // Pass clear function
              language={language}
             />
          </div>
        </section>

        <section className={styles.companiesSection}>
            <div className="container">
                {/* Display count of final filtered companies */}
                <h2 className={styles.companyCount}>
                    {companyCountText}
                </h2>

                 {/* Optional: Loading indicator while index builds (might flash briefly) */}
                 {/* {!searchIndex && allCompanies.length > 0 && <div className="spinner"></div>} */}

                <div className={styles.companiesGrid}>
                    {filteredCompanies.length > 0 ? (
                        // Render company cards if results exist
                        filteredCompanies.map(company => (
                            <CompanyCard
                                key={company.id}
                                company={company} // Pass validated company data
                                language={language}
                            />
                        ))
                    ) : (
                         // Show "no results" message if applicable
                         (searchQuery || activeFilters.size > 0 || selectedIndustry || selectedSubIndustry || allCompanies.length === 0) && (
                             <div className={styles.noResults}>
                                {allCompanies.length === 0 // Check if initial data load failed/was empty
                                 ? (language === 'ar' ? 'لم يتم تحميل أو العثور على بيانات شركات صالحة.' : 'No valid company data could be loaded or found.')
                                 : (language === 'ar' // Normal no results message
                                    ? 'لا توجد نتائج مطابقة للبحث أو المرشحات المحددة.'
                                    : 'No matching results found for your search or selected filters.')
                                }
                             </div>
                         )
                    )}
                </div>
            </div>
        </section>
      </main>

      <Footer currentLanguage={language} onDownloadJson={downloadJson} />
    </div>
  );
};

export default Home;
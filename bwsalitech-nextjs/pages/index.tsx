// bwsalitech-nextjs/pages/index.tsx
import Head from 'next/head';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import fs from 'fs';
import path from 'path';
import FlexSearch from 'flexsearch';

// Import Interfaces
import type { Company, Language } from '../interfaces';

// Import Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import CompanyCard from '../components/CompanyCard';
import TagFilter from '../components/TagFilter';

// Import Styles
import styles from '../styles/Home.module.css';

// Define the structure for tags with counts for TagFilter component
interface TagWithCount {
  tag: string;
  count: number;
}

// --- Props Type for the Page ---
interface HomeProps {
  allCompanies: Company[];
}

// --- getStaticProps ---
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const dataFilePath = path.join(process.cwd(), 'data', 'companies.json');
  const jsonData = fs.readFileSync(dataFilePath, 'utf8');
  const allCompanies: Company[] = JSON.parse(jsonData);

  return {
    props: {
      allCompanies,
    },
  };
};

// --- Helper Function for Grammatically Correct Count ---
const getCompanyCountText = (count: number, language: Language): string => {
  if (language === 'ar') {
    if (count === 0) {
      return 'لا توجد شركات لعرضها';
    } else if (count === 1) {
      return 'عرض شركة واحدة'; // Singular
    } else if (count === 2) {
      return 'عرض شركتان'; // Dual
    } else if (count >= 3 && count <= 10) {
      // Numbers 3-10 take plural noun, number itself is used
      return `عرض ${count} شركات`; // Plural (sound feminine plural is common here)
    } else {
      // Numbers 11+ typically take singular noun in accusative, but using plural is common in modern usage/simplification
      // Sticking to the user's requested format 'x شركات' for simplicity above 2.
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


// --- Main Page Component ---
const Home: NextPage<HomeProps> = ({ allCompanies }) => {
  // --- State Variables ---
  const [language, setLanguage] = useState<Language>('ar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set()); // For general tags
  const [searchIndex, setSearchIndex] = useState<FlexSearch.Document<Company, true> | null>(null);
  const [searchResults, setSearchResults] = useState<Set<string> | null>(null);
  // --- NEW State for category filters ---
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string | null>(null);


  // --- Effects ---
  useEffect(() => {
    const index = new FlexSearch.Document<Company, true>({
      document: {
        id: 'id',
        // Ensure index includes relevant fields
        index: ['name_ar', 'name_en', 'description_ar', 'description_en', 'tags', 'headquarters', 'industry', 'subindustry'],
      },
      tokenize: 'forward',
      cache: 100,
    });
    allCompanies.forEach(company => index.add(company));
    setSearchIndex(index);
    console.log('FlexSearch index initialized including industry/subindustry.');
  }, [allCompanies]);


  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // --- Event Handlers ---
  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => (prevLang === 'ar' ? 'en' : 'ar'));
  }, []);

  const handleSearchChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (!query) {
      setSearchResults(null);
      return;
    }

    if (searchIndex) {
      try {
        const results = await searchIndex.searchAsync(query, { limit: allCompanies.length, suggest: true });
        const matchedIds = new Set<string>();
        results.forEach(fieldResult => {
            fieldResult.result.forEach(id => {
                matchedIds.add(id.toString());
            });
        });
        setSearchResults(matchedIds);
      } catch (e) {
        console.error("Search failed:", e);
        setSearchResults(new Set());
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

  // Handler to clear general tags filter
  const clearAllFilters = useCallback(() => {
      setActiveFilters(new Set());
      // Optional: Also clear category filters if desired
      // setSelectedIndustry(null);
      // setSelectedSubIndustry(null);
  }, []);


  const downloadJson = useCallback(() => {
    const dataStr = JSON.stringify(allCompanies, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = 'companies.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }, [allCompanies]);

  // --- Derived State: Calculate Filtered Sets & Options with Counts ---

  // 1. Base filtering based on search and tags (used for Industry counts)
  const baseFilteredCompanies = useMemo(() => {
    let companies = allCompanies;
    if (searchResults !== null) {
        companies = companies.filter(company => searchResults.has(company.id));
    }
    if (activeFilters.size > 0) {
        const filters = Array.from(activeFilters);
        companies = companies.filter(company =>
            filters.every(f => company.tags.includes(f))
        );
    }
    return companies;
  }, [allCompanies, searchResults, activeFilters]);

  // 2. Further filter based on selected industry (used for Subindustry counts)
  const industryFilteredCompanies = useMemo(() => {
    if (!selectedIndustry) {
        return baseFilteredCompanies; // If no industry selected, use the base set
    }
    return baseFilteredCompanies.filter(company => company.industry === selectedIndustry);
  }, [baseFilteredCompanies, selectedIndustry]);

  // 3. Calculate FINAL list of companies to display
  const filteredCompanies = useMemo(() => {
    let companiesToShow = industryFilteredCompanies;
    // Apply the Subindustry filter (if selected)
    if (selectedSubIndustry) {
        companiesToShow = companiesToShow.filter(company => company.subindustry === selectedSubIndustry);
    }
    return companiesToShow;
  }, [industryFilteredCompanies, selectedSubIndustry]);

  // 4. Calculate Industry counts and generate options for dropdown
  const industryOptions = useMemo(() => {
    const counts: { [key: string]: number } = {};
    baseFilteredCompanies.forEach(company => {
        counts[company.industry] = (counts[company.industry] || 0) + 1;
    });
    const uniqueIndustries = Array.from(new Set(baseFilteredCompanies.map(c => c.industry))).sort();
    return uniqueIndustries.map(industry => ({
        value: industry,
        label: `${industry} (${counts[industry] || 0})`,
    }));
  }, [baseFilteredCompanies]);

  // 5. Calculate Subindustry counts and generate options for dropdown
  const subIndustryOptions = useMemo(() => {
    const counts: { [key: string]: number } = {};
    industryFilteredCompanies.forEach(company => {
        counts[company.subindustry] = (counts[company.subindustry] || 0) + 1;
    });
    const uniqueSubIndustries = Array.from(new Set(industryFilteredCompanies.map(c => c.subindustry))).sort();
    return uniqueSubIndustries.map(sub => ({
        value: sub,
        label: `${sub} (${counts[sub] || 0})`,
    }));
  }, [industryFilteredCompanies]);

  // 6. Calculate tag counts based on the FINAL VISIBLE companies (for TagFilter component)
  const currentVisibleTagsWithCounts = useMemo<TagWithCount[]>(() => {
    const counts: { [tag: string]: number } = {};
    filteredCompanies.forEach(company => {
      // Ensure ONLY tags are counted here
      company.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCompanies]); // Depends on the final list

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
                placeholder={language === 'ar' ? 'ابحث (شركة، وسم، مقر، صناعة)...' : 'Search (company, tag, HQ, industry)...'}
                aria-label={language === 'ar' ? 'بحث عن شركة أو وسم أو مقر أو صناعة' : 'Search for company, tag, headquarters, or industry'}
              />
            </div>

            {/* --- NEW: Category Filters --- */}
            <div className={styles.categoryFilters}>
                {/* Industry Dropdown */}
                <select
                    value={selectedIndustry || ''}
                    onChange={(e) => {
                        setSelectedIndustry(e.target.value || null);
                        setSelectedSubIndustry(null); // Reset subindustry
                    }}
                    className={styles.categorySelect}
                    aria-label={language === 'ar' ? 'تصفية حسب الصناعة' : 'Filter by Industry'}
                >
                    <option value="">
                        {language === 'ar'
                            ? `كل الصناعات (${baseFilteredCompanies.length})`
                            : `All Industries (${baseFilteredCompanies.length})`}
                    </option>
                    {industryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                {/* Subindustry Dropdown */}
                <select
                     value={selectedSubIndustry || ''}
                     onChange={(e) => setSelectedSubIndustry(e.target.value || null)}
                     className={styles.categorySelect}
                     aria-label={language === 'ar' ? 'تصفية حسب الصناعة الفرعية' : 'Filter by Subindustry'}
                     // Disable if there are no sub-industries to show for the current selection
                     disabled={subIndustryOptions.length === 0 && !!selectedIndustry}
                >
                     <option value="">
                        {language === 'ar'
                            ? `كل الصناعات الفرعية (${industryFilteredCompanies.length})`
                            : `All Subindustries (${industryFilteredCompanies.length})`}
                    </option>
                    {subIndustryOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* General Tag Filter */}
            <TagFilter
              tagsWithCounts={currentVisibleTagsWithCounts} // Now uses counts from FINAL filtered list
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              onClearFilters={clearAllFilters} // Clears only tag filters
              language={language}
             />
          </div>
        </section>

        <section className={styles.companiesSection}>
            <div className="container">
                <h2 className={styles.companyCount}>
                    {companyCountText}
                </h2>

                {!searchIndex && searchQuery && (
                   <p className={styles.loadingOrError}>Initializing search...</p>
                )}

                <div className={styles.companiesGrid}>
                    {filteredCompanies.length > 0 ? (
                        filteredCompanies.map(company => (
                            <CompanyCard
                                key={company.id}
                                company={company}
                                language={language}
                            />
                        ))
                    ) : (
                        // Show "no results" if filters/search are active OR if there are no companies at all
                        (searchQuery || activeFilters.size > 0 || selectedIndustry || selectedSubIndustry || allCompanies.length === 0) && (
                             <div className={styles.noResults}>
                                {allCompanies.length === 0
                                 ? (language === 'ar' ? 'لم يتم تحميل بيانات الشركات.' : 'Company data could not be loaded.')
                                 : (language === 'ar'
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
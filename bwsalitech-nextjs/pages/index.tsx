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
import TagFilter from '../components/TagFilter'; // Make sure this import is correct

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

// --- Main Page Component ---
const Home: NextPage<HomeProps> = ({ allCompanies }) => {
  // --- State Variables ---
  const [language, setLanguage] = useState<Language>('ar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [searchIndex, setSearchIndex] = useState<FlexSearch.Document<Company, true> | null>(null);
  const [searchResults, setSearchResults] = useState<Set<string> | null>(null);

  // --- Effects ---
  useEffect(() => {
    const index = new FlexSearch.Document<Company, true>({
      document: {
        id: 'id',
        index: ['name_ar', 'name_en', 'description_ar', 'description_en', 'tags'],
      },
      tokenize: 'forward',
      cache: 100,
    });
    allCompanies.forEach(company => index.add(company));
    setSearchIndex(index);
    console.log('FlexSearch index initialized.');
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
      setSearchResults(null); // Clear search results when query is empty
      return;
    }

    if (searchIndex) {
      try {
        const results = await searchIndex.searchAsync(query, { limit: allCompanies.length });
        const matchedIds = new Set<string>();
        results.forEach(fieldResult => {
            fieldResult.result.forEach(id => {
                matchedIds.add(id.toString());
            });
        });
        setSearchResults(matchedIds);
      } catch (e) {
        console.error("Search failed:", e);
        setSearchResults(new Set()); // Set to empty set on error
      }
    }
  }, [searchIndex, allCompanies.length]);

  const toggleFilter = useCallback((tag: string) => {
    setActiveFilters(prevFilters => {
      const newFilters = new Set(prevFilters);
      if (newFilters.has(tag)) {
        newFilters.delete(tag);
      } else {
        newFilters.add(tag);
      }
      // Don't reset search when toggling filters, let them combine
      return newFilters;
    });
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

  // --- Derived State: Filtered Companies ---
  const filteredCompanies = useMemo(() => {
    let companiesToShow = allCompanies;

    // Apply search results first if available
    if (searchResults !== null) {
      // If search has run (even if it found 0 results), filter by the result IDs
      companiesToShow = companiesToShow.filter(company => searchResults.has(company.id));
    }

    // Then apply active tag filters to the (potentially search-filtered) list
    if (activeFilters.size > 0) {
      const filters = Array.from(activeFilters);
      companiesToShow = companiesToShow.filter(company =>
        filters.every(f => company.tags.includes(f))
      );
    }

    return companiesToShow;
  }, [allCompanies, searchResults, activeFilters]); // Depends on search and filters

  // --- MODIFICATION START: Calculate tag counts based on CURRENTLY VISIBLE companies ---
  const currentVisibleTagsWithCounts = useMemo<TagWithCount[]>(() => {
    const counts: { [tag: string]: number } = {};
    // *** Use filteredCompanies here instead of allCompanies ***
    filteredCompanies.forEach(company => {
      company.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count); // Sort descending by count
  }, [filteredCompanies]); // *** Dependency is now filteredCompanies ***
  // --- MODIFICATION END ---

  // --- Render ---
  const pageTitle = language === 'ar' ? 'بوصلةك | دليل شركات التقنية العربية' : 'Bawsalatuk | Arab Tech Companies Directory';
  const metaDescription = language === 'ar' ? 'دليل مفتوح المصدر لشركات التقنية في العالم العربي' : 'Open-source directory of tech companies in the Arab world';

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
             <div className={styles.searchBar}>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
                placeholder={language === 'ar' ? 'ابحث عن شركة...' : 'Search for a company...'}
                aria-label={language === 'ar' ? 'بحث عن شركة' : 'Search for company'}
              />
            </div>
            {/* --- MODIFICATION: Pass the DYNAMICALLY calculated tags --- */}
            <TagFilter
              tagsWithCounts={currentVisibleTagsWithCounts} // Pass the dynamic list
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              language={language}
             />
             {/* --- MODIFICATION END --- */}
          </div>
        </section>

        <section className={styles.companiesSection}>
            <div className="container">
                <h2 className={styles.companyCount}>
                    {language === 'ar'
                        ? `عرض ${filteredCompanies.length} شركة`
                        : `Showing ${filteredCompanies.length} companies`}
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
                        // Show "no results" if filtering/searching is active OR if the initial data is empty
                        (searchQuery || activeFilters.size > 0 || allCompanies.length === 0) && (
                             <div className={styles.noResults}>
                                {allCompanies.length === 0
                                 ? (language === 'ar' ? 'لم يتم تحميل بيانات الشركات.' : 'Company data could not be loaded.')
                                 : (language === 'ar'
                                    ? 'لا توجد نتائج مطابقة للبحث أو التصفية.'
                                    : 'No matching results found for your search or filters.')
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
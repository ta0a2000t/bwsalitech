import Head from 'next/head';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { GetStaticProps, NextPage } from 'next';
import fs from 'fs';
import path from 'path';
import FlexSearch from 'flexsearch';
// Explicitly type the Document interface from FlexSearch if needed elsewhere,
// but for index creation, generic <Company> often suffices.
// import type { Document as FlexSearchDocument } from 'flexsearch';


// Import Interfaces
import type { Company, Language } from '../interfaces';

// Import Components
import Header from '../components/Header';
import Footer from '../components/Footer';
import CompanyCard from '../components/CompanyCard';
import TagFilter from '../components/TagFilter';

// Import Styles
import styles from '../styles/Home.module.css';

// --- Props Type for the Page ---
interface HomeProps {
  allCompanies: Company[];
}

// --- getStaticProps ---
export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const dataFilePath = path.join(process.cwd(), 'data', 'companies.json');
  const jsonData = fs.readFileSync(dataFilePath, 'utf8');
  const allCompanies: Company[] = JSON.parse(jsonData); // Type assertion

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
  // Type the FlexSearch index state. Store the index configuration type.
  const [searchIndex, setSearchIndex] = useState<FlexSearch.Document<Company, true> | null>(null);
  const [searchResults, setSearchResults] = useState<Set<string> | null>(null); // Stores IDs

  // --- Effects ---
  // Initialize FlexSearch index
  useEffect(() => {
    // Define the index structure matching the Company interface
    const index = new FlexSearch.Document<Company, true>({ // Use 'true' to store the document
      document: {
        id: 'id',
        index: ['name_ar', 'name_en', 'description_ar', 'description_en', 'tags'],
        // We need to tell FlexSearch how to handle the 'tags' array for indexing
        // Option 1: Default (treats array as space-separated string) - Often works okay
        // Option 2: Use a custom encoder/tokenizer if needed for more complex tag scenarios
      },
      tokenize: 'forward', // Adjust tokenizer as needed
      cache: 100,
    });

    allCompanies.forEach(company => index.add(company));
    setSearchIndex(index);
    console.log('FlexSearch index initialized.');
  }, [allCompanies]); // Dependency array

  // Set document lang/dir
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  // --- Event Handlers (Typed) ---
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
        // Search returns enriched results because enrich: true was used in index creation
        const results = await searchIndex.searchAsync(query, { limit: allCompanies.length });
        const matchedIds = new Set<string>();
        // Results structure from searchAsync (without enrich option): Array<{field: string, result: Array<id>}>
        // If index was created with store: true/enrich: true, result items might be document objects.
        // Check FlexSearch docs based on exact index options. Assuming results are IDs here:
        results.forEach(fieldResult => {
            fieldResult.result.forEach(id => {
                matchedIds.add(id.toString()); // Ensure IDs are strings
            });
        });

        setSearchResults(matchedIds);
      } catch (e) {
        console.error("Search failed:", e);
        setSearchResults(new Set());
      }
    }
  }, [searchIndex, allCompanies.length]); // Include dependencies

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

  const downloadJson = useCallback(() => {
    const dataStr = JSON.stringify(allCompanies, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileName = 'companies.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.click();
  }, [allCompanies]);

  // --- Derived State (Filtering Logic) ---
  const filteredCompanies = useMemo(() => {
    let companiesToShow = allCompanies;

    if (searchResults !== null) {
      companiesToShow = companiesToShow.filter(company => searchResults.has(company.id));
    }

    if (activeFilters.size > 0) {
      const filters = Array.from(activeFilters);
      companiesToShow = companiesToShow.filter(company =>
        // only include if **every** active filter is in the company's tags
        filters.every(f => company.tags.includes(f))
      );
    }

    return companiesToShow;
  }, [allCompanies, searchResults, activeFilters]);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    filteredCompanies.forEach(company => {
      company.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [filteredCompanies]);

  // --- Render ---
  const pageTitle = language === 'ar' ? 'بوصلةك | دليل شركات التقنية العربية' : 'Bawsalatuk | Arab Tech Companies Directory';
  const metaDescription = language === 'ar' ? 'دليل مفتوح المصدر لشركات التقنية في العالم العربي' : 'Open-source directory of tech companies in the Arab world';

  return (
    <div className={styles.container}>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
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
            <TagFilter
              tags={availableTags}
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              language={language}
             />
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
                {/* Removed the 'searching' state as searchResults handles it */}
                {/* {searchIndex && searchResults === null && searchQuery && (
                    <p className={styles.loadingOrError}>Searching...</p>
                )} */}

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
                        (searchQuery || activeFilters.size > 0) && (
                             <div className={styles.noResults}>
                                {language === 'ar'
                                ? 'لا توجد نتائج مطابقة للبحث أو التصفية.'
                                : 'No matching results found for your search or filters.'}
                             </div>
                         )
                    )}
                     {allCompanies.length === 0 && (
                         <div className={styles.noResults}>
                            {language === 'ar' ? 'لم يتم تحميل بيانات الشركات.' : 'Company data could not be loaded.'}
                         </div>
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
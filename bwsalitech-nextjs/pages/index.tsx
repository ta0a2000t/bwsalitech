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
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [searchIndex, setSearchIndex] = useState<FlexSearch.Document<Company, true> | null>(null);
  const [searchResults, setSearchResults] = useState<Set<string> | null>(null);

  // --- Effects ---
  useEffect(() => {
    const index = new FlexSearch.Document<Company, true>({
      document: {
        id: 'id',
        index: ['name_ar', 'name_en', 'description_ar', 'description_en', 'tags', 'headquarters'],
      },
      tokenize: 'forward',
      cache: 100,
    });
    allCompanies.forEach(company => index.add(company));
    setSearchIndex(index);
    console.log('FlexSearch index initialized with headquarters.');
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

  const clearAllFilters = useCallback(() => {
      setActiveFilters(new Set());
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

    if (searchResults !== null) {
      companiesToShow = companiesToShow.filter(company => searchResults.has(company.id));
    }

    if (activeFilters.size > 0) {
      const filters = Array.from(activeFilters);
      companiesToShow = companiesToShow.filter(company =>
        filters.every(f => company.tags.includes(f))
      );
    }

    return companiesToShow;
  }, [allCompanies, searchResults, activeFilters]);

  // --- Calculate tag counts based on CURRENTLY VISIBLE companies ---
  const currentVisibleTagsWithCounts = useMemo<TagWithCount[]>(() => {
    const counts: { [tag: string]: number } = {};
    filteredCompanies.forEach(company => {
      company.tags.forEach(tag => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }, [filteredCompanies]);

  // --- Render ---
  const pageTitle = language === 'ar' ? 'بوصلة➝ك | دليل شركات التقنية العربية' : 'Bawsalatuk | Arab Tech Companies Directory';
  const metaDescription = language === 'ar' ? 'دليل مفتوح المصدر لشركات التقنية في العالم العربي' : 'Open-source directory of tech companies in the Arab world';

  // --- MODIFICATION: Use the helper function ---
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
             <div className={styles.searchBar}>
              <input
                type="search"
                value={searchQuery}
                onChange={handleSearchChange}
                className={styles.searchInput}
                placeholder={language === 'ar' ? 'ابحث (شركة، وسم، مقر)...' : 'Search (company, tag, HQ)...'}
                aria-label={language === 'ar' ? 'بحث عن شركة أو وسم أو مقر' : 'Search for company, tag, or headquarters'}
              />
            </div>
            <TagFilter
              tagsWithCounts={currentVisibleTagsWithCounts}
              activeFilters={activeFilters}
              onToggleFilter={toggleFilter}
              onClearFilters={clearAllFilters}
              language={language}
             />
          </div>
        </section>

        <section className={styles.companiesSection}>
            <div className="container">
                {/* --- MODIFICATION: Display the result from the helper function --- */}
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
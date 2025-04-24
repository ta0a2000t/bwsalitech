// Main application code

// Global variables
let companies = [];
let searchIndex = null;
let currentLanguage = 'ar';
let activeFilters = new Set();

// DOM Element References
const appElement = document.getElementById('app');

// Initialize the application
async function initApp() {
  try {
    // Fetch companies data from JSON file
    const response = await fetch('./data/companies.json');
    if (!response.ok) {
      throw new Error(`Failed to fetch companies data: ${response.status} ${response.statusText}`);
    }
    
    companies = await response.json();
    
    // Initialize search index
    initSearchIndex();
    
    // Render the application UI
    renderApp();
    
    // Add event listeners
    setupEventListeners();
    
  } catch (error) {
    renderError(`${error.message}. Please check that data/companies.json exists and is valid JSON.`);
    console.error('Application initialization failed:', error);
  }
}


// Initialize the FlexSearch index for bilingual search
function initSearchIndex() {
    searchIndex = new FlexSearch.Document({
      document: {
        id: "id",
        index: [
          "name_ar", 
          "name_en", 
          "description_ar", 
          "description_en", 
          "tags"
        ]
      },
      tokenize: "forward",
      cache: 100
    });
    
    // Add each company to the search index
    companies.forEach(company => {
      searchIndex.add(company);
    });
  }
// Main render function for the app
// Updated render app function
function renderApp() {
    appElement.innerHTML = `
      <header>
        <div class="container header-content">
          <a href="#" class="logo">بوصلةك</a>
          <button class="language-toggle" id="language-toggle">
            ${currentLanguage === 'ar' ? 'English' : 'العربية'}
          </button>
        </div>
      </header>

      <section class="search-section">
        <div class="container search-container">
          <div class="search-bar">
            <input
              type="text"
              id="search-input"
              class="search-input"
              placeholder="${currentLanguage === 'ar' ? 'ابحث عن شركة...' : 'Search for a company...'}"
              aria-label="${currentLanguage === 'ar' ? 'بحث عن شركة' : 'Search for company'}"
            >
            <!-- Search button removed -->
          </div>

          <div class="tag-filters" id="tag-filters">
            ${renderTagFilters(companies)}
          </div>
        </div>
      </section>

      <section class="companies-section">
        <div class="container">
          <h2 class="company-count" id="company-count">
            ${currentLanguage === 'ar'
              ? `عرض ${companies.length} شركة`
              : `Showing ${companies.length} companies`}
          </h2>

          <div class="companies-grid" id="companies-grid">
            ${renderCompanyCards(companies)}
          </div>
        </div>
      </section>

      <footer>
        <div class="container footer-content">
          <div class="footer-links">
            <a href="https://github.com/bawsalatuk/bawsalatuk" class="footer-link" target="_blank" rel="noopener noreferrer"> {/* Added rel */}
              <i class="fab fa-github"></i> GitHub
            </a>
            <a href="#" class="footer-link" id="download-json">
              <i class="fas fa-download"></i> ${currentLanguage === 'ar' ? 'تنزيل البيانات' : 'Download Data'}
            </a>
          </div>
          <p>
            ${currentLanguage === 'ar'
              ? 'مشروع مفتوح المصدر - ساهم في بوصلتك!' // Example improved text
              : 'Open Source Project - Contribute to Bawsalatuk!'} {/* Example improved text */}
          </p>
        </div>
      </footer>
    `;

    // Make sure we attach the tag listeners after rendering
    attachTagListeners();
}

// Render all available tags as filter buttons
function renderTagFilters(companiesToRender) {
    // Extract all unique tags from the filtered companies
    const allTags = new Set();
    companiesToRender.forEach(company => {
      company.tags.forEach(tag => allTags.add(tag));
    });
    
    // Sort tags alphabetically
    const sortedTags = Array.from(allTags).sort();
    
    // Create HTML for tag filters
    return sortedTags.map(tag => {
      const isActive = activeFilters.has(tag);
      return `
        <button 
          class="tag ${isActive ? 'active' : ''}" 
          data-tag="${tag}"
        >
          ${tag}
        </button>
      `;
    }).join('');
}

function renderLogoImage(logoUrl, companyName) {
    if (!logoUrl) { // Checks if logoUrl is falsy (null, undefined, empty string)
      return ''; // Return empty string if no logo URL - THIS IS GOOD!
    }
  
    // Use company name for alt text if logo exists
    const altText = `${companyName} logo`;
  
    // The onerror handles cases where the URL exists but the image fails to load
    return `
      <img
        src="${logoUrl}"
        alt="${altText}"
        class="company-header-logo"
        loading="lazy"
        decoding="async"
        onerror="this.style.display='none'" // Hide if image fails to load
      />
    `;
  }

function renderCompanyCards(companiesToRender) {
    if (companiesToRender.length === 0) {
      return `
        <div class="no-results">
          ${currentLanguage === 'ar' 
            ? 'لا توجد نتائج مطابقة للبحث أو التصفية.' 
            : 'No matching results found for your search or filters.'}
        </div>
      `;
    }
    
    return companiesToRender.map(company => {
      const name = currentLanguage === 'ar' ? company.name_ar : company.name_en;
      const description = currentLanguage === 'ar' 
        ? company.description_ar 
        : (company.description_en || company.description_ar); // Fallback to AR desc if EN missing
      
      // Generate logo image tag (will be empty string if no logo_url)
      const logoImgTag = renderLogoImage(company.logo_url, name);
  
      return `
        <div class="company-card" data-id="${company.id}">
          <div class="company-info">
            
            <div class="company-header">
              ${logoImgTag} 
              <h3 class="company-name">${name}</h3>
            </div>
  
            <p class="company-desc">${description}</p>
            
            <div class="company-meta">
              <div>
                <i class="fas fa-map-marker-alt"></i> ${company.headquarters || '-'}
              </div>
              <div>
                <i class="fas fa-calendar-alt"></i> ${company.founding_year || '-'}
              </div>
            </div>
            
            <div class="company-tags">
              ${company.tags.map(tag => `
                <span class="company-tag">${tag}</span>
              `).join('')}
            </div>
            
            <div class="company-actions">
              <a href="${company.website}" class="btn btn-primary" target="_blank" rel="noopener noreferrer">
                ${currentLanguage === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
              </a>
              ${company.links && company.links.careers ? `
                <a href="${company.links.careers}" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                  ${currentLanguage === 'ar' ? 'الوظائف' : 'Careers'}
                </a>
              ` : ''}
            </div>
            
            <div class="social-links">
              ${renderSocialLinks(company.links)}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

// Render social media links
function renderSocialLinks(links) {
    if (!links) return '';
    
    const socialIcons = {
      twitter: 'fab fa-twitter',
      linkedin: 'fab fa-linkedin',
      facebook: 'fab fa-facebook',
      instagram: 'fab fa-instagram',
      github: 'fab fa-github',
      blog: 'fas fa-blog'
      // Add other platforms if needed
    };
    
    let html = '';
    
    for (const [platform, url] of Object.entries(links)) {
      // Exclude keys that are not social platforms (like 'careers')
      if (socialIcons[platform]) { 
        html += `
          <a href="${url}" class="social-link" target="_blank" rel="noopener noreferrer" title="${platform}">
            <i class="${socialIcons[platform]}"></i>
          </a>
        `;
      }
    }
    
    return html;
  }
  
  
  


// Set up all event listeners
function setupEventListeners() {
    // Language toggle
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', toggleLanguage);
    }

    // Search input - CHANGED HERE
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      // Use 'input' event and debounce handleSearch
      searchInput.addEventListener('input', debounce(handleSearch, 300));
      // Removed keypress listener for Enter, as it's now live
    }

    // Search button listener removed
    // const searchButton = document.getElementById('search-button');
    // if (searchButton) {
    //   searchButton.addEventListener('click', () => handleSearch());
    // }

    // Tag filters - We handle this with attachTagListeners() now
    attachTagListeners();

    // Download JSON
    const downloadJson = document.getElementById('download-json');
    if (downloadJson) {
      downloadJson.addEventListener('click', downloadCompaniesJson);
    }
  }

// Toggle between Arabic and English
function toggleLanguage() {
  currentLanguage = currentLanguage === 'ar' ? 'en' : 'ar';
  document.documentElement.setAttribute('lang', currentLanguage);
  document.documentElement.setAttribute('dir', currentLanguage === 'ar' ? 'rtl' : 'ltr');
  renderApp();
}

// Search functionality
function handleSearch() {
    const searchInput = document.getElementById('search-input');
    // Ensure searchInput exists before accessing value (robustness)
    const query = searchInput ? searchInput.value.trim() : '';

    // console.log(`Searching for: "${query}"`); // Add for debugging if needed

    // If query is empty, show all companies filtered by active tags
    if (!query) {
      renderFilteredCompanies(); // This already handles tag filtering
      return;
    }

    // Search in the FlexSearch index
    // Added limit for potentially better perceived performance if index gets large
    searchIndex.searchAsync(query, { enrich: true, limit: 50 }) // Using searchAsync is slightly better practice
      .then(results => {
          // Flatten and deduplicate results
          const matchedIds = new Set();
          // Flexsearch structure for enrich: true is [{ field: "name_ar", result: [{id: "...", doc: {...}}, ...] }, ...]
          results.forEach(fieldResult => {
              fieldResult.result.forEach(docInfo => {
                  matchedIds.add(docInfo.id);
              });
          });

          // Filter companies based on *both* search results and active tag filters
          const searchFilteredCompanies = companies.filter(company => matchedIds.has(company.id));

          // Now apply tag filters *to the search results*
          const finalFilteredCompanies = activeFilters.size === 0
              ? searchFilteredCompanies // No tags active, show all search results
              : searchFilteredCompanies.filter(company =>
                  company.tags.some(tag => activeFilters.has(tag))
              );

          // Update tag filters based ONLY on the companies matching the current search+tag filters
          const tagFiltersElement = document.getElementById('tag-filters');
          if (tagFiltersElement) {
              tagFiltersElement.innerHTML = renderTagFilters(finalFilteredCompanies); // Render tags based on currently visible companies
              attachTagListeners(); // Re-attach listeners to new tag buttons
          }

          // Update the company count
          updateCompanyCount(finalFilteredCompanies.length);

          // Render the filtered company cards
          const companiesGrid = document.getElementById('companies-grid');
          if (companiesGrid) {
              companiesGrid.innerHTML = renderCompanyCards(finalFilteredCompanies);
          }
      }).catch(error => {
          console.error('Search error:', error);
          renderError('An error occurred during search. Please try again.');
      });
}

// Handle tag filtering
function handleTagFilter(event) {
  const tagButton = event.target.closest('.tag');
  if (!tagButton) return;
  
  const tag = tagButton.dataset.tag;
  
  if (activeFilters.has(tag)) {
    // Remove tag from active filters
    activeFilters.delete(tag);
    tagButton.classList.remove('active');
  } else {
    // Add tag to active filters
    activeFilters.add(tag);
    tagButton.classList.add('active');
  }
  
  // Re-render the companies with the updated filters
  renderFilteredCompanies();
}

// Unified rendering function for filtered companies
// IMPORTANT: This function needs to respect the current search query if there is one.
function renderFilteredCompanies() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.trim() : '';

    // If there's an active search query, re-run the search logic
    // because handleTagFilter might call this function.
    if (query) {
        handleSearch(); // Re-trigger search to apply tags correctly to search results
        return;
    }

    // --- Code below only runs if search query is empty ---

    let filteredCompanies;

    if (activeFilters.size === 0) {
        // No active filters, show all companies
        filteredCompanies = companies;
    } else {
        // Filter companies by active tags
        filteredCompanies = companies.filter(company =>
            company.tags.some(tag => activeFilters.has(tag))
        );
    }

    // Update tag filters based on filtered companies (relevant when search is empty)
    const tagFiltersElement = document.getElementById('tag-filters');
    if (tagFiltersElement) {
        // When search is empty, render tags based on the tag-filtered list
        tagFiltersElement.innerHTML = renderTagFilters(filteredCompanies);
        attachTagListeners(); // Re-attach tag event listeners
    }

    // Update company count
    updateCompanyCount(filteredCompanies.length);

    // Render filtered companies
    const companiesGrid = document.getElementById('companies-grid');
    if (companiesGrid) {
        companiesGrid.innerHTML = renderCompanyCards(filteredCompanies);
    }
}

// Update the company count display
function updateCompanyCount(count) {
  const companyCountElement = document.getElementById('company-count');
  if (companyCountElement) {
    companyCountElement.textContent = currentLanguage === 'ar' 
      ? `عرض ${count} شركة` 
      : `Showing ${count} companies`;
  }
}

// Download the companies JSON file
function downloadCompaniesJson(event) {
  event.preventDefault();
  
  const dataStr = JSON.stringify(companies, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
  
  const exportFileName = 'companies.json';
  
  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileName);
  linkElement.click();
}

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Render error state
function renderError(message) {
  appElement.innerHTML = `
    <div class="error-container">
      <h2>${currentLanguage === 'ar' ? 'حدث خطأ' : 'An Error Occurred'}</h2>
      <p>${message}</p>
      <button onClick="location.reload()" class="btn btn-primary">
        ${currentLanguage === 'ar' ? 'إعادة المحاولة' : 'Try Again'}
      </button>
    </div>
  `;
}
// Helper function to attach tag event listeners
function attachTagListeners() {
    const tagButtons = document.querySelectorAll('.tag');
    tagButtons.forEach(button => {
      button.addEventListener('click', handleTagFilter);
    });
}
// Initialize the app when the document is loaded
document.addEventListener('DOMContentLoaded', initApp);
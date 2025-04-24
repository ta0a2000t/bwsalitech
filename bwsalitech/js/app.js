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
// Fixed FlexSearch initialization
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
            >
            <button class="search-button" id="search-button">
              <i class="fas fa-search"></i>
            </button>
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
            <a href="https://github.com/yourusername/bawsalatuk" class="footer-link" target="_blank">
              <i class="fab fa-github"></i> GitHub
            </a>
            <a href="#" class="footer-link" id="download-json">
              <i class="fas fa-download"></i> ${currentLanguage === 'ar' ? 'تنزيل البيانات' : 'Download Data'}
            </a>
          </div>
          <p>
            ${currentLanguage === 'ar' 
              ? 'مشروع مفتوح المصدر - شارك بمعلومات عن شركة' 
              : 'Open Source Project - Contribute Company Information'}
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

function renderLogo(name, logoUrl) {
    const placeholderUrl = `https://via.placeholder.com/150?text=${encodeURIComponent(name)}`;
    
    return `
      <div class="company-logo">
        <picture>
          <source srcset="${logoUrl || ''}" />
          <img
            src="${placeholderUrl}"
            alt="${name} logo"
            loading="lazy"
            decoding="async"
          />
        </picture>
      </div>
    `;
  }

// Updated company card rendering function with the improved logo handling
function renderCompanyCards(companiesToRender) {
    if (companiesToRender.length === 0) {
      return `
        <div class="no-results">
          ${currentLanguage === 'ar' 
            ? 'لا توجد نتائج مطابقة للبحث.' 
            : 'No matching results found.'}
        </div>
      `;
    }
    
    return companiesToRender.map(company => {
      const name = currentLanguage === 'ar' ? company.name_ar : company.name_en;
      const description = currentLanguage === 'ar' 
        ? company.description_ar 
        : (company.description_en || company.description_ar);
      
      return `
        <div class="company-card" data-id="${company.id}">
          ${renderLogo(name, company.logo_url)}
          <div class="company-info">
            <h3 class="company-name">${name}</h3>
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
              <a href="${company.website}" class="btn btn-primary" target="_blank">
                ${currentLanguage === 'ar' ? 'زيارة الموقع' : 'Visit Website'}
              </a>
              ${company.links && company.links.careers ? `
                <a href="${company.links.careers}" class="btn btn-secondary" target="_blank">
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
  };
  
  let html = '';
  
  for (const [platform, url] of Object.entries(links)) {
    if (platform !== 'careers' && socialIcons[platform]) {
      html += `
        <a href="${url}" class="social-link" target="_blank" title="${platform}">
          <i class="${socialIcons[platform]}"></i>
        </a>
      `;
    }
  }
  
  return html;
}

// Set up all event listeners
// Updated event listeners setup
function setupEventListeners() {
    // Language toggle
    const languageToggle = document.getElementById('language-toggle');
    if (languageToggle) {
      languageToggle.addEventListener('click', toggleLanguage);
    }
    
    // Search input
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (searchInput) {
      searchInput.addEventListener('input', debounce(handleSearch, 300));
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          handleSearch();
        }
      });
    }
    
    if (searchButton) {
      searchButton.addEventListener('click', () => handleSearch());
    }
    
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
    const query = searchInput ? searchInput.value.trim() : '';
    
    if (!query) {
      // If query is empty, show all companies (filtered by tags if any)
      renderFilteredCompanies();
      return;
    }
    
    // Search in the FlexSearch index
    searchIndex.search(query, { enrich: true }).then(results => {
      // Flatten and deduplicate results
      const matchedIds = new Set();
      results.forEach(resultGroup => {
        resultGroup.result.forEach(match => {
          matchedIds.add(match.id);
        });
      });
      
      // Filter companies by search results and active tag filters
      const filteredCompanies = companies.filter(company => {
        const matchesSearch = matchedIds.has(company.id);
        const matchesTagFilters = activeFilters.size === 0 || 
          company.tags.some(tag => activeFilters.has(tag));
        
        return matchesSearch && matchesTagFilters;
      });
      
      // Update tag filters based on filtered companies
      const tagFiltersElement = document.getElementById('tag-filters');
      if (tagFiltersElement) {
        tagFiltersElement.innerHTML = renderTagFilters(filteredCompanies);
        // Re-attach tag event listeners
        attachTagListeners();
      }
      
      // Update the company count
      updateCompanyCount(filteredCompanies.length);
      
      // Render the filtered company cards
      const companiesGrid = document.getElementById('companies-grid');
      if (companiesGrid) {
        companiesGrid.innerHTML = renderCompanyCards(filteredCompanies);
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
function renderFilteredCompanies() {
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
    
    // Update tag filters based on filtered companies
    const tagFiltersElement = document.getElementById('tag-filters');
    if (tagFiltersElement) {
      tagFiltersElement.innerHTML = renderTagFilters(filteredCompanies);
      // Re-attach tag event listeners
      attachTagListeners();
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
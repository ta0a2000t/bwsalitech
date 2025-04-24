# Contributing to بوصلةك (Bwsalitech )

Thank you for your interest in contributing to بوصلةك! This document provides guidelines and instructions for contributing to the project.

## Ways to Contribute

1. **Add a new company**: Add information about a tech company in the Arab world
2. **Update existing information**: Correct or update information about companies already in the directory
3. **Improve the code**: Enhance the website functionality, design, or fix bugs
4. **Translate content**: Help improve translations between Arabic and English

## Adding or Updating a Company

To add a new company or update an existing one:

1. Fork the repository
2. Make your changes to `data/companies.json`
3. Submit a pull request

### Company Data Format

Each company entry must follow this format:

```json
{
  "id": "unique-company-id",
  "name_ar": "اسم الشركة بالعربية",
  "name_en": "Company Name in English",
  "website": "https://company-website.com",
  "type": "private",
  "description_ar": "وصف الشركة بالعربية",
  "description_en": "Company description in English",
  "tags": ["Country", "industry", "size"],
  "logo_url": "https://company-website.com/logo.png",
  "founding_year": 2020,
  "headquarters": "City",
  "links": {
    "careers": "https://company-website.com/careers",
    "twitter": "https://twitter.com/company",
    "linkedin": "https://linkedin.com/company/company-name"
  }
}
```

### Required Fields

The following fields are required:
- `id`: A unique, URL-friendly identifier (lowercase, hyphens instead of spaces)
- `name_ar`: Company name in Arabic
- `name_en`: Company name in English
- `website`: Official company website URL
- `type`: Either "private" or "government"
- `description_ar`: Brief company description in Arabic (max 140 characters)
- `tags`: Array of relevant tags (see Tag Guidelines below)

### Optional Fields

The following fields are optional but recommended:
- `description_en`: Brief company description in English
- `logo_url`: URL to the company logo (square format preferred)
- `founding_year`: Year the company was founded
- `headquarters`: City where the company is headquartered
- `links`: Object containing additional company links

### Tag Guidelines

Please use the following guidelines for tags:
- Include the country as the first tag (e.g., "Saudi Arabia", "UAE", "Egypt")
- Include industry category (e.g., "fintech", "healthtech", "edtech")
- Include company size/stage if known (e.g., "startup", "established", "enterprise")

## Code of Conduct

- Be respectful and inclusive in your contributions
- Provide accurate information from reliable sources
- Do not include any confidential or sensitive information
- Focus on tech companies in the Arab world

## Pull Request Process

1. Ensure your changes follow the JSON schema
2. Update the README.md if necessary
3. Your pull request will be reviewed by maintainers
4. Automatic validation tests will check your JSON format
5. Once approved, your changes will be merged

## Questions?

If you have any questions about contributing, please open an issue or contact the maintainers at [your-email@example.com](mailto:your-email@example.com).

Thank you for helping build بوصلةك into a valuable resource for the Arab tech community!
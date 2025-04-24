# بوصلةك (Bwsalitech ) - Tech Companies Directory

بوصلةك (Your Compass) is an open-source directory of technology companies in the Arab world. The project aims to create a comprehensive, community-maintained resource for job seekers, investors, and anyone interested in the Arab tech ecosystem.

## 🌟 Features

- Bilingual support (Arabic/English)
- Advanced search capabilities
- Tag-based filtering
- Responsive design for all devices
- Community-driven content

## 🚀 Quick Start

You can view the live directory at: [https://yourusername.github.io/bwsalitech ](https://yourusername.github.io/bwsalitech )

### Running Locally

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/bwsalitech .git
   cd bwsalitech 
   ```

2. Open `index.html` in your browser
   ```bash
   # If you have Python installed
   python -m http.server
   # Then open http://localhost:8000 in your browser
   ```

## 📊 Data Structure

Companies are stored in `data/companies.json` with the following structure:

```json
{
  "id": "company-id",
  "name_ar": "اسم الشركة بالعربية",
  "name_en": "Company Name in English",
  "website": "https://company-website.com",
  "type": "private or government",
  "description_ar": "وصف الشركة بالعربية",
  "description_en": "Company description in English",
  "tags": ["Saudi Arabia", "fintech", "established"],
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

## 🤝 Contributing

We welcome contributions from everyone! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to add or update company information.

### Adding a Company

1. Fork the repository
2. Add company information to `data/companies.json`
3. Submit a pull request

Your submission will be automatically validated against our schema.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- Everyone who has contributed companies to the directory
- The Arab tech community for inspiration

## 📬 Contact

If you have any questions or suggestions, please open an issue or reach out to [your-email@example.com](mailto:your-email@example.com).
// bwsalitech-nextjs/data/schema.md
```json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "title": "Bawsalatuk Company Data",
    "description": "Schema for the list of tech companies in companies.json.",
    "type": "array",
    "items": {
      "type": "object",
      "required": [
          "id",
          "name_ar",
          "name_en",
          "website",
          "type",
          "description_ar",
          "industry",
          "subindustry",
          "tags"
       ],
      "properties": {
        "id": {
             "type": "string",
             "description": "Unique identifier for the company (e.g., 'tabby'). Should be URL-safe."
        },
        "name_ar": { "type": "string", "description": "Company name in Arabic." },
        "name_en": { "type": "string", "description": "Company name in English." },
        "website": {
             "type": "string",
             "format": "uri",
             "description": "Company's primary website URL (must start with http:// or https://)."
        },
        "type": {
            "type": "string",
            "enum": ["private", "government"],
            "description": "Company type."
        },
        "description_ar": {
            "type": "string",
            "description": "Company description in Arabic."
        },
        "industry": {
          "description": "Primary industry classification as a [English, Arabic] tuple. The specific allowed pairs are defined and validated by the application logic (see utils/industries.ts).",
          "type": "array",
          "minItems": 2,
          "maxItems": 2,
          "items": { "type": "string" }
        },
        "subindustry": {
          "description": "Specific sub-industry classification as a [English, Arabic] tuple. The specific allowed pairs are defined and validated by the application logic (see utils/industries.ts).",
           "type": "array",
           "minItems": 2,
           "maxItems": 2,
           "items": { "type": "string" }
        },
        "description_en": {
            "type": ["string", "null"],
            "description": "Optional company description in English."
        },
        "tags": {
            "type": "array",
            "items": { "type": "string" },
            "description": "Relevant keywords or tags (e.g., location, focus area, stage). Must be an array of strings."
         },
        "logo_path": {
            "type": ["string", "null"],
            "pattern": "^/logos/.*\\.(png|jpg|jpeg|svg)$",
            "description": "Optional path to a logo file within the project's public/logos directory (e.g., /logos/tabby.png)."
            },
        "founding_year": {
            "type": ["integer", "null"],
            "description": "Optional year the company was founded (e.g., 2019). Must be a valid year number."
         },
        "headquarters": {
            "type": ["string", "null"],
            "description": "Optional location of the company's headquarters (e.g., 'Dammam')."
        },
        "links": {
          "type": ["object", "null"],
          "properties": {
            "careers": { "type": "string", "format": "uri" },
            "twitter": { "type": "string", "format": "uri" },
            "linkedin": { "type": "string", "format": "uri" },
            "instagram": { "type": "string", "format": "uri" },
            "github": { "type": "string", "format": "uri" },
            "blog": { "type": "string", "format": "uri" }
          },
          "additionalProperties": false, // Disallow other keys like 'medium', 'crunchbase' unless added here
          "description": "Optional object containing URLs to various company profiles or pages. All values must be valid URLs."
        }
      },
       "additionalProperties": false // Disallow any properties not explicitly defined above
    }
  }
``` json
{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "array",
    "items": {
      "type": "object",
      "required": ["id", "name_ar", "name_en", "website", "type", "description_ar", "industry", "subindustry", "tags"],
      "properties": {
        "id": { "type": "string" },
        "name_ar": { "type": "string" },
        "name_en": { "type": "string" },
        "website": { "type": "string", "format": "uri" },
        "type": { "type": "string", "enum": ["private", "government"] },
        "description_ar": { "type": "string" },
        "industry": {
          "type": "string",
          "enum": [
            "Fintech",
            "Foodtech",
            "Ecommerce & Retail",
            "Logistics & Delivery",
            "Telecommunications",
            "Software & IT Services",
            "Media & Entertainment",
            "Healthcare Tech",
            "Real Estate Tech (PropTech)",
            "Education Tech (EdTech)",
            "Travel & Hospitality Tech",
            "Energy & Utilities Tech",
            "Automotive Tech",
            "HR Tech",
            "Legal Tech",
            "Government Tech"
          ]
        },
        "subindustry": {
          "type": "string",
          "enum": [
            "Payments", "Lending", "Buy Now Pay Later (BNPL)", "Insurtech", "Wealth Management", "Banking Infrastructure",
            "Food Delivery", "Restaurant Tech", "Grocery Tech", "Food Production Tech",
            "Online Marketplace", "Retail Tech", "Direct-to-Consumer (DTC)",
            "Last-Mile Delivery", "Freight & Shipping", "Supply Chain Management", "Warehousing Tech",
            "Telecom Infrastructure", "Mobile Services", "Internet Service Provider (ISP)",
            "Cloud Computing", "Cybersecurity", "SaaS (Software as a Service)", "IT Consulting & Services", "Data Analytics & BI", "AI & Machine Learning",
            "Streaming Services", "Gaming", "Digital Media", "Social Media",
            "Digital Health Platforms", "Telemedicine", "Health & Wellness Apps",
            "Property Management Software", "Real Estate Marketplace", "Construction Tech",
            "Online Learning Platforms", "EdTech Tools & Services",
            "Booking Platforms", "Hospitality Management Software",
            "Renewable Energy Tech", "Smart Grid Solutions",
            "Electric Vehicles (EV) & Charging", "Autonomous Driving",
            "Recruitment & Talent Acquisition", "Employee Management",
            "Contract Management", "Legal Research",
            "Civic Engagement Platforms", "Public Sector Software"
          ]
        },
        "description_en": { "type": "string" },
        "tags": { "type": "array", "items": { "type": "string" } },
        "logo_path": {
            "type": "string",
            "pattern": "^/logos/.*\\.(png|jpg|jpeg|svg)$"
            },
        "founding_year": { "type": "integer" },
        "headquarters": { "type": "string" },
        "links": {
          "type": "object",
          "properties": {
            "careers": { "type": "string", "format": "uri" },
            "twitter": { "type": "string", "format": "uri" },
            "linkedin": { "type": "string", "format": "uri" },
            "facebook": { "type": "string", "format": "uri" },
            "instagram": { "type": "string", "format": "uri" },
            "github": { "type": "string", "format": "uri" },
            "blog": { "type": "string", "format": "uri" }
          },
          "additionalProperties": false
        }
      }
    }
  }
``` json


{
    "$schema": "http://json-schema.org/draft-07/schema#",
    "type": "array",
    "items": {
      "type": "object",
      "required": ["id", "name_ar", "name_en", "website", "type", "description_ar", "tags"],
      "properties": {
        "id": { "type": "string" },
        "name_ar": { "type": "string" },
        "name_en": { "type": "string" },
        "website": { "type": "string", "format": "uri" },
        "type": { "type": "string", "enum": ["private", "government"] },
        "description_ar": { "type": "string" },
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

```

Note: logo_url is optional. If you’ve specified company.logo_url, it’s used. Otherwise you’ll automatically surface the site’s favicon from Google’s S2 service.
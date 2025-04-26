// bwsalitech-nextjs/interfaces/index.ts

export interface CompanyLinks {
  careers?: string;
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  github?: string;
  blog?: string;
  // Add other potential link types if needed
}

// --- Main Company Interface ---
// Uses a simple tuple type [string, string] for industry/subindustry.
// The actual allowed pairs are enforced by the validation logic using
// the constant arrays in `utils/industries.ts`.
export interface Company {
  id: string;
  name_ar: string;
  name_en: string;
  website: string;
  type: 'private' | 'government'; // Use specific string literals
  description_ar: string;
  industry: [string, string];      // [English, Arabic]
  subindustry: [string, string];   // [English, Arabic]
  description_en?: string;         // Optional
  tags: string[];
  logo_path?: string;              // Optional
  founding_year?: number;          // Optional
  headquarters?: string;           // Optional
  links?: CompanyLinks;            // Optional, uses the interface above
}

// Define valid language codes
export type Language = 'ar' | 'en';

// Optional: Define types for English names just for documentation/reference
// These are not strictly enforced by the Company interface itself anymore.
export type EnglishIndustryRef = string;
export type EnglishSubIndustryRef = string;
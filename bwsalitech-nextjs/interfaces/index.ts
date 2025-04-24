// Define the structure of your company data
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
  
  export interface Company {
    id: string;
    name_ar: string;
    name_en: string;
    website: string;
    type: 'private' | 'government'; // Use specific string literals
    description_ar: string;
    description_en?: string; // Optional
    tags: string[];
    logo_url?: string; // Optional
    founding_year?: number; // Optional
    headquarters?: string; // Optional
    links?: CompanyLinks; // Optional, uses the interface above
  }
  
  // Define valid language codes
  export type Language = 'ar' | 'en';
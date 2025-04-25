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

// --- NEW: Define fixed lists as string literal unions ---
export type Industry =
  | 'Fintech'
  | 'Foodtech'
  | 'Ecommerce & Retail'
  | 'Logistics & Delivery'
  | 'Telecommunications'
  | 'Software & IT Services'
  | 'Media & Entertainment'
  | 'Healthcare Tech'
  | 'Real Estate Tech (PropTech)'
  | 'Education Tech (EdTech)'
  | 'Travel & Hospitality Tech'
  | 'Energy & Utilities Tech'
  | 'Automotive Tech'
  | 'HR Tech'
  | 'Legal Tech'
  | 'Government Tech';

export type SubIndustry =
  | 'Payments' | 'Lending' | 'Buy Now Pay Later (BNPL)' | 'Insurtech' | 'Wealth Management' | 'Banking Infrastructure'
  | 'Food Delivery' | 'Restaurant Tech' | 'Grocery Tech' | 'Food Production Tech'
  | 'Online Marketplace' | 'Retail Tech' | 'Direct-to-Consumer (DTC)'
  | 'Last-Mile Delivery' | 'Freight & Shipping' | 'Supply Chain Management' | 'Warehousing Tech'
  | 'Telecom Infrastructure' | 'Mobile Services' | 'Internet Service Provider (ISP)'
  | 'Cloud Computing' | 'Cybersecurity' | 'SaaS (Software as a Service)' | 'IT Consulting & Services' | 'Data Analytics & BI' | 'AI & Machine Learning'
  | 'Streaming Services' | 'Gaming' | 'Digital Media' | 'Social Media'
  | 'Digital Health Platforms' | 'Telemedicine' | 'Health & Wellness Apps'
  | 'Property Management Software' | 'Real Estate Marketplace' | 'Construction Tech'
  | 'Online Learning Platforms' | 'EdTech Tools & Services'
  | 'Booking Platforms' | 'Hospitality Management Software'
  | 'Renewable Energy Tech' | 'Smart Grid Solutions'
  | 'Electric Vehicles (EV) & Charging' | 'Autonomous Driving'
  | 'Recruitment & Talent Acquisition' | 'Employee Management'
  | 'Contract Management' | 'Legal Research'
  | 'Civic Engagement Platforms' | 'Public Sector Software';

export interface Company {
  id: string;
  name_ar: string;
  name_en: string;
  website: string;
  type: 'private' | 'government'; // Use specific string literals
  description_ar: string;
  industry: Industry; // --- NEW: Required industry ---
  subindustry: SubIndustry; // --- NEW: Required subindustry ---
  description_en?: string; // Optional
  tags: string[];
  logo_path?: string; // Optional
  founding_year?: number; // Optional
  headquarters?: string; // Optional
  links?: CompanyLinks; // Optional, uses the interface above
}

// Define valid language codes
export type Language = 'ar' | 'en';
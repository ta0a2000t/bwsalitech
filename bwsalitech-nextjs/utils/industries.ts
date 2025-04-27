// bwsalitech-nextjs/utils/industries.ts

import type { Company } from '../interfaces'; // Import Company type for the type predicate

// --- Allowed Industries (Array of tuples - Single Source of Truth) ---
export const ALLOWED_INDUSTRIES: ReadonlyArray<[string, string]> = [
    ["Fintech", "التقنية المالية"]
    ,
    ["Foodtech", "تقنية الأغذية"]
    ,
    ["Ecommerce & Retail", "التجارة الإلكترونية وتجارة التجزئة"]
    ,
    ["Logistics & Delivery", "الخدمات اللوجستية والتوصيل"]
    ,
    ["Telecommunications", "الاتصالات"]
    ,
    ["Software & IT Services", "البرمجيات وخدمات تكنولوجيا المعلومات"]
    ,
    ["Media & Entertainment", "الإعلام والترفيه"]
    ,
    ["Healthcare Tech", "تقنية الرعاية الصحية"]
    ,
    ["Real Estate Tech (PropTech)", "تقنية العقارات"]
    ,
    ["Education Tech (EdTech)", "تقنية التعليم"]
    ,
    ["Travel & Hospitality Tech", "تقنية السفر والضيافة"]
    ,
    ["Energy & Utilities Tech", "تقنية الطاقة والمرافق"]
    ,
    ["Automotive Tech", "تقنية السيارات"]
    ,
    ["HR Tech", "تقنية الموارد البشرية"]
    ,
    ["Legal Tech", "التقنية القانونية"]
    ,
    ["Government Tech", "تقنية الحكومة"]
    ,
    ["AgriTech", "التقنية الزراعية"]

];

// --- Allowed Sub-Industries (Array of tuples - Single Source of Truth) ---
export const ALLOWED_SUBINDUSTRIES: ReadonlyArray<[string, string]> = [
    ["Payments", "المدفوعات"]
    ,
    ["Lending", "الإقراض"]
    ,
    ["Buy Now Pay Later (BNPL)", "اشتر الآن وادفع لاحقاً"]
    ,
    ["Insurtech", "التقنية التأمينية"]
    ,
    ["Wealth Management", "إدارة الثروات"]
    ,
    ["Banking Infrastructure", "بنية تحتية مصرفية"]
    ,
    ["Food Delivery", "توصيل الطعام"]
    ,
    ["Restaurant Tech", "تقنية المطاعم"]
    ,
    ["Grocery Tech", "تقنية البقالة"]
    ,
    ["Food Production Tech", "تقنية إنتاج الغذاء"]
    ,
    ["Online Marketplace", "السوق الإلكتروني"]
    ,
    ["Retail Tech", "تقنية تجارة التجزئة"]
    ,
    ["Direct-to-Consumer (DTC)", "البيع المباشر للمستهلك"]
    ,
    ["Last-Mile Delivery", "التوصيل للمرحلة الأخيرة"]
    ,
    ["Freight & Shipping", "الشحن والنقل"]
    ,
    ["Supply Chain Management", "إدارة سلسلة الإمداد"]
    ,
    ["Warehousing Tech", "تقنية التخزين"]
    ,
    ["Telecom Infrastructure", "بنية تحتية للاتصالات"]
    ,
    ["Mobile Services", "الخدمات المتنقلة"]
    ,
    ["Internet Service Provider (ISP)", "مزود خدمة الإنترنت"]
    ,
    ["Cloud Computing", "الحوسبة السحابية"]
    ,
    ["Cybersecurity", "الأمن السيبراني"]
    ,
    ["SaaS (Software as a Service)", "البرمجيات كخدمة"]
    ,
    ["IT Consulting & Services", "استشارات وخدمات تكنولوجيا المعلومات"]
    ,
    ["Data Analytics & BI", "تحليلات البيانات والاستخبارات التجارية"]
    ,
    ["AI & Machine Learning", "الذكاء الاصطناعي وتعلم الآلة"]
    ,
    ["Streaming Services", "خدمات البث"]
    ,
    ["Gaming", "الألعاب الإلكترونية"]
    ,
    ["Digital Media", "الإعلام الرقمي"]
    ,
    ["Social Media", "وسائل التواصل الاجتماعي"]
    ,
    ["Digital Health Platforms", "منصات الصحة الرقمية"]
    ,
    ["Telemedicine", "الطب عن بعد"]
    ,
    ["Health & Wellness Apps", "تطبيقات الصحة والعافية"]
    ,
    ["Property Management Software", "برمجيات إدارة الممتلكات"]
    ,
    ["Real Estate Marketplace", "سوق العقارات"]
    ,
    ["Construction Tech", "تقنية البناء"]
    ,
    ["Online Learning Platforms", "منصات التعلم الإلكتروني"]
    ,
    ["EdTech Tools & Services", "أدوات وخدمات التعليم الرقمي"]
    ,
    ["Booking Platforms", "منصات الحجز"]
    ,
    ["Hospitality Management Software", "برمجيات إدارة الضيافة"]
    ,
    ["Renewable Energy Tech", "تقنية الطاقة المتجددة"]
    ,
    ["Smart Grid Solutions", "حلول الشبكة الذكية"]
    ,
    ["Electric Vehicles (EV) & Charging", "المركبات الكهربائية وشحنها"]
    ,
    ["Autonomous Driving", "القيادة الذاتية"]
    ,
    ["Recruitment & Talent Acquisition", "التوظيف واكتساب المواهب"]
    ,
    ["Employee Management", "إدارة الموظفين"]
    ,
    ["Contract Management", "إدارة العقود"]
    ,
    ["Legal Research", "البحث القانوني"]
    ,
    ["Civic Engagement Platforms", "منصات المشاركة المدنية"]
    ,
    ["Public Sector Software", "برمجيات القطاع العام"]
];

// --- Allowed Headquarters (MENA Countries - Array of tuples) ---
// List can be expanded/refined as needed
export const ALLOWED_HEADQUARTERS: ReadonlyArray<[string, string]> = [
    ["Algeria", "الجزائر"]
    ,
    ["Bahrain", "البحرين"]
    ,
    ["Comoros", "جزر القمر"]
    ,
    ["Djibouti", "جيبوتي"]
    ,
    ["Egypt", "مصر"]
    ,
    ["Iraq", "العراق"]
    ,
    ["Jordan", "الأردن"]
    ,
    ["Kuwait", "الكويت"]
    ,
    ["Lebanon", "لبنان"]
    ,
    ["Libya", "ليبيا"]
    ,
    ["Mauritania", "موريتانيا"]
    ,
    ["Morocco", "المغرب"]
    ,
    ["Oman", "عُمان"]
    ,
    ["Palestine", "فلسطين"]
    ,
    ["Qatar", "قطر"]
    ,
    ["Saudi Arabia", "المملكة العربية السعودية"]
    ,
    ["Somalia", "الصومال"]
    ,
    ["Sudan", "السودان"]
    ,
    ["Syria", "سوريا"]
    ,
    ["Tunisia", "تونس"]
    ,
    ["United Arab Emirates", "الإمارات العربية المتحدة"]
    ,
    ["Yemen", "اليمن"]
    // Add other relevant MENA countries if necessary
];


// --- Helper Function to Check Tuple Validity (Runtime Check) ---
// Checks structure and if the pair exists in the allowed list
function isTupleAllowed(
    tuple: any,
    allowedList: ReadonlyArray<[string, string]>
): tuple is [string, string] { // Type predicate helps downstream
    if (!Array.isArray(tuple) || tuple.length !== 2 || typeof tuple[0] !== 'string' || typeof tuple[1] !== 'string') {
        return false; // Basic structure check
    }
    // Check if the exact tuple exists in the allowed list
    return allowedList.some(allowedTuple => allowedTuple[0] === tuple[0] && allowedTuple[1] === tuple[1]);
}

// --- Helper Function to Check if a string value exists in any tuple within a list ---
function isValueInAllowedTuples(
    value: any,
    allowedList: ReadonlyArray<[string, string]>
): value is string {
    if (typeof value !== 'string') {
        return false;
    }
    // Check if the value matches either the English or Arabic name in any tuple
    return allowedList.some(tuple => tuple[0] === value || tuple[1] === value);
}


// --- Validation Function for a Single Company (Updated for Headquarters) ---
// Returns a type predicate asserting the object conforms to the Company interface
export function validateCompanySchema(company: any): company is Company {
    const requiredFields = ["id", "name_ar", "name_en", "website", "type", "description_ar", "industry", "subindustry", "tags"];
    for (const field of requiredFields) {
        if (company[field] === undefined || company[field] === null) {
            console.warn(`Validation Failed: Company ${company.id || 'UNKNOWN'} missing required field '${field}'.`);
            return false;
        }
    }

    // Validate industry tuple using the allowed list
    if (!isTupleAllowed(company.industry, ALLOWED_INDUSTRIES)) {
        console.warn(`Validation Failed: Company ${company.id} has invalid 'industry' tuple: ${JSON.stringify(company.industry)}. Check allowed pairs in utils/industries.ts.`);
        return false;
    }

    // Validate subindustry tuple using the allowed list
    if (!isTupleAllowed(company.subindustry, ALLOWED_SUBINDUSTRIES)) {
        console.warn(`Validation Failed: Company ${company.id} has invalid 'subindustry' tuple: ${JSON.stringify(company.subindustry)}. Check allowed pairs in utils/industries.ts.`);
        return false;
    }

    // Other checks (website format, type enum, tags array)
    if (typeof company.website !== 'string' || !(company.website.startsWith('http://') || company.website.startsWith('https://'))) {
         console.warn(`Validation Failed: Company ${company.id} has invalid 'website' format: ${company.website}`);
         return false;
    }
     if (company.type !== 'private' && company.type !== 'government') {
         console.warn(`Validation Failed: Company ${company.id} has invalid 'type': ${company.type}`);
         return false;
    }
    if (!Array.isArray(company.tags)) {
        console.warn(`Validation Failed: Company ${company.id} has invalid 'tags' (must be an array).`);
        return false;
    }
    // Optionally check if all tags are strings
    if (!company.tags.every((tag: any) => typeof tag === 'string')) {
         console.warn(`Validation Failed: Company ${company.id} has non-string value in 'tags'.`);
        return false;
    }

    // Optional check for founding_year format if present
    if (company.founding_year !== undefined && company.founding_year !== null && (typeof company.founding_year !== 'number' || !Number.isInteger(company.founding_year) || company.founding_year < 1000 || company.founding_year > new Date().getFullYear())) {
         console.warn(`Validation Failed: Company ${company.id} has invalid 'founding_year': ${company.founding_year}`);
         return false;
    }

    // --- MODIFICATION START: Validate headquarters ---
    // Optional check for headquarters: must be a string from the allowed list if present
    if (company.headquarters !== undefined && company.headquarters !== null) {
        if (!isValueInAllowedTuples(company.headquarters, ALLOWED_HEADQUARTERS)) {
            console.warn(`Validation Failed: Company ${company.id} has invalid 'headquarters': "${company.headquarters}". Must be one of the defined MENA countries (English or Arabic name) in utils/industries.ts.`);
            return false;
        }
    }
    // --- MODIFICATION END: Validate headquarters ---

    // Optional check for links format if present
    if (company.links !== undefined && company.links !== null) {
        if (typeof company.links !== 'object') {
             console.warn(`Validation Failed: Company ${company.id} has invalid 'links' (must be object).`);
             return false;
        }
        for (const key in company.links) {
             const url = company.links[key];
             if (typeof url !== 'string' || !(url.startsWith('http://') || url.startsWith('https://'))) {
                  console.warn(`Validation Failed: Company ${company.id} has invalid URL in 'links.${key}': ${url}`);
                  return false;
             }
        }
    }

    return true; // All checks passed
}
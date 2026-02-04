export type OpportunityType = 'job' | 'internship' | 'scholarship' | 'grant';
export type WorkArrangement = 'remote' | 'hybrid' | 'onsite';
export type ExperienceLevel = 'entry' | 'mid' | 'senior' | 'executive';

export interface Opportunity {
  id: number;
  title: string;
  description: string;
  required_skills: string[];
  category?: string;

  // Company info
  company_name?: string;
  company_logo_url?: string;
  company_website?: string;
  company_size?: string;

  // Location
  city?: string;
  state?: string;
  country?: string;
  is_remote: boolean;

  // Compensation
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  salary_period: string;
  is_salary_visible: boolean;

  // Classification
  opportunity_type: OpportunityType;
  work_arrangement: WorkArrangement;
  experience_level: ExperienceLevel;
  education_requirement?: string;

  // Application
  application_url?: string;
  application_email?: string;
  application_deadline?: string;

  // Metadata
  posted_at?: string;
  updated_at?: string;
  expires_at?: string;
  is_active: boolean;
  is_featured: boolean;

  // Extra
  preferred_skills: string[];
  benefits: string[];
  award_amount?: number;

  // Enhanced details for comprehensive job description
  desired_qualifications?: string[];
  work_authorization?: string[];  // e.g., ['US Citizens', 'Green Card Holders', 'OPT/CPT Eligible']
  country_restrictions?: string[];  // Countries where candidates must be authorized to work
  open_to_international?: boolean;
  availability_start?: string;  // ISO date string
  availability_end?: string;  // ISO date string
  graduation_year_min?: number;  // e.g., 2025
  graduation_year_max?: number;  // e.g., 2027
  employer_requirements?: string;  // Additional requirements from employer
  responsibilities?: string[];  // Job responsibilities
}

export interface OpportunityMatch extends Opportunity {
  match_score: number;
  matched_skills: string[];
}

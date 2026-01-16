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
}

export interface OpportunityMatch extends Opportunity {
  match_score: number;
  matched_skills: string[];
}

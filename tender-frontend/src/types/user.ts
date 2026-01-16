export interface WorkExperience {
  title: string;
  company: string;
  location?: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree_type: string;
  field: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  url?: string;
  technologies: string[];
}

export interface Language {
  language: string;
  proficiency: string;
}

export interface Award {
  title: string;
  issuer: string;
  date?: string;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at?: string;

  // Profile
  headline?: string;
  bio?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;

  // Skills & Interests
  skills: string[];
  interests: string[];
  goals?: string;

  // Rich profile data
  work_experiences: WorkExperience[];
  education_entries: EducationEntry[];
  projects: Project[];
  languages: Language[];
  awards: Award[];

  // Files
  cv_filename?: string;
  transcript_filename?: string;
  profile_picture_url?: string;

  // Computed
  profile_completion?: number;
}

export interface ProfileUpdateRequest {
  name?: string;
  headline?: string;
  bio?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  skills?: string[];
  interests?: string[];
  goals?: string;
  work_experiences?: WorkExperience[];
  education_entries?: EducationEntry[];
  projects?: Project[];
  languages?: Language[];
  awards?: Award[];
}

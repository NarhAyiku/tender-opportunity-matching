export interface LocationPreference {
  city: string;
  country: string;
  radius_miles?: number;
}

export interface UserPreferences {
  id: number;
  user_id: number;
  desired_job_titles: string[];
  preferred_locations: LocationPreference[];
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
  job_levels: string[];
  work_arrangements: string[];
  opportunity_types: string[];
  is_actively_looking: boolean;
  created_at: string;
  updated_at?: string;
}

export interface PreferencesUpdateRequest {
  desired_job_titles?: string[];
  preferred_locations?: LocationPreference[];
  salary_min?: number;
  salary_max?: number;
  salary_currency?: string;
  job_levels?: string[];
  work_arrangements?: string[];
  opportunity_types?: string[];
  is_actively_looking?: boolean;
}

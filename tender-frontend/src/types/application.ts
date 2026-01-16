export type ApplicationStatus =
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export interface ApplicationEvent {
  id: number;
  application_id: number;
  event_type: string;
  description?: string;
  event_data?: Record<string, unknown>;
  created_at: string;
}

export interface Application {
  id: number;
  user_id: number;
  opportunity_id: number;
  status: ApplicationStatus;
  cover_letter?: string;
  resume_snapshot?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
  submitted_at?: string;

  // Joined data
  opportunity?: {
    id: number;
    title: string;
    company_name?: string;
    company_logo_url?: string;
    opportunity_type: string;
  };
  events?: ApplicationEvent[];
}

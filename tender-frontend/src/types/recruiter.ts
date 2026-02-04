export type CandidateStatus = 'new' | 'reviewed' | 'interview' | 'offer' | 'rejected';

export type CandidateSource = 'QualityMatch' | 'LinkedIn' | 'Direct' | 'Referral';

export interface Candidate {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    fitScore: number; // 0-100
    skills: string[];
    coverExcerpt: string;
    status: CandidateStatus;
    source: CandidateSource;
    appliedAt: string; // ISO date
    opportunityId: number;
    opportunityTitle: string;
    resumeUrl?: string;
    atsId?: string; // For future Merge.dev integration
    atsSynced?: boolean;
}

export interface RecruiterMetrics {
    newApplications: number;
    averageFitScore: number;
    conversionRate: number; // percentage
    totalCandidates: number;
}

export interface CandidateFilters {
    search?: string;
    minFitScore?: number;
    dateRange?: {
        start: string;
        end: string;
    };
    source?: CandidateSource;
    status?: CandidateStatus;
}

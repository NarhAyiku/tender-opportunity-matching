export interface ParsedData {
    skills?: string[];
    work_experiences?: WorkExperience[];
    education?: Education[];
    projects?: Project[];
    languages?: Language[];
    awards?: Award[];
    certifications?: string[];
    interests?: string[];
    // Social Links
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    // Transcript specific
    gpa?: string;
    courses?: string[];
}

export interface WorkExperience {
    title: string;
    company?: string;
    location?: string;
    start_date?: string;
    end_date?: string;
    description?: string;
}

export interface Education {
    institution: string;
    degree: string;
    field_of_study?: string;
    start_date?: string;
    end_date?: string;
    gpa?: string;
}

export interface Project {
    name: string;
    description?: string;
    technologies?: string[];
    url?: string;
}

export interface Language {
    language: string;
    proficiency?: string;
}

export interface Award {
    title: string;
    issuer?: string;
    date?: string;
    description?: string;
}

export interface ParseResult {
    parse_id: number;
    status: 'succeeded' | 'failed' | 'partial';
    parsed_data: ParsedData;
    confidence_scores: Record<string, number>;
    low_confidence_fields: string[];
    error_message?: string;
}

export interface ApplyParsedDataRequest {
    parse_id: number;
    action: 'merge' | 'overwrite';
    manual_edits?: Partial<ParsedData>;
}

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class OpportunityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    category: Optional[str] = None

    # Company
    company_name: Optional[str] = None
    company: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None  # "startup", "small", "medium", "large", "enterprise"

    # Location
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_remote: bool = False
    remote: bool = False  # alias for ingestion adapters/tests

    # Compensation
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    salary_period: str = "yearly"
    is_salary_visible: bool = True

    # Classification
    job_type: Optional[str] = None  # fulltime/parttime/internship/contract
    opportunity_type: str = "job"  # "job", "internship", "scholarship", "grant"
    work_arrangement: str = "onsite"  # "remote", "hybrid", "onsite", "contract"
    experience_level: str = "entry"  # "entry", "mid", "senior", "executive"
    education_requirement: str = "none"  # "none", "high_school", "associate", "bachelors", "masters", "phd"

    # Application
    url: Optional[str] = None
    application_url: Optional[str] = None
    application_email: Optional[str] = None
    application_deadline: Optional[datetime] = None

    # Benefits
    benefits: List[str] = []

    # For scholarships/grants
    award_amount: Optional[float] = None
    award_currency: Optional[str] = None
    eligibility_criteria: List[str] = []

    # External sourcing
    source: str = "internal"
    external_id: Optional[str] = None
    external_url: Optional[str] = None
    refreshed_at: Optional[datetime] = None
    is_stale: bool = False


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    category: Optional[str] = None

    # Company
    company_name: Optional[str] = None
    company: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None

    # Location
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_remote: Optional[bool] = None
    remote: Optional[bool] = None

    # Compensation
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    salary_period: Optional[str] = None
    is_salary_visible: Optional[bool] = None

    # Classification
    job_type: Optional[str] = None
    opportunity_type: Optional[str] = None
    work_arrangement: Optional[str] = None
    experience_level: Optional[str] = None
    education_requirement: Optional[str] = None

    # Application
    url: Optional[str] = None
    application_url: Optional[str] = None
    application_email: Optional[str] = None
    application_deadline: Optional[datetime] = None

    # Metadata
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    expires_at: Optional[datetime] = None

    # Benefits
    benefits: Optional[List[str]] = None

    # For scholarships/grants
    award_amount: Optional[float] = None
    award_currency: Optional[str] = None
    eligibility_criteria: Optional[List[str]] = None

    # External sourcing
    source: Optional[str] = None
    external_id: Optional[str] = None
    external_url: Optional[str] = None
    is_stale: Optional[bool] = None


class OpportunityResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    category: Optional[str] = None

    # Company
    company_name: Optional[str] = None
    company: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None

    # Location
    location: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_remote: bool = False
    remote: bool = False

    # Compensation
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    salary_period: str = "yearly"
    is_salary_visible: bool = True

    # Classification
    job_type: Optional[str] = None
    opportunity_type: str = "job"
    work_arrangement: str = "onsite"
    experience_level: str = "entry"
    education_requirement: str = "none"

    # Application
    url: Optional[str] = None
    application_url: Optional[str] = None
    application_email: Optional[str] = None
    application_deadline: Optional[datetime] = None

    # Metadata
    posted_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    is_active: bool = True
    is_featured: bool = False

    # Benefits
    benefits: List[str] = []

    # For scholarships/grants
    award_amount: Optional[float] = None
    award_currency: Optional[str] = None
    eligibility_criteria: List[str] = []

    # External sourcing
    source: str = "internal"
    external_id: Optional[str] = None
    external_url: Optional[str] = None
    refreshed_at: Optional[datetime] = None
    is_stale: bool = False

    class Config:
        from_attributes = True


class OpportunityListResponse(BaseModel):
    total: int
    page: int
    per_page: int
    opportunities: List[OpportunityResponse]


class OpportunityCardResponse(BaseModel):
    """Minimal response for swipe cards."""
    id: int
    title: str
    company_name: Optional[str] = None
    company: Optional[str] = None
    company_logo_url: Optional[str] = None
    location: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    is_remote: bool = False
    opportunity_type: str = "job"
    job_type: Optional[str] = None
    work_arrangement: str = "onsite"
    experience_level: str = "entry"
    education_requirement: str = "none"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    is_salary_visible: bool = True
    required_skills: List[str] = []
    source: str = "internal"
    url: Optional[str] = None
    external_url: Optional[str] = None

    class Config:
        from_attributes = True


# Sync schemas
class SyncRequest(BaseModel):
    keywords: str = Field(..., min_length=1, description="Search keywords")
    location: Optional[str] = Field(None, description="Location filter")
    sources: List[str] = Field(default=["jooble", "adzuna"], description="Sources to sync from")
    limit_per_source: int = Field(default=50, ge=1, le=100, description="Max jobs per source")


class SyncResponse(BaseModel):
    status: str
    inserted: int
    updated: int
    stale_marked: int
    errors: List[str] = []
    duration_seconds: float


class SyncStatusResponse(BaseModel):
    last_sync: Optional[datetime]
    total_jobs: int
    active_jobs: int
    stale_jobs: int
    by_source: dict


# Bulk import schemas
class BulkImportItem(BaseModel):
    """Single item for bulk import - minimal required fields."""
    title: str = Field(..., min_length=1)
    company: Optional[str] = None
    company_name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    job_type: Optional[str] = None
    is_remote: bool = False
    remote: bool = False
    opportunity_type: str = "job"
    experience_level: str = "entry"
    source: str = "bulk_import"
    external_id: Optional[str] = None


class BulkImportRequest(BaseModel):
    """Request for bulk importing opportunities."""
    opportunities: List[BulkImportItem] = Field(..., min_length=1, max_length=500)
    skip_duplicates: bool = Field(default=True, description="Skip items with duplicate external_id")


class BulkImportResponse(BaseModel):
    """Response from bulk import operation."""
    status: str
    total_received: int
    inserted: int
    skipped: int
    errors: List[str] = []

from pydantic import BaseModel
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
    company_logo_url: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None  # "startup", "small", "medium", "large", "enterprise"

    # Location
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_remote: bool = False

    # Compensation
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    salary_period: str = "yearly"
    is_salary_visible: bool = True

    # Classification
    opportunity_type: str = "job"  # "job", "internship", "scholarship", "grant"
    work_arrangement: str = "onsite"  # "remote", "hybrid", "onsite", "contract"
    experience_level: str = "entry"  # "entry", "mid", "senior", "executive"
    education_requirement: str = "none"  # "none", "high_school", "associate", "bachelors", "masters", "phd"

    # Application
    application_url: Optional[str] = None
    application_email: Optional[str] = None
    application_deadline: Optional[datetime] = None

    # Benefits
    benefits: List[str] = []

    # For scholarships/grants
    award_amount: Optional[float] = None
    award_currency: Optional[str] = None
    eligibility_criteria: List[str] = []


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    preferred_skills: Optional[List[str]] = None
    category: Optional[str] = None

    # Company
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None

    # Location
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_remote: Optional[bool] = None

    # Compensation
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    salary_period: Optional[str] = None
    is_salary_visible: Optional[bool] = None

    # Classification
    opportunity_type: Optional[str] = None
    work_arrangement: Optional[str] = None
    experience_level: Optional[str] = None
    education_requirement: Optional[str] = None

    # Application
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


class OpportunityResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    required_skills: List[str] = []
    preferred_skills: List[str] = []
    category: Optional[str] = None

    # Company
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    company_website: Optional[str] = None
    company_size: Optional[str] = None

    # Location
    city: Optional[str] = None
    state: Optional[str] = None
    country: Optional[str] = None
    is_remote: bool = False

    # Compensation
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    salary_period: str = "yearly"
    is_salary_visible: bool = True

    # Classification
    opportunity_type: str = "job"
    work_arrangement: str = "onsite"
    experience_level: str = "entry"
    education_requirement: str = "none"

    # Application
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

    class Config:
        from_attributes = True


class OpportunityCardResponse(BaseModel):
    """Minimal response for swipe cards."""
    id: int
    title: str
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    is_remote: bool = False
    opportunity_type: str = "job"
    work_arrangement: str = "onsite"
    experience_level: str = "entry"
    education_requirement: str = "none"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    is_salary_visible: bool = True
    required_skills: List[str] = []

    class Config:
        from_attributes = True

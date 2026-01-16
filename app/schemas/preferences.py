from pydantic import BaseModel
from typing import Optional, List


class LocationPreference(BaseModel):
    city: str
    country: str
    radius_miles: int = 25


class UserPreferencesCreate(BaseModel):
    desired_job_titles: List[str] = []
    preferred_locations: List[LocationPreference] = []
    willing_to_relocate: str = "no"  # "yes", "no", "maybe"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    job_levels: List[str] = []  # ["entry", "mid", "senior"]
    work_arrangements: List[str] = []  # ["remote", "hybrid", "onsite"]
    opportunity_types: List[str] = []  # ["job", "internship", "scholarship", "grant"]
    preferred_industries: List[str] = []
    company_sizes: List[str] = []  # ["startup", "small", "medium", "large", "enterprise"]


class UserPreferencesUpdate(BaseModel):
    desired_job_titles: Optional[List[str]] = None
    preferred_locations: Optional[List[LocationPreference]] = None
    willing_to_relocate: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = None
    job_levels: Optional[List[str]] = None
    work_arrangements: Optional[List[str]] = None
    opportunity_types: Optional[List[str]] = None
    preferred_industries: Optional[List[str]] = None
    company_sizes: Optional[List[str]] = None


class UserPreferencesResponse(BaseModel):
    id: int
    user_id: int
    desired_job_titles: List[str] = []
    preferred_locations: List[dict] = []  # Keep as dict for flexibility
    willing_to_relocate: str = "no"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    job_levels: List[str] = []
    work_arrangements: List[str] = []
    opportunity_types: List[str] = []
    preferred_industries: List[str] = []
    company_sizes: List[str] = []

    class Config:
        from_attributes = True

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime


# Work Experience
class WorkExperience(BaseModel):
    title: str
    company: str
    location: Optional[str] = None
    start_date: Optional[str] = None  # ISO date string (YYYY-MM-DD)
    end_date: Optional[str] = None
    is_current: bool = False
    description_bullets: List[str] = []


# Education Entry
class EducationEntry(BaseModel):
    institution: str
    degree_type: str  # "high_school", "associate", "bachelors", "masters", "phd", "certificate", "other"
    field_of_study: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    gpa: Optional[float] = None


# Project
class Project(BaseModel):
    name: str
    description: Optional[str] = None
    url: Optional[str] = None
    technologies: List[str] = []
    start_date: Optional[str] = None
    end_date: Optional[str] = None


# Language Skill
class LanguageSkill(BaseModel):
    language: str
    proficiency: str  # "native", "fluent", "advanced", "intermediate", "beginner"


# Award
class Award(BaseModel):
    title: str
    issuer: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None


# Full Profile Response
class UserProfileResponse(BaseModel):
    id: int
    email: str
    name: str
    headline: Optional[str] = None
    bio: Optional[str] = None

    # Structured data
    skills: List[str] = []
    work_experiences: List[WorkExperience] = []
    education_entries: List[EducationEntry] = []
    projects: List[Project] = []
    languages: List[LanguageSkill] = []
    interests: List[str] = []
    awards: List[Award] = []
    goals: Optional[str] = None

    # Files
    cv_filename: Optional[str] = None
    transcript_filename: Optional[str] = None
    profile_picture_url: Optional[str] = None

    # Contact
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None

    # Status
    is_active: bool
    is_admin: bool = False

    # Timestamps
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    # Computed
    profile_completion_percentage: int = 0

    class Config:
        from_attributes = True


# Profile Update Schema
class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    headline: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experiences: Optional[List[WorkExperience]] = None
    education_entries: Optional[List[EducationEntry]] = None
    projects: Optional[List[Project]] = None
    languages: Optional[List[LanguageSkill]] = None
    interests: Optional[List[str]] = None
    awards: Optional[List[Award]] = None
    goals: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    # Legacy field
    education: Optional[str] = None


def calculate_profile_completion(user) -> int:
    """Calculate profile completion percentage based on filled fields."""
    total_fields = 12
    filled = 0

    if user.name:
        filled += 1
    if user.headline:
        filled += 1
    if user.bio:
        filled += 1
    if user.skills and len(user.skills) > 0:
        filled += 1
    if user.work_experiences and len(user.work_experiences) > 0:
        filled += 1
    if user.education_entries and len(user.education_entries) > 0:
        filled += 1
    if user.projects and len(user.projects) > 0:
        filled += 1
    if user.languages and len(user.languages) > 0:
        filled += 1
    if user.interests and len(user.interests) > 0:
        filled += 1
    if user.cv_filename:
        filled += 1
    if user.phone or user.linkedin_url:
        filled += 1
    if user.goals:
        filled += 1

    return int((filled / total_fields) * 100)

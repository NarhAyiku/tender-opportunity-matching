from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Basic profile
    headline = Column(String)  # Professional headline (e.g., "Software Engineer | AI Enthusiast")
    bio = Column(Text)  # Short bio/summary
    skills = Column(JSON, default=list)  # Array of skill strings

    # Rich profile data (stored as JSON arrays)
    work_experiences = Column(JSON, default=list)
    # Structure: [{title, company, location, start_date, end_date, is_current, description_bullets}]

    education_entries = Column(JSON, default=list)
    # Structure: [{institution, degree_type, field_of_study, start_date, end_date, gpa}]

    projects = Column(JSON, default=list)
    # Structure: [{name, description, url, technologies, start_date, end_date}]

    languages = Column(JSON, default=list)
    # Structure: [{language, proficiency}]

    interests = Column(JSON, default=list)  # Array of interest strings

    awards = Column(JSON, default=list)
    # Structure: [{title, issuer, date, description}]

    # Career info
    goals = Column(Text)  # Free-form career goals

    # File references
    cv_filename = Column(String)
    transcript_filename = Column(String)
    profile_picture_url = Column(String)

    # Contact info
    phone = Column(String)
    linkedin_url = Column(String)
    github_url = Column(String)
    portfolio_url = Column(String)
    location = Column(String)

    # Legacy field (kept for backward compatibility, but use education_entries instead)
    education = Column(String)
    
    # Swipe limits
    daily_swipe_limit = Column(Integer, default=50)  # Default daily swipe limit

    # Screening / compliance
    age = Column(Integer)
    preferred_countries = Column(JSON, default=list)
    screening_completed = Column(Boolean, default=False)
    screening_completed_at = Column(DateTime)
    consent_share_documents = Column(Boolean, default=False)

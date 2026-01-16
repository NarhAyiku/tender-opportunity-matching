from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from app.database import Base


class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)

    # Job title preferences
    desired_job_titles = Column(JSON, default=list)  # ["Software Engineer", "Data Scientist"]

    # Location preferences - array of {city, country, radius_miles}
    preferred_locations = Column(JSON, default=list)
    willing_to_relocate = Column(String, default="no")  # "yes", "no", "maybe"

    # Salary expectations
    salary_min = Column(Float)
    salary_max = Column(Float)
    salary_currency = Column(String, default="USD")

    # Job level preferences - array of strings
    job_levels = Column(JSON, default=list)  # ["entry", "mid", "senior"]

    # Work arrangement preferences - array of strings
    work_arrangements = Column(JSON, default=list)  # ["remote", "hybrid", "onsite"]

    # Opportunity type preferences - array of strings
    opportunity_types = Column(JSON, default=list)  # ["job", "internship", "scholarship", "grant"]

    # Industry preferences
    preferred_industries = Column(JSON, default=list)

    # Company size preferences
    company_sizes = Column(JSON, default=list)  # ["startup", "small", "medium", "large", "enterprise"]

    # Relationship
    user = relationship("User", backref="preferences")

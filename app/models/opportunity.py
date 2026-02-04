from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, UniqueConstraint
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
from app.database import Base


class Opportunity(Base):
    __tablename__ = "opportunities"
    __table_args__ = (
        UniqueConstraint("source", "external_id", name="uq_opportunity_source_external"),
    )

    id = Column(Integer, primary_key=True, index=True)

    # Basic info
    title = Column(String, nullable=False)
    description = Column(Text)
    required_skills = Column(JSON, default=list)  # Normalized skills list
    preferred_skills = Column(JSON, default=list)  # Nice-to-have skills
    category = Column(String)

    # Company info
    company_name = Column(String)
    company = Column(String)  # alias for external sources; keep both for compatibility
    company_logo_url = Column(String)
    company_website = Column(String)
    company_size = Column(String)  # "startup", "small", "medium", "large", "enterprise"

    # Location
    location = Column(String)
    city = Column(String)
    state = Column(String)
    country = Column(String)
    is_remote = Column(Boolean, default=False)

    # Compensation
    salary_min = Column(Float)
    salary_max = Column(Float)
    salary_currency = Column(String, default="USD")
    salary_period = Column(String, default="yearly")  # "yearly", "monthly", "hourly"
    is_salary_visible = Column(Boolean, default=True)

    # Classification
    job_type = Column(String)  # "fulltime", "parttime", "internship", "contract"
    opportunity_type = Column(String, default="job")  # "job", "internship", "scholarship", "grant"
    work_arrangement = Column(String, default="onsite")  # "remote", "hybrid", "onsite", "contract"
    experience_level = Column(String, default="entry")  # "entry", "mid", "senior", "executive"
    education_requirement = Column(String, default="none")  # "none", "high_school", "associate", "bachelors", "masters", "phd"

    # Application details
    url = Column(String)  # external apply URL
    application_url = Column(String)
    application_email = Column(String)
    application_deadline = Column(DateTime)

    # Metadata
    posted_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)

    # Benefits
    benefits = Column(JSON, default=list)  # ["health_insurance", "401k", "remote_work", etc.]

    # For scholarships/grants specifically
    award_amount = Column(Float)
    award_currency = Column(String)
    eligibility_criteria = Column(JSON, default=list)

    # External sourcing metadata
    source = Column(String, default="internal")
    external_id = Column(String)
    external_url = Column(String)
    refreshed_at = Column(DateTime)
    is_stale = Column(Boolean, default=False)

    def mark_refreshed(self):
        self.refreshed_at = datetime.utcnow()
        self.is_stale = False

    def mark_stale(self):
        self.is_stale = True

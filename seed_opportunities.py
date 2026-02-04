
import random
from datetime import datetime, timedelta
from faker import Faker
from sqlalchemy.orm import Session

from app.database import SessionLocal, engine
from app.models.opportunity import Opportunity
from app.database import Base

fake = Faker()

JOB_TITLES = [
    "Software Engineer", "Frontend Developer", "Backend Developer", "Full Stack Engineer",
    "Data Scientist", "Product Manager", "UX Designer", "DevOps Engineer",
    "Marketing Intern", "Sales Associate", "Business Analyst", "Content Writer",
    "Graphic Designer", "HR Specialist", "Research Assistant", "Mechanical Engineer"
]

COMPANIES = [
    "TechCorp", "InnovateLTD", "FutureSystems", "CreativeMinds", "GlobalSolutions",
    "AlphaGroup", "BetaInc", "GammaTech", "DeltaDynamics", "EpsilonEnterprises"
]

LOCATIONS = [
    "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA", "Remote",
    "London, UK", "Berlin, DE", "Toronto, CA", "Boston, MA", "Chicago, IL"
]

JOB_TYPES = ["fulltime", "parttime", "internship", "contract"]
OPPORTUNITY_TYPES = ["job", "internship", "scholarship", "grant"]
EXPERIENCE_LEVELS = ["entry", "mid", "senior"]

def create_opportunities(n=100):
    db = SessionLocal()
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    print(f"Seeding {n} opportunities...")
    
    count = 0
    for _ in range(n):
        title = random.choice(JOB_TITLES)
        company = random.choice(COMPANIES)
        
        # Randomize salary
        min_sal = random.randint(40, 120) * 1000
        max_sal = min_sal + random.randint(10, 50) * 1000
        
        opp = Opportunity(
            title=title,
            description=fake.paragraph(nb_sentences=5),
            company_name=company,
            company=company, # alias
            location=random.choice(LOCATIONS),
            salary_min=min_sal,
            salary_max=max_sal,
            salary_currency="USD",
            job_type=random.choice(JOB_TYPES),
            opportunity_type="job", # Keep mostly jobs for now
            experience_level=random.choice(EXPERIENCE_LEVELS),
            is_remote=random.choice([True, False]),
            url="https://example.com",
            application_url="https://example.com/apply",
            source="seeder",
            external_id=f"seed-{random.randint(100000, 999999)}",
            is_active=True,
            is_stale=False,
            posted_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
        )
        
        db.add(opp)
        count += 1
        
    db.commit()
    print(f"Successfully seeded {count} opportunities!")
    db.close()

if __name__ == "__main__":
    create_opportunities(100)

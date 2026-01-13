from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.sqlite import JSON
from app.database import Base

class Opportunity(Base):
    __tablename__ = "opportunities"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String)

    # 🔥 normalized field
    required_skills = Column(JSON, default=list)

    category = Column(String)

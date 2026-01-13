from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    name = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Profile fields
    skills = Column(JSON, default=list)
    education = Column(String)
    interests = Column(String)
    goals = Column(String)

from sqlalchemy import Column, Integer, String
from sqlalchemy.dialects.sqlite import JSON
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    # 🔥 normalized fields
    skills = Column(JSON, default=list)
    education = Column(String)
    interests = Column(String)
    goals = Column(String)

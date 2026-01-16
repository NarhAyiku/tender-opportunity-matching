from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, Date
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from datetime import datetime, date
from app.database import Base


class UserSwipe(Base):
    __tablename__ = "user_swipes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)

    action = Column(String, nullable=False)  # "like", "dislike", "save"
    status = Column(String, default="pending")  # "pending", "approved", "submitted", "rejected"
    created_at = Column(DateTime, default=datetime.utcnow)
    swipe_date = Column(Date, default=date.today, index=True)  # For daily limit tracking
    
    # Preview and edit data
    preview_data = Column(JSON, default=dict)  # AI-generated cover letter and form data
    edited_data = Column(JSON, default=dict)  # User modifications to preview data

    # Relationships
    user = relationship("User", backref="swipes")
    opportunity = relationship("Opportunity", backref="swipes")

    # Ensure each user can only swipe once per opportunity
    __table_args__ = (
        UniqueConstraint('user_id', 'opportunity_id', name='unique_user_opportunity_swipe'),
    )

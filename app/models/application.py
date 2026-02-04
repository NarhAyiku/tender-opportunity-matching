from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.sqlite import JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)

    # Status: pending, submitted, viewed, interview, offer, rejected, withdrawn
    status = Column(String, default="pending")

    # Application details
    cover_letter = Column(Text)
    resume_snapshot = Column(String)  # Filename of resume at time of application

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    submitted_at = Column(DateTime)

    # User notes
    notes = Column(Text)

    # Document attachments (per PRD line 59)
    attached_resume_id = Column(Integer, ForeignKey("documents.id"))
    attached_transcript_id = Column(Integer, ForeignKey("documents.id"))
    attached_cover_letter_id = Column(Integer, ForeignKey("documents.id"))
    conversation_id = Column(Integer, ForeignKey("conversations.id"))

    # Relationships
    user = relationship("User", backref="applications")
    opportunity = relationship("Opportunity", backref="applications")
    events = relationship(
        "ApplicationEvent",
        back_populates="application",
        order_by="desc(ApplicationEvent.created_at)"
    )


class ApplicationEvent(Base):
    __tablename__ = "application_events"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False, index=True)

    # Event type: swiped_right, started, submitted, viewed, interview_scheduled, etc.
    event_type = Column(String, nullable=False)
    description = Column(Text)
    event_data = Column(JSON, default=dict)  # For storing extra event data

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    application = relationship("Application", back_populates="events")

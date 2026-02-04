from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Conversation(Base):
    """
    Per PRD line 60: Conversation thread per application/opportunity.
    Types: jobs, internships, scholarships, interviews.
    """
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), index=True)
    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), index=True)

    # Type: job, internship, scholarship, interview
    type = Column(String, nullable=False, default="job")

    last_message_at = Column(DateTime)
    unread_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", backref="conversations")
    application = relationship("Application", backref="conversations")
    opportunity = relationship("Opportunity", backref="conversations")
    events = relationship(
        "ConversationEvent",
        back_populates="conversation",
        order_by="desc(ConversationEvent.created_at)",
    )


class ConversationEvent(Base):
    """
    Per PRD line 61: Timeline events within a conversation.
    Kinds: status_update, message, system.
    Statuses: applied, viewed, shortlisted, interview, offer, rejected, hired.
    Actors: system, recruiter, user.
    """
    __tablename__ = "conversation_events"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False, index=True)

    # Event kind: status_update, message, system
    kind = Column(String, nullable=False, default="status_update")

    # Status (for status_update kind): applied, viewed, shortlisted, interview, offer, rejected, hired
    status = Column(String)

    # Message content
    message = Column(Text)

    # Actor: system, recruiter, user
    actor = Column(String, nullable=False, default="system")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship
    conversation = relationship("Conversation", back_populates="events")

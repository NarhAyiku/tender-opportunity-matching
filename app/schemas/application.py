from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ApplicationStatus(str, Enum):
    PENDING = "pending"
    SUBMITTED = "submitted"
    VIEWED = "viewed"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationEventType(str, Enum):
    SWIPED_RIGHT = "swiped_right"
    STARTED_APPLICATION = "started_application"
    SUBMITTED = "submitted"
    EMPLOYER_VIEWED = "employer_viewed"
    QUESTIONS_RECEIVED = "questions_received"
    QUESTIONS_ANSWERED = "questions_answered"
    INTERVIEW_SCHEDULED = "interview_scheduled"
    INTERVIEW_COMPLETED = "interview_completed"
    OFFER_RECEIVED = "offer_received"
    OFFER_ACCEPTED = "offer_accepted"
    OFFER_DECLINED = "offer_declined"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    NOTE_ADDED = "note_added"


class ApplicationEventCreate(BaseModel):
    event_type: ApplicationEventType
    description: Optional[str] = None
    event_data: Optional[dict] = None


class ApplicationEventResponse(BaseModel):
    id: int
    application_id: int
    event_type: str
    description: Optional[str] = None
    event_data: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    opportunity_id: int
    cover_letter: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[ApplicationStatus] = None
    cover_letter: Optional[str] = None
    notes: Optional[str] = None


class OpportunityBrief(BaseModel):
    id: int
    title: str
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    opportunity_id: int
    status: str
    cover_letter: Optional[str] = None
    resume_snapshot: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApplicationListItem(BaseModel):
    id: int
    opportunity_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    opportunity: OpportunityBrief

    class Config:
        from_attributes = True


class ApplicationDetail(BaseModel):
    id: int
    user_id: int
    opportunity_id: int
    status: str
    cover_letter: Optional[str] = None
    resume_snapshot: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    submitted_at: Optional[datetime] = None
    opportunity: OpportunityBrief
    events: List[ApplicationEventResponse] = []

    class Config:
        from_attributes = True

from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class ConversationEventOut(BaseModel):
    id: int
    conversation_id: int
    kind: str
    status: Optional[str] = None
    message: Optional[str] = None
    actor: str
    created_at: datetime

    class Config:
        from_attributes = True


class OpportunityBrief(BaseModel):
    id: int
    title: str
    company_name: Optional[str] = None
    company_logo_url: Optional[str] = None

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: int
    user_id: int
    application_id: Optional[int] = None
    opportunity_id: Optional[int] = None
    type: str
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime
    opportunity: Optional[OpportunityBrief] = None

    class Config:
        from_attributes = True


class ConversationDetailOut(ConversationOut):
    events: List[ConversationEventOut] = []

    class Config:
        from_attributes = True

from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

from app.schemas.opportunity import OpportunityCardResponse


class SwipeAction(str, Enum):
    LIKE = "like"
    DISLIKE = "dislike"
    SAVE = "save"


class SwipeStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    SUBMITTED = "submitted"
    REJECTED = "rejected"


class SwipeCreate(BaseModel):
    opportunity_id: int
    action: SwipeAction


class SwipeEdit(BaseModel):
    edited_data: Dict[str, Any]


class SwipeResponse(BaseModel):
    id: int
    user_id: int
    opportunity_id: int
    action: str
    status: str
    created_at: datetime
    swipe_date: date
    preview_data: Optional[Dict[str, Any]] = None
    edited_data: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class SwipeWithOpportunity(BaseModel):
    """Swipe response including opportunity details."""
    id: int
    user_id: int
    opportunity_id: int
    action: str
    status: str
    created_at: datetime
    swipe_date: date
    preview_data: Optional[Dict[str, Any]] = None
    edited_data: Optional[Dict[str, Any]] = None
    opportunity: OpportunityCardResponse

    class Config:
        from_attributes = True


class SwipeLimitsResponse(BaseModel):
    """Response for swipe limits endpoint."""
    daily_limit: int
    used_today: int
    remaining: int
    reset_time: Optional[datetime] = None

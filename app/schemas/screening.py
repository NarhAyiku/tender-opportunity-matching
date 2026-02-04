from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class ScreeningCompleteRequest(BaseModel):
    age: int = Field(..., ge=16, description="User age in years")
    location: str = Field(..., min_length=2, max_length=120)
    preferred_countries: List[str] = Field(default_factory=list)
    consent_share_documents: bool


class ScreeningStatusResponse(BaseModel):
    completed: bool
    missing: List[str]
    age: Optional[int] = None
    location: Optional[str] = None
    preferred_countries: List[str] = []
    consent_share_documents: bool = False
    screening_completed_at: Optional[datetime] = None

"""
Pydantic schemas for Document and ParsedDocument.
Used for API request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime


class DocumentBase(BaseModel):
    type: str = Field(..., description="Document type: resume, transcript, cover_letter")
    filename: str
    mime_type: str
    size_bytes: int


class DocumentCreate(DocumentBase):
    stored_filename: str
    storage_url: str
    sha256_hash: str
    user_id: int


class DocumentResponse(DocumentBase):
    id: int
    user_id: int
    stored_filename: str
    storage_url: str
    is_default: bool
    version: int
    uploaded_at: datetime
    deleted_at: Optional[datetime] = None
    latest_parse_id: Optional[int] = None

    class Config:
        from_attributes = True


class ParsedDocumentBase(BaseModel):
    source_type: str = Field(..., description="resume or transcript")
    raw_text: str
    parsed_json: Dict[str, Any]
    confidence_scores: Dict[str, float]
    status: str = Field("succeeded", description="succeeded, failed, or partial")
    error_message: Optional[str] = None


class ParsedDocumentCreate(ParsedDocumentBase):
    document_id: int
    user_id: int


class ParsedDocumentResponse(ParsedDocumentBase):
    id: int
    document_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ParseRequest(BaseModel):
    """Request to trigger parsing of an uploaded document."""
    document_type: str = Field(..., description="resume or transcript")


class ParseResultResponse(BaseModel):
    """Response with parse result and confidence scores."""
    parse_id: int
    status: str
    parsed_data: Dict[str, Any]
    confidence_scores: Dict[str, float]
    low_confidence_fields: List[str] = Field(
        default_factory=list,
        description="Fields with confidence < 0.70 that need review"
    )
    error_message: Optional[str] = None


class ApplyParsedDataRequest(BaseModel):
    """Request to apply parsed data to user profile."""
    parse_id: int
    action: str = Field("merge", description="merge or overwrite")
    # Optional field-level overrides from user edits
    manual_edits: Optional[Dict[str, Any]] = None

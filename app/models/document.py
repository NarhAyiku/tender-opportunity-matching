"""
Document and ParsedDocument models for file vault and parsing.
Per PRD lines 55-56 (Data Model section).
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.sqlite import JSON
from datetime import datetime
from app.database import Base


class Document(Base):
    """
    Per PRD line 55: Document Vault model.
    Stores metadata for uploaded files (resume/transcript/cover letter).
    """
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # File type: 'resume', 'transcript', 'cover_letter'
    type = Column(String, nullable=False)
    
    # File metadata
    filename = Column(String, nullable=False)  # Original filename
    stored_filename = Column(String, nullable=False)  # Generated unique filename
    mime_type = Column(String, nullable=False)
    size_bytes = Column(Integer, nullable=False)
    
    # Storage (local path for MVP, will be S3 URL in production)
    storage_url = Column(String, nullable=False)  # Relative path: uploads/user_123/resumes/...
    
    # Security
    sha256_hash = Column(String, nullable=False)  # File integrity check
    
    # Versioning
    is_default = Column(Boolean, default=True)  # Is this the default file for this type?
    version = Column(Integer, default=1)
    
    # Timestamps
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    deleted_at = Column(DateTime)  # Soft delete
    
    # Foreign key to latest parse (if any)
    latest_parse_id = Column(Integer, ForeignKey("parsed_documents.id"))


class ParsedDocument(Base):
    """
    Per PRD line 56: Parsed document results.
    Stores the extracted structured data from a document.
    """
    __tablename__ = "parsed_documents"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Source type for tracking
    source_type = Column(String, nullable=False)  # 'resume' or 'transcript'
    
    # Raw extracted text
    raw_text = Column(Text, nullable=False)
    
    # Parsed structured data (JSON)
    # Structure depends on source_type:
    # For resume: {skills: [], work_experiences: [], education: [], projects: [], etc.}
    # For transcript: {courses: [], gpa: {}, degree_info: {}, etc.}
    parsed_json = Column(JSON, nullable=False)
    
    # Confidence scores per field (0.0 to 1.0)
    # Example: {skills: 0.95, work_experiences: 0.80, education: 0.85}
    confidence_scores = Column(JSON, nullable=False, default=dict)
    
    # Parse status: 'succeeded', 'failed', 'partial'
    status = Column(String, nullable=False, default='succeeded')
    
    # Error message if failed/partial
    error_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

"""
Parsing API endpoints.
Per PRD lines 65-71 (Documents & Parsing section).
Implements:
- POST /files/resume/parse
- POST /files/transcript/parse  
- GET /files/parse/:parse_id
- POST /profile/apply-parsed
"""
import os
import hashlib
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.security import get_db, get_current_user
from app.models.user import User
from app.models.document import Document, ParsedDocument
from app.schemas.document import (
    ParseResultResponse,
    ApplyParsedDataRequest
)
from app.services.document_parser import DocumentParser
from app.config import RESUME_DIR, TRANSCRIPT_DIR

router = APIRouter(prefix="/files", tags=["parsing"])

parser = DocumentParser()


def get_confidence_threshold() -> float:
    """Confidence threshold per approved decision: 70%"""
    return 0.70


@router.post("/resume/parse", response_model=ParseResultResponse)
async def parse_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Auto-trigger resume parsing after upload (per approved decision: automatic parsing).
    Extracts structured data and stores in parsed_documents table.
    """
    # Check if user has uploaded resume
    if not current_user.cv_filename:
        raise HTTPException(status_code=404, detail="No resume uploaded")
    
    # Read resume file
    resume_path = os.path.join(RESUME_DIR, current_user.cv_filename)
    if not os.path.exists(resume_path):
        raise HTTPException(status_code=404, detail="Resume file not found")
    
    try:
        with open(resume_path, 'rb') as f:
            file_bytes = f.read()
        
        # Calculate file hash
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # Detect mime type from extension
        ext = os.path.splitext(current_user.cv_filename)[1].lower()
        mime_type = 'application/pdf' if ext == '.pdf' else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        
        # Extract text
        raw_text = parser.extract_text(file_bytes, mime_type)
        
        # Parse resume
        parsed_data, confidence_scores = parser.parse_resume(raw_text)
        
        # Create Document record (if doesn't exist)
        document = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.type == 'resume',
            Document.stored_filename == current_user.cv_filename
        ).first()
        
        if not document:
            document = Document(
                user_id=current_user.id,
                type='resume',
                filename=current_user.cv_filename,
                stored_filename=current_user.cv_filename,
                mime_type=mime_type,
                size_bytes=len(file_bytes),
                storage_url=resume_path,
                sha256_hash=file_hash,
                is_default=True,
                version=1
            )
            db.add(document)
            db.flush()  # Get document ID
        
        # Create ParsedDocument record
        parsed_doc = ParsedDocument(
            document_id=document.id,
            user_id=current_user.id,
            source_type='resume',
            raw_text=raw_text[:5000],  # Store first 5000 chars
            parsed_json=parsed_data,
            confidence_scores=confidence_scores,
            status='succeeded'
        )
        db.add(parsed_doc)
        
        # Update document's latest_parse_id
        db.flush()
        document.latest_parse_id = parsed_doc.id
        
        db.commit()
        db.refresh(parsed_doc)
        
        # Identify low-confidence fields (< 70%)
        threshold = get_confidence_threshold()
        low_confidence_fields = [
            field for field, score in confidence_scores.items()
            if score < threshold
        ]
        
        return ParseResultResponse(
            parse_id=parsed_doc.id,
            status='succeeded',
            parsed_data=parsed_data,
            confidence_scores=confidence_scores,
            low_confidence_fields=low_confidence_fields
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@router.post("/transcript/parse", response_model=ParseResultResponse)
async def parse_transcript(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Parse uploaded transcript."""
    if not current_user.transcript_filename:
        raise HTTPException(status_code=404, detail="No transcript uploaded")
    
    transcript_path = os.path.join(TRANSCRIPT_DIR, current_user.transcript_filename)
    if not os.path.exists(transcript_path):
        raise HTTPException(status_code=404, detail="Transcript file not found")
    
    try:
        with open(transcript_path, 'rb') as f:
            file_bytes = f.read()
        
        file_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # Detect mime type
        ext = os.path.splitext(current_user.transcript_filename)[1].lower()
        mime_type = 'application/pdf' if ext == '.pdf' else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        
        # Extract and parse
        raw_text = parser.extract_text(file_bytes, mime_type)
        parsed_data, confidence_scores = parser.parse_transcript(raw_text)
        
        # Create Document record
        document = db.query(Document).filter(
            Document.user_id == current_user.id,
            Document.type == 'transcript',
            Document.stored_filename == current_user.transcript_filename
        ).first()
        
        if not document:
            document = Document(
                user_id=current_user.id,
                type='transcript',
                filename=current_user.transcript_filename,
                stored_filename=current_user.transcript_filename,
                mime_type=mime_type,
                size_bytes=len(file_bytes),
                storage_url=transcript_path,
                sha256_hash=file_hash,
                is_default=True,
                version=1
            )
            db.add(document)
            db.flush()
        
        # Create ParsedDocument
        parsed_doc = ParsedDocument(
            document_id=document.id,
            user_id=current_user.id,
            source_type='transcript',
            raw_text=raw_text[:5000],
            parsed_json=parsed_data,
            confidence_scores=confidence_scores,
            status='succeeded'
        )
        db.add(parsed_doc)
        db.flush()
        document.latest_parse_id = parsed_doc.id
        
        db.commit()
        db.refresh(parsed_doc)
        
        threshold = get_confidence_threshold()
        low_confidence_fields = [
            field for field, score in confidence_scores.items()
            if score < threshold
        ]
        
        return ParseResultResponse(
            parse_id=parsed_doc.id,
            status='succeeded',
            parsed_data=parsed_data,
            confidence_scores=confidence_scores,
            low_confidence_fields=low_confidence_fields
        )
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Parsing failed: {str(e)}")


@router.get("/parse/{parse_id}", response_model=ParseResultResponse)
def get_parse_result(
    parse_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get parsing result by parse ID. Per PRD line 70."""
    parsed_doc = db.query(ParsedDocument).filter(
        ParsedDocument.id == parse_id,
        ParsedDocument.user_id == current_user.id
    ).first()
    
    if not parsed_doc:
        raise HTTPException(status_code=404, detail="Parse result not found")
    
    threshold = get_confidence_threshold()
    low_confidence_fields = [
        field for field, score in parsed_doc.confidence_scores.items()
        if score < threshold
    ]
    
    return ParseResultResponse(
        parse_id=parsed_doc.id,
        status=parsed_doc.status,
        parsed_data=parsed_doc.parsed_json,
        confidence_scores=parsed_doc.confidence_scores,
        low_confidence_fields=low_confidence_fields,
        error_message=parsed_doc.error_message
    )


@router.post("/profile/apply-parsed")
def apply_parsed_data(
    request: ApplyParsedDataRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Apply parsed data to user profile.
    Per PRD line 71 and approved decision: user confirms after reviewing.
    """
    # Get parsed document
    parsed_doc = db.query(ParsedDocument).filter(
        ParsedDocument.id == request.parse_id,
        ParsedDocument.user_id == current_user.id
    ).first()
    
    if not parsed_doc:
        raise HTTPException(status_code=404, detail="Parse result not found")
    
    try:
        parsed_data = parsed_doc.parsed_json
        
        # Apply manual edits if provided
        if request.manual_edits:
            for key, value in request.manual_edits.items():
                if key in parsed_data:
                    parsed_data[key] = value
        
        # Update user profile based on action
        if request.action == "overwrite":
            # Overwrite mode: replace entire fields
            if 'skills' in parsed_data:
                current_user.skills = parsed_data['skills']
            if 'work_experiences' in parsed_data:
                current_user.work_experiences = parsed_data['work_experiences']
            if 'education' in parsed_data:
                current_user.education_entries = parsed_data['education']
            if 'projects' in parsed_data:
                current_user.projects = parsed_data['projects']
            if 'languages' in parsed_data:
                current_user.languages = parsed_data['languages']
            if 'awards' in parsed_data:
                current_user.awards = parsed_data['awards']
        
        else:  # merge mode (default)
            # Merge mode: append to existing data
            if 'skills' in parsed_data:
                existing_skills = current_user.skills or []
                new_skills = [s for s in parsed_data['skills'] if s not in existing_skills]
                current_user.skills = existing_skills + new_skills
            
            if 'work_experiences' in parsed_data:
                existing_exp = current_user.work_experiences or []
                current_user.work_experiences = existing_exp + parsed_data['work_experiences']
            
            if 'education' in parsed_data:
                existing_edu = current_user.education_entries or []
                current_user.education_entries = existing_edu + parsed_data['education']
            
            if 'projects' in parsed_data:
                existing_projects = current_user.projects or []
                current_user.projects = existing_projects + parsed_data['projects']

        # Apply social links (merge logic: only if currently empty or overwrite mode)
        if 'linkedin_url' in parsed_data and parsed_data['linkedin_url']:
            if request.action == "overwrite" or not current_user.linkedin_url:
                current_user.linkedin_url = parsed_data['linkedin_url']
                
        if 'github_url' in parsed_data and parsed_data['github_url']:
            if request.action == "overwrite" or not current_user.github_url:
                current_user.github_url = parsed_data['github_url']
                
        if 'portfolio_url' in parsed_data and parsed_data['portfolio_url']:
            if request.action == "overwrite" or not current_user.portfolio_url:
                current_user.portfolio_url = parsed_data['portfolio_url']
        
        db.commit()
        db.refresh(current_user)
        
        return {
            "message": "Profile updated successfully",
            "action": request.action,
            "updated_fields": list(parsed_data.keys())
        }
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to apply parsed data: {str(e)}")

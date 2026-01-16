import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.security import get_db, get_current_user
from app.models.user import User
from app.config import (
    RESUME_DIR,
    TRANSCRIPT_DIR,
    PROFILE_PICTURE_DIR,
    MAX_FILE_SIZE,
    ALLOWED_RESUME_EXTENSIONS,
    ALLOWED_TRANSCRIPT_EXTENSIONS,
    ALLOWED_IMAGE_EXTENSIONS,
)

router = APIRouter(prefix="/files", tags=["files"])


def validate_file_extension(filename: str, allowed_extensions: set) -> str:
    """Validate file extension and return it."""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    return ext


def generate_filename(user_id: int, ext: str, prefix: str) -> str:
    """Generate unique filename."""
    return f"{prefix}_{user_id}_{uuid.uuid4().hex[:8]}{ext}"


async def save_file(file: UploadFile, directory: str, filename: str) -> str:
    """Save uploaded file and return the path."""
    filepath = os.path.join(directory, filename)

    # Read and validate size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Save file
    with open(filepath, "wb") as f:
        f.write(contents)

    return filepath


def delete_old_file(directory: str, filename: str):
    """Delete old file if it exists."""
    if filename:
        old_path = os.path.join(directory, filename)
        if os.path.exists(old_path):
            os.remove(old_path)


# Resume endpoints
@router.post("/resume")
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user's resume/CV."""
    ext = validate_file_extension(file.filename, ALLOWED_RESUME_EXTENSIONS)
    filename = generate_filename(current_user.id, ext, "resume")

    # Delete old resume
    delete_old_file(RESUME_DIR, current_user.cv_filename)

    # Save new file
    await save_file(file, RESUME_DIR, filename)

    # Update user record
    current_user.cv_filename = filename
    db.commit()

    return {"filename": filename, "message": "Resume uploaded successfully"}


@router.get("/resume")
def download_resume(
    current_user: User = Depends(get_current_user)
):
    """Download user's resume."""
    if not current_user.cv_filename:
        raise HTTPException(status_code=404, detail="No resume uploaded")

    filepath = os.path.join(RESUME_DIR, current_user.cv_filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Resume file not found")

    return FileResponse(
        filepath,
        filename=current_user.cv_filename,
        media_type="application/octet-stream"
    )


@router.delete("/resume")
def delete_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user's resume."""
    if not current_user.cv_filename:
        raise HTTPException(status_code=404, detail="No resume to delete")

    delete_old_file(RESUME_DIR, current_user.cv_filename)
    current_user.cv_filename = None
    db.commit()

    return {"message": "Resume deleted"}


# Transcript endpoints
@router.post("/transcript")
async def upload_transcript(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user's transcript."""
    ext = validate_file_extension(file.filename, ALLOWED_TRANSCRIPT_EXTENSIONS)
    filename = generate_filename(current_user.id, ext, "transcript")

    # Delete old transcript
    delete_old_file(TRANSCRIPT_DIR, current_user.transcript_filename)

    # Save new file
    await save_file(file, TRANSCRIPT_DIR, filename)

    # Update user record
    current_user.transcript_filename = filename
    db.commit()

    return {"filename": filename, "message": "Transcript uploaded successfully"}


@router.get("/transcript")
def download_transcript(
    current_user: User = Depends(get_current_user)
):
    """Download user's transcript."""
    if not current_user.transcript_filename:
        raise HTTPException(status_code=404, detail="No transcript uploaded")

    filepath = os.path.join(TRANSCRIPT_DIR, current_user.transcript_filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Transcript file not found")

    return FileResponse(
        filepath,
        filename=current_user.transcript_filename,
        media_type="application/pdf"
    )


@router.delete("/transcript")
def delete_transcript(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user's transcript."""
    if not current_user.transcript_filename:
        raise HTTPException(status_code=404, detail="No transcript to delete")

    delete_old_file(TRANSCRIPT_DIR, current_user.transcript_filename)
    current_user.transcript_filename = None
    db.commit()

    return {"message": "Transcript deleted"}


# Profile picture endpoints
@router.post("/profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user's profile picture."""
    ext = validate_file_extension(file.filename, ALLOWED_IMAGE_EXTENSIONS)
    filename = generate_filename(current_user.id, ext, "profile")

    # Delete old profile picture (extract filename from URL if exists)
    if current_user.profile_picture_url:
        old_filename = os.path.basename(current_user.profile_picture_url)
        delete_old_file(PROFILE_PICTURE_DIR, old_filename)

    # Save new file
    await save_file(file, PROFILE_PICTURE_DIR, filename)

    # Update user record with relative URL
    current_user.profile_picture_url = f"/files/profile-picture/{filename}"
    db.commit()

    return {
        "filename": filename,
        "url": current_user.profile_picture_url,
        "message": "Profile picture uploaded successfully"
    }


@router.get("/profile-picture/{filename}")
def get_profile_picture(filename: str):
    """Get a profile picture by filename (public endpoint)."""
    filepath = os.path.join(PROFILE_PICTURE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Profile picture not found")

    return FileResponse(filepath)


@router.delete("/profile-picture")
def delete_profile_picture(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user's profile picture."""
    if not current_user.profile_picture_url:
        raise HTTPException(status_code=404, detail="No profile picture to delete")

    old_filename = os.path.basename(current_user.profile_picture_url)
    delete_old_file(PROFILE_PICTURE_DIR, old_filename)
    current_user.profile_picture_url = None
    db.commit()

    return {"message": "Profile picture deleted"}

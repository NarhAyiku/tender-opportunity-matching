from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List

from app.security import get_db, get_current_user
from app.models.user import User
from app.schemas.profile import (
    UserProfileResponse,
    UserProfileUpdate,
    calculate_profile_completion,
)

router = APIRouter(prefix="/users", tags=["users"])


def user_to_response(user: User) -> dict:
    """Convert a User model to a response dict with computed fields."""
    response = {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "headline": user.headline,
        "bio": user.bio,
        "skills": user.skills or [],
        "work_experiences": user.work_experiences or [],
        "education_entries": user.education_entries or [],
        "projects": user.projects or [],
        "languages": user.languages or [],
        "interests": user.interests or [],
        "awards": user.awards or [],
        "goals": user.goals,
        "cv_filename": user.cv_filename,
        "transcript_filename": user.transcript_filename,
        "profile_picture_url": user.profile_picture_url,
        "phone": user.phone,
        "linkedin_url": user.linkedin_url,
        "github_url": user.github_url,
        "portfolio_url": user.portfolio_url,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "updated_at": user.updated_at,
        "profile_completion_percentage": calculate_profile_completion(user),
    }
    return response


@router.get("/me", response_model=UserProfileResponse)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """Get the current authenticated user's profile."""
    return user_to_response(current_user)


@router.put("/me", response_model=UserProfileResponse)
def update_my_profile(
    payload: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update the current authenticated user's profile."""
    update_data = payload.model_dump(exclude_unset=True)

    # Convert Pydantic models to dicts for JSON storage
    for field in ["work_experiences", "education_entries", "projects", "languages", "awards"]:
        if field in update_data and update_data[field] is not None:
            update_data[field] = [item.model_dump() if hasattr(item, 'model_dump') else item for item in update_data[field]]

    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)
    return user_to_response(current_user)


@router.get("/{user_id}", response_model=UserProfileResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """Get a user's public profile by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_to_response(user)

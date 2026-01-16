from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.security import get_db, get_current_user
from app.models.user import User
from app.models.preferences import UserPreferences
from app.schemas.preferences import (
    UserPreferencesCreate,
    UserPreferencesUpdate,
    UserPreferencesResponse,
)

router = APIRouter(prefix="/preferences", tags=["preferences"])


def preferences_to_response(prefs: UserPreferences) -> dict:
    """Convert a UserPreferences model to a response dict."""
    return {
        "id": prefs.id,
        "user_id": prefs.user_id,
        "desired_job_titles": prefs.desired_job_titles or [],
        "preferred_locations": prefs.preferred_locations or [],
        "willing_to_relocate": prefs.willing_to_relocate or "no",
        "salary_min": prefs.salary_min,
        "salary_max": prefs.salary_max,
        "salary_currency": prefs.salary_currency or "USD",
        "job_levels": prefs.job_levels or [],
        "work_arrangements": prefs.work_arrangements or [],
        "opportunity_types": prefs.opportunity_types or [],
        "preferred_industries": prefs.preferred_industries or [],
        "company_sizes": prefs.company_sizes or [],
    }


@router.get("/me", response_model=UserPreferencesResponse)
def get_my_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get the current user's job preferences."""
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    if not prefs:
        # Return empty preferences if none exist
        return {
            "id": 0,
            "user_id": current_user.id,
            "desired_job_titles": [],
            "preferred_locations": [],
            "willing_to_relocate": "no",
            "salary_min": None,
            "salary_max": None,
            "salary_currency": "USD",
            "job_levels": [],
            "work_arrangements": [],
            "opportunity_types": [],
            "preferred_industries": [],
            "company_sizes": [],
        }

    return preferences_to_response(prefs)


@router.post("/me", response_model=UserPreferencesResponse)
def create_my_preferences(
    payload: UserPreferencesCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create job preferences for the current user."""
    # Check if preferences already exist
    existing = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Preferences already exist. Use PUT to update."
        )

    # Convert Pydantic models to dicts for JSON storage
    data = payload.model_dump()
    if data.get("preferred_locations"):
        data["preferred_locations"] = [
            loc.model_dump() if hasattr(loc, 'model_dump') else loc
            for loc in payload.preferred_locations
        ]

    prefs = UserPreferences(
        user_id=current_user.id,
        **data
    )
    db.add(prefs)
    db.commit()
    db.refresh(prefs)
    return preferences_to_response(prefs)


@router.put("/me", response_model=UserPreferencesResponse)
def update_my_preferences(
    payload: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update job preferences for the current user."""
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    # If no preferences exist, create them
    if not prefs:
        prefs = UserPreferences(user_id=current_user.id)
        db.add(prefs)

    update_data = payload.model_dump(exclude_unset=True)

    # Convert Pydantic models to dicts for JSON storage
    if "preferred_locations" in update_data and update_data["preferred_locations"] is not None:
        update_data["preferred_locations"] = [
            loc.model_dump() if hasattr(loc, 'model_dump') else loc
            for loc in payload.preferred_locations
        ]

    for field, value in update_data.items():
        setattr(prefs, field, value)

    db.commit()
    db.refresh(prefs)
    return preferences_to_response(prefs)


@router.delete("/me")
def delete_my_preferences(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete job preferences for the current user."""
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    if not prefs:
        raise HTTPException(status_code=404, detail="No preferences to delete")

    db.delete(prefs)
    db.commit()
    return {"deleted": True}

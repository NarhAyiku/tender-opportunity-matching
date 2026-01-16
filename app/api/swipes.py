from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from typing import List, Optional, Tuple
from datetime import datetime, date, timedelta

from app.security import get_db, get_current_user
from app.models.user import User
from app.models.swipe import UserSwipe
from app.models.opportunity import Opportunity
from app.schemas.swipe import (
    SwipeCreate, SwipeResponse, SwipeAction, SwipeEdit, 
    SwipeLimitsResponse, SwipeWithOpportunity
)
from app.services.application_generator import generate_preview_data

router = APIRouter(prefix="/swipes", tags=["swipes"])


def check_daily_swipe_limit(user: User, db: Session) -> Tuple[bool, int, int]:
    """
    Check if user has reached daily swipe limit.
    Returns: (can_swipe, used_today, limit)
    """
    today = date.today()
    limit = user.daily_swipe_limit or 50
    
    # Count swipes today
    used_today = db.query(func.count(UserSwipe.id)).filter(
        UserSwipe.user_id == user.id,
        UserSwipe.swipe_date == today
    ).scalar() or 0
    
    can_swipe = used_today < limit
    return can_swipe, used_today, limit


@router.post("", response_model=SwipeResponse)
def record_swipe(
    payload: SwipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a swipe action (like, dislike, or save). For 'like' actions, creates pending swipe with preview data."""
    # Check if opportunity exists
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == payload.opportunity_id
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Check daily swipe limit (only for new swipes)
    existing = db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.opportunity_id == payload.opportunity_id
    ).first()

    if not existing:
        can_swipe, used_today, limit = check_daily_swipe_limit(current_user, db)
        if not can_swipe:
            raise HTTPException(
                status_code=429,
                detail=f"Daily swipe limit reached ({limit} swipes). You've used {used_today} today. Limit resets at midnight."
            )

    # If updating existing swipe, just update the action
    if existing:
        old_action = existing.action
        existing.action = payload.action.value
        
        # If changing to like, generate preview data and set status to pending
        if payload.action.value == "like":
            if not existing.preview_data:
                preview_data = generate_preview_data(current_user, opportunity)
                preview_data["generated_at"] = datetime.utcnow().isoformat()
                existing.preview_data = preview_data
            existing.status = "pending"
        # If changing FROM like to dislike/save, reset status (no longer pending)
        elif old_action == "like" and payload.action.value in ["dislike", "save"]:
            existing.status = "rejected"  # Mark as rejected since user changed their mind
            existing.preview_data = None  # Clear preview data
            existing.edited_data = None  # Clear edited data
        
        db.commit()
        db.refresh(existing)
        return existing

    # Create new swipe
    swipe = UserSwipe(
        user_id=current_user.id,
        opportunity_id=payload.opportunity_id,
        action=payload.action.value,
        swipe_date=date.today()
    )

    # For "like" actions, generate preview data and set status to pending
    if payload.action.value == "like":
        preview_data = generate_preview_data(current_user, opportunity)
        preview_data["generated_at"] = datetime.utcnow().isoformat()
        swipe.preview_data = preview_data
        swipe.status = "pending"

    try:
        db.add(swipe)
        db.commit()
        db.refresh(swipe)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Swipe already recorded")

    return swipe


@router.get("", response_model=List[SwipeResponse])
def get_my_swipes(
    action: Optional[SwipeAction] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's swipe history, optionally filtered by action."""
    query = db.query(UserSwipe).filter(UserSwipe.user_id == current_user.id)

    if action:
        query = query.filter(UserSwipe.action == action.value)

    return query.order_by(UserSwipe.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/saved", response_model=List[SwipeResponse])
def get_saved_opportunities(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's saved opportunities."""
    return db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.action == "save"
    ).order_by(UserSwipe.created_at.desc()).offset(skip).limit(limit).all()


@router.get("/liked", response_model=List[SwipeResponse])
def get_liked_opportunities(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's liked opportunities."""
    return db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.action == "like"
    ).order_by(UserSwipe.created_at.desc()).offset(skip).limit(limit).all()


@router.delete("/{swipe_id}")
def delete_swipe(
    swipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Remove a swipe (mainly for unsaving)."""
    swipe = db.query(UserSwipe).filter(
        UserSwipe.id == swipe_id,
        UserSwipe.user_id == current_user.id
    ).first()

    if not swipe:
        raise HTTPException(status_code=404, detail="Swipe not found")

    db.delete(swipe)
    db.commit()
    return {"deleted": True, "id": swipe_id}


@router.get("/stats")
def get_swipe_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get swipe statistics for the current user."""
    likes = db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.action == "like"
    ).count()

    dislikes = db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.action == "dislike"
    ).count()

    saves = db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.action == "save"
    ).count()

    return {
        "likes": likes,
        "dislikes": dislikes,
        "saves": saves,
        "total": likes + dislikes + saves
    }


@router.get("/limits", response_model=SwipeLimitsResponse)
def get_swipe_limits(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's daily swipe limits and usage."""
    can_swipe, used_today, limit = check_daily_swipe_limit(current_user, db)
    
    # Calculate reset time (midnight tomorrow)
    tomorrow = date.today() + timedelta(days=1)
    reset_time = datetime.combine(tomorrow, datetime.min.time())
    
    return SwipeLimitsResponse(
        daily_limit=limit,
        used_today=used_today,
        remaining=max(0, limit - used_today),
        reset_time=reset_time
    )


@router.get("/pending", response_model=List[SwipeWithOpportunity])
def get_pending_swipes(
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's pending swipes (likes that need approval)."""
    swipes = db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.action == "like",
        UserSwipe.status == "pending"
    ).order_by(UserSwipe.created_at.desc()).offset(skip).limit(limit).all()
    
    result = []
    for swipe in swipes:
        opp = swipe.opportunity
        result.append({
            "id": swipe.id,
            "user_id": swipe.user_id,
            "opportunity_id": swipe.opportunity_id,
            "action": swipe.action,
            "status": swipe.status,
            "created_at": swipe.created_at,
            "swipe_date": swipe.swipe_date,
            "preview_data": swipe.preview_data,
            "edited_data": swipe.edited_data,
            "opportunity": {
                "id": opp.id,
                "title": opp.title,
                "company_name": opp.company_name,
                "company_logo_url": opp.company_logo_url,
                "city": opp.city,
                "country": opp.country,
                "is_remote": opp.is_remote,
                "opportunity_type": opp.opportunity_type,
                "description": opp.description,
            }
        })
    
    return result


@router.post("/{swipe_id}/edit", response_model=SwipeResponse)
def edit_swipe(
    swipe_id: int,
    payload: SwipeEdit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save user edits to a pending swipe's preview data."""
    swipe = db.query(UserSwipe).filter(
        UserSwipe.id == swipe_id,
        UserSwipe.user_id == current_user.id
    ).first()

    if not swipe:
        raise HTTPException(status_code=404, detail="Swipe not found")

    # Only allow editing pending LIKE swipes
    if swipe.status != "pending":
        raise HTTPException(
            status_code=400, 
            detail="Can only edit pending swipes"
        )
    
    if swipe.action != "like":
        raise HTTPException(
            status_code=400,
            detail="Can only edit 'like' swipes. Dislike and save swipes cannot be edited."
        )

    # Update edited_data
    swipe.edited_data = payload.edited_data
    db.commit()
    db.refresh(swipe)

    return swipe


@router.post("/{swipe_id}/approve", response_model=SwipeResponse)
def approve_swipe(
    swipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve a pending swipe, creating the application."""
    swipe = db.query(UserSwipe).filter(
        UserSwipe.id == swipe_id,
        UserSwipe.user_id == current_user.id
    ).first()

    if not swipe:
        raise HTTPException(status_code=404, detail="Swipe not found")

    if swipe.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Swipe is already {swipe.status}, cannot approve"
        )

    if swipe.action != "like":
        raise HTTPException(
            status_code=400,
            detail="Can only approve 'like' swipes"
        )

    # Update swipe status to approved
    swipe.status = "approved"
    db.commit()
    db.refresh(swipe)

    # Application will be created by the application flow when it checks for approved swipes
    # This is handled in the applications.py update

    return swipe


@router.post("/{swipe_id}/reject")
def reject_swipe(
    swipe_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reject a pending swipe (user decides not to proceed)."""
    swipe = db.query(UserSwipe).filter(
        UserSwipe.id == swipe_id,
        UserSwipe.user_id == current_user.id
    ).first()

    if not swipe:
        raise HTTPException(status_code=404, detail="Swipe not found")

    # Only allow rejecting pending LIKE swipes
    if swipe.status != "pending":
        raise HTTPException(
            status_code=400,
            detail=f"Swipe is already {swipe.status}, cannot reject"
        )
    
    if swipe.action != "like":
        raise HTTPException(
            status_code=400,
            detail="Can only reject 'like' swipes. Dislike and save swipes cannot be rejected."
        )

    swipe.status = "rejected"
    db.commit()

    return {"message": "Swipe rejected", "swipe_id": swipe_id}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.security import get_db, get_current_user
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.application import Application, ApplicationEvent
from app.models.swipe import UserSwipe
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationListItem,
    ApplicationDetail,
    ApplicationEventCreate,
    ApplicationEventResponse,
    ApplicationStatus,
    ApplicationEventType,
)

router = APIRouter(prefix="/applications", tags=["applications"])


def add_event(db: Session, application_id: int, event_type: str, description: str = None, event_data: dict = None):
    """Helper to add an event to an application."""
    event = ApplicationEvent(
        application_id=application_id,
        event_type=event_type,
        description=description,
        event_data=event_data or {}
    )
    db.add(event)
    return event


@router.post("", response_model=ApplicationResponse)
def create_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new application from an approved swipe.
    Applications are now only created when user approves a pending swipe.
    """
    # Check if opportunity exists
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == payload.opportunity_id
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Check if application already exists
    existing = db.query(Application).filter(
        Application.user_id == current_user.id,
        Application.opportunity_id == payload.opportunity_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Application already exists for this opportunity")

    # Check for approved swipe
    approved_swipe = db.query(UserSwipe).filter(
        UserSwipe.user_id == current_user.id,
        UserSwipe.opportunity_id == payload.opportunity_id,
        UserSwipe.action == "like",
        UserSwipe.status == "approved"
    ).first()

    # Use edited_data if available, otherwise use preview_data, otherwise use payload
    cover_letter = payload.cover_letter
    if approved_swipe:
        if approved_swipe.edited_data and "cover_letter" in approved_swipe.edited_data:
            cover_letter = approved_swipe.edited_data["cover_letter"]
        elif approved_swipe.preview_data and "cover_letter" in approved_swipe.preview_data:
            cover_letter = approved_swipe.preview_data["cover_letter"]

    # Create application with resume snapshot
    application = Application(
        user_id=current_user.id,
        opportunity_id=payload.opportunity_id,
        cover_letter=cover_letter,
        notes=payload.notes,
        resume_snapshot=current_user.cv_filename,
        status="pending"
    )
    db.add(application)
    db.flush()  # Get the ID

    # Add initial event
    add_event(
        db,
        application.id,
        ApplicationEventType.SWIPED_RIGHT.value,
        f"Applied to {opportunity.title}"
    )

    # Update swipe status to submitted
    if approved_swipe:
        approved_swipe.status = "submitted"

    db.commit()
    db.refresh(application)
    return application


@router.get("", response_model=List[ApplicationListItem])
def list_my_applications(
    status: Optional[ApplicationStatus] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List user's applications with optional status filter."""
    query = db.query(Application).filter(Application.user_id == current_user.id)

    if status:
        query = query.filter(Application.status == status.value)

    applications = query.order_by(Application.updated_at.desc()).offset(skip).limit(limit).all()

    # Build response with opportunity details
    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "opportunity_id": app.opportunity_id,
            "status": app.status,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
            "submitted_at": app.submitted_at,
            "opportunity": {
                "id": app.opportunity.id,
                "title": app.opportunity.title,
                "company_name": app.opportunity.company_name,
                "company_logo_url": app.opportunity.company_logo_url,
                "city": app.opportunity.city,
                "country": app.opportunity.country,
            }
        })

    return result


@router.get("/stats")
def get_application_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application statistics for the current user."""
    base_query = db.query(Application).filter(Application.user_id == current_user.id)

    return {
        "total": base_query.count(),
        "pending": base_query.filter(Application.status == "pending").count(),
        "submitted": base_query.filter(Application.status == "submitted").count(),
        "viewed": base_query.filter(Application.status == "viewed").count(),
        "interview": base_query.filter(Application.status == "interview").count(),
        "offer": base_query.filter(Application.status == "offer").count(),
        "rejected": base_query.filter(Application.status == "rejected").count(),
        "withdrawn": base_query.filter(Application.status == "withdrawn").count(),
    }


@router.get("/{application_id}", response_model=ApplicationDetail)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get single application with full timeline."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    return {
        "id": application.id,
        "user_id": application.user_id,
        "opportunity_id": application.opportunity_id,
        "status": application.status,
        "cover_letter": application.cover_letter,
        "resume_snapshot": application.resume_snapshot,
        "notes": application.notes,
        "created_at": application.created_at,
        "updated_at": application.updated_at,
        "submitted_at": application.submitted_at,
        "opportunity": {
            "id": application.opportunity.id,
            "title": application.opportunity.title,
            "company_name": application.opportunity.company_name,
            "company_logo_url": application.opportunity.company_logo_url,
            "city": application.opportunity.city,
            "country": application.opportunity.country,
        },
        "events": [
            {
                "id": e.id,
                "application_id": e.application_id,
                "event_type": e.event_type,
                "description": e.description,
                "event_data": e.event_data,
                "created_at": e.created_at,
            }
            for e in application.events
        ]
    }


@router.put("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update application (status, notes, etc.)."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    update_data = payload.model_dump(exclude_unset=True)

    # Track status change
    if "status" in update_data and update_data["status"]:
        old_status = application.status
        new_status = update_data["status"].value if hasattr(update_data["status"], 'value') else update_data["status"]
        update_data["status"] = new_status

        if old_status != new_status:
            add_event(
                db,
                application.id,
                f"status_changed",
                f"Status changed from {old_status} to {new_status}"
            )

    for field, value in update_data.items():
        setattr(application, field, value)

    db.commit()
    db.refresh(application)
    return application


@router.post("/{application_id}/events", response_model=ApplicationEventResponse)
def add_application_event(
    application_id: int,
    payload: ApplicationEventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add an event to application timeline."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    event = add_event(
        db,
        application.id,
        payload.event_type.value,
        payload.description,
        payload.event_data
    )

    db.commit()
    db.refresh(event)
    return event


@router.post("/{application_id}/submit")
def submit_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit application to employer."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.status != "pending":
        raise HTTPException(status_code=400, detail="Application already submitted or closed")

    # Update status and timestamp
    application.status = "submitted"
    application.submitted_at = datetime.utcnow()

    # Add event
    add_event(
        db,
        application.id,
        ApplicationEventType.SUBMITTED.value,
        "Application submitted to employer"
    )

    db.commit()
    db.refresh(application)

    return {
        "message": "Application submitted successfully",
        "application_id": application.id,
        "status": application.status,
        "submitted_at": application.submitted_at
    }


@router.post("/{application_id}/withdraw")
def withdraw_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Withdraw application."""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    if application.status == "withdrawn":
        raise HTTPException(status_code=400, detail="Application already withdrawn")

    old_status = application.status
    application.status = "withdrawn"

    # Add event
    add_event(
        db,
        application.id,
        ApplicationEventType.WITHDRAWN.value,
        f"Application withdrawn (was {old_status})"
    )

    db.commit()

    return {
        "message": "Application withdrawn",
        "application_id": application.id,
        "status": application.status
    }

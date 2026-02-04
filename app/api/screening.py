from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.schemas.screening import ScreeningStatusResponse, ScreeningCompleteRequest
from app.security import require_user

router = APIRouter(prefix="/screening", tags=["screening"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _compute_status(user: User) -> ScreeningStatusResponse:
    missing = []
    if not user.age:
        missing.append("age")
    if not user.location:
        missing.append("location")
    if not user.preferred_countries:
        missing.append("preferred_countries")
    if not user.consent_share_documents:
        missing.append("consent_share_documents")

    completed = len(missing) == 0
    return ScreeningStatusResponse(
        completed=completed,
        missing=missing,
        age=user.age,
        location=user.location,
        preferred_countries=user.preferred_countries or [],
        consent_share_documents=bool(user.consent_share_documents),
        screening_completed_at=user.screening_completed_at
    )


@router.get("/status", response_model=ScreeningStatusResponse, dependencies=[Depends(require_user)])
def screening_status(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    return _compute_status(user)


@router.post("/complete", response_model=ScreeningStatusResponse, dependencies=[Depends(require_user)])
def screening_complete(
    payload: ScreeningCompleteRequest,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()
    user.age = payload.age
    user.location = payload.location
    user.preferred_countries = payload.preferred_countries or []
    user.consent_share_documents = payload.consent_share_documents
    user.screening_completed = True
    user.screening_completed_at = datetime.utcnow()
    db.add(user)
    db.commit()
    db.refresh(user)
    return _compute_status(user)

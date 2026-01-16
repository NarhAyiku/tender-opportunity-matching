from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.security import require_admin
from app.schemas.opportunity import (
    OpportunityCreate,
    OpportunityUpdate,
    OpportunityResponse,
    OpportunityCardResponse,
)

router = APIRouter(prefix="/opportunities", tags=["opportunities"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def normalize_skills(skills: Optional[List[str]]) -> List[str]:
    if not skills:
        return []
    cleaned = {s.strip().lower() for s in skills if isinstance(s, str) and s.strip()}
    return sorted(cleaned)


@router.post("", response_model=OpportunityResponse, dependencies=[Depends(require_admin)])
def create_opportunity(payload: OpportunityCreate, db: Session = Depends(get_db)):
    """Create a new opportunity (admin only)."""
    skills = normalize_skills(payload.required_skills)
    preferred = normalize_skills(payload.preferred_skills)

    # Check for duplicate
    existing = (
        db.query(Opportunity)
        .filter(
            Opportunity.title == payload.title,
            Opportunity.company_name == payload.company_name,
            Opportunity.required_skills == skills,
        )
        .first()
    )
    if existing:
        return existing

    opportunity = Opportunity(
        title=payload.title,
        description=payload.description,
        required_skills=skills,
        preferred_skills=preferred,
        category=payload.category,
        company_name=payload.company_name,
        company_logo_url=payload.company_logo_url,
        company_website=payload.company_website,
        company_size=payload.company_size,
        city=payload.city,
        state=payload.state,
        country=payload.country,
        is_remote=payload.is_remote,
        salary_min=payload.salary_min,
        salary_max=payload.salary_max,
        salary_currency=payload.salary_currency,
        salary_period=payload.salary_period,
        is_salary_visible=payload.is_salary_visible,
        opportunity_type=payload.opportunity_type,
        work_arrangement=payload.work_arrangement,
        experience_level=payload.experience_level,
        education_requirement=payload.education_requirement,
        application_url=payload.application_url,
        application_email=payload.application_email,
        application_deadline=payload.application_deadline,
        benefits=payload.benefits,
        award_amount=payload.award_amount,
        award_currency=payload.award_currency,
        eligibility_criteria=payload.eligibility_criteria,
    )
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity


@router.get("", response_model=List[OpportunityResponse])
def list_opportunities(
    opportunity_type: Optional[str] = None,
    experience_level: Optional[str] = None,
    work_arrangement: Optional[str] = None,
    is_remote: Optional[bool] = None,
    is_active: bool = True,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """List opportunities with optional filters."""
    query = db.query(Opportunity).filter(Opportunity.is_active == is_active)

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)
    if experience_level:
        query = query.filter(Opportunity.experience_level == experience_level)
    if work_arrangement:
        query = query.filter(Opportunity.work_arrangement == work_arrangement)
    if is_remote is not None:
        query = query.filter(Opportunity.is_remote == is_remote)

    return query.order_by(Opportunity.posted_at.desc()).offset(skip).limit(limit).all()


@router.get("/cards", response_model=List[OpportunityCardResponse])
def list_opportunity_cards(
    opportunity_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List opportunities in minimal card format for swipe UI."""
    query = db.query(Opportunity).filter(Opportunity.is_active == True)

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)

    return query.order_by(Opportunity.posted_at.desc()).offset(skip).limit(limit).all()


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """Get a single opportunity by ID."""
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


@router.put("/{opportunity_id}", response_model=OpportunityResponse, dependencies=[Depends(require_admin)])
def update_opportunity(opportunity_id: int, payload: OpportunityUpdate, db: Session = Depends(get_db)):
    """Update an opportunity (admin only)."""
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    data = payload.model_dump(exclude_unset=True)

    # Normalize skills if provided
    if "required_skills" in data:
        data["required_skills"] = normalize_skills(data["required_skills"])
    if "preferred_skills" in data:
        data["preferred_skills"] = normalize_skills(data["preferred_skills"])

    for k, v in data.items():
        setattr(opp, k, v)

    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/{opportunity_id}", dependencies=[Depends(require_admin)])
def delete_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """Delete an opportunity (admin only)."""
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    db.delete(opp)
    db.commit()
    return {"deleted": True, "id": opportunity_id}

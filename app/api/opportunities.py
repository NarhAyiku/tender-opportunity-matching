from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import SessionLocal
from app.models.opportunity import Opportunity
from app.security import require_admin

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


class OpportunityCreate(BaseModel):
    title: str
    description: Optional[str] = None
    required_skills: List[str] = []
    category: Optional[str] = None


class OpportunityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    category: Optional[str] = None


@router.post("", dependencies=[Depends(require_admin)])
def create_opportunity(payload: OpportunityCreate, db: Session = Depends(get_db)):
    skills = normalize_skills(payload.required_skills)

    existing = (
        db.query(Opportunity)
        .filter(
            Opportunity.title == payload.title,
            Opportunity.required_skills == skills,
            Opportunity.category == payload.category,
        )
        .first()
    )
    if existing:
        return existing

    opportunity = Opportunity(
        title=payload.title,
        description=payload.description,
        required_skills=skills,
        category=payload.category,
    )
    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)
    return opportunity


@router.get("")
def list_opportunities(db: Session = Depends(get_db)):
    return db.query(Opportunity).order_by(Opportunity.id.desc()).all()


@router.get("/{opportunity_id}")
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")
    return opp


@router.put("/{opportunity_id}", dependencies=[Depends(require_admin)])
def update_opportunity(opportunity_id: int, payload: OpportunityUpdate, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    data = payload.model_dump(exclude_unset=True)

    if "required_skills" in data:
        data["required_skills"] = normalize_skills(data["required_skills"])

    for k, v in data.items():
        setattr(opp, k, v)

    db.commit()
    db.refresh(opp)
    return opp


@router.delete("/{opportunity_id}", dependencies=[Depends(require_admin)])
def delete_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    opp = db.query(Opportunity).filter(Opportunity.id == opportunity_id).first()
    if not opp:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    db.delete(opp)
    db.commit()
    return {"deleted": True, "id": opportunity_id}

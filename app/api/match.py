from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import SessionLocal
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.swipe import UserSwipe
from app.security import get_db, get_current_user

router = APIRouter(prefix="/match", tags=["match"])


def calculate_match_score(user_skills: set, opp_skills: set) -> float:
    """Calculate Jaccard similarity score between user skills and opportunity requirements."""
    if not opp_skills:
        return 1.0  # No requirements = perfect match

    overlap = user_skills & opp_skills
    union = user_skills | opp_skills

    return round(len(overlap) / max(len(union), 1), 3)


@router.get("/feed")
def get_opportunity_feed(
    limit: int = 10,
    opportunity_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get personalized opportunity feed excluding already swiped opportunities.
    Returns opportunities ranked by match score.
    """
    # Get IDs of already-swiped opportunities
    swiped_ids = db.query(UserSwipe.opportunity_id).filter(
        UserSwipe.user_id == current_user.id
    ).all()
    swiped_ids = [s[0] for s in swiped_ids]

    # Query opportunities excluding swiped ones
    query = db.query(Opportunity).filter(
        Opportunity.is_active == True
    )

    if swiped_ids:
        query = query.filter(Opportunity.id.not_in(swiped_ids))

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)

    opportunities = query.all()

    # Score and rank based on user skills
    user_skills = set(current_user.skills or [])

    scored = []
    for opp in opportunities:
        opp_skills = set(opp.required_skills or [])
        score = calculate_match_score(user_skills, opp_skills)
        overlap = user_skills & opp_skills

        scored.append({
            "opportunity": {
                "id": opp.id,
                "title": opp.title,
                "company_name": opp.company_name,
                "company_logo_url": opp.company_logo_url,
                "city": opp.city,
                "country": opp.country,
                "is_remote": opp.is_remote,
                "opportunity_type": opp.opportunity_type,
                "work_arrangement": opp.work_arrangement,
                "experience_level": opp.experience_level,
                "education_requirement": opp.education_requirement,
                "salary_min": opp.salary_min,
                "salary_max": opp.salary_max,
                "salary_currency": opp.salary_currency,
                "is_salary_visible": opp.is_salary_visible,
                "required_skills": opp.required_skills,
                "description": opp.description,
            },
            "score": score,
            "matched_skills": sorted(overlap),
        })

    # Sort by score (best matches first)
    scored.sort(key=lambda x: x["score"], reverse=True)

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "skills": current_user.skills
        },
        "feed": scored[:limit],
        "total_available": len(scored),
        "already_swiped": len(swiped_ids)
    }


@router.get("/{user_id}")
def match_user(
    user_id: int,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get opportunity matches for a user (legacy endpoint).
    User can only access their own matches.
    """
    # Verify user can only access their own matches
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    opportunities = db.query(Opportunity).filter(Opportunity.is_active == True).all()

    user_skills = set(user.skills or [])

    scored = []
    for opp in opportunities:
        opp_skills = set(opp.required_skills or [])
        overlap = user_skills & opp_skills
        score = calculate_match_score(user_skills, opp_skills)

        scored.append({
            "opportunity_id": opp.id,
            "title": opp.title,
            "category": opp.category,
            "company_name": opp.company_name,
            "required_skills": opp.required_skills,
            "score": score,
            "matched_skills": sorted(overlap),
        })

    scored.sort(key=lambda x: x["score"], reverse=True)

    return {
        "user": {"id": user.id, "name": user.name, "skills": user.skills},
        "matches": scored[:limit],
    }

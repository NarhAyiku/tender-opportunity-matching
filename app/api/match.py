from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import logging

from app.database import SessionLocal
from app.models.user import User
from app.models.opportunity import Opportunity
from app.models.swipe import UserSwipe
from app.models.preferences import UserPreferences
from app.security import get_db, get_current_user
from app.services.matching import get_matching_service, MatchResult

router = APIRouter(prefix="/match", tags=["match"])
logger = logging.getLogger(__name__)


def calculate_match_score(user_skills: set, opp_skills: set) -> float:
    """Calculate Jaccard similarity score between user skills and opportunity requirements."""
    if not opp_skills:
        return 1.0  # No requirements = perfect match

    overlap = user_skills & opp_skills
    union = user_skills | opp_skills

    return round(len(overlap) / max(len(union), 1), 3)


def user_to_dict(user: User) -> dict:
    """Convert User model to dictionary for matching service."""
    return {
        "id": user.id,
        "name": user.name,
        "headline": user.headline,
        "bio": user.bio,
        "skills": user.skills or [],
        "work_experiences": user.work_experiences or [],
        "education_entries": user.education_entries or [],
        "projects": user.projects or [],
        "interests": user.interests or [],
        "goals": user.goals,
    }


def preferences_to_dict(prefs: Optional[UserPreferences]) -> dict:
    """Convert UserPreferences model to dictionary."""
    if not prefs:
        return {}
    return {
        "desired_job_titles": prefs.desired_job_titles or [],
        "preferred_locations": prefs.preferred_locations or [],
        "willing_to_relocate": prefs.willing_to_relocate,
        "salary_min": prefs.salary_min,
        "salary_max": prefs.salary_max,
        "salary_currency": prefs.salary_currency,
        "job_levels": prefs.job_levels or [],
        "work_arrangements": prefs.work_arrangements or [],
        "opportunity_types": prefs.opportunity_types or [],
        "preferred_industries": prefs.preferred_industries or [],
        "company_sizes": prefs.company_sizes or [],
    }


def opportunity_to_dict(opp: Opportunity) -> dict:
    """Convert Opportunity model to dictionary."""
    return {
        "id": opp.id,
        "title": opp.title,
        "description": opp.description,
        "company_name": opp.company_name,
        "company": opp.company,
        "company_logo_url": opp.company_logo_url,
        "company_size": opp.company_size,
        "location": opp.location,
        "city": opp.city,
        "country": opp.country,
        "is_remote": opp.is_remote,
        "salary_min": opp.salary_min,
        "salary_max": opp.salary_max,
        "salary_currency": opp.salary_currency,
        "is_salary_visible": opp.is_salary_visible,
        "job_type": opp.job_type,
        "opportunity_type": opp.opportunity_type,
        "work_arrangement": opp.work_arrangement,
        "experience_level": opp.experience_level,
        "education_requirement": opp.education_requirement,
        "required_skills": opp.required_skills or [],
        "preferred_skills": opp.preferred_skills or [],
        "category": opp.category,
        "url": opp.url,
        "application_url": opp.application_url,
        "source": opp.source,
    }


def _check_screening(user: User):
    """Block feed access if user has not completed screening (PRD section D)."""
    if not user.screening_completed:
        raise HTTPException(
            status_code=403,
            detail="Screening not complete. Complete screening before accessing the feed.",
        )


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
    _check_screening(current_user)

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
                "company_size": opp.company_size,
                "city": opp.city,
                "country": opp.country,
                "location": opp.location,
                "is_remote": opp.is_remote,
                "category": opp.category,
                "opportunity_type": opp.opportunity_type,
                "work_arrangement": opp.work_arrangement,
                "experience_level": opp.experience_level,
                "education_requirement": opp.education_requirement,
                "salary_min": opp.salary_min,
                "salary_max": opp.salary_max,
                "salary_currency": opp.salary_currency,
                "salary_period": opp.salary_period,
                "is_salary_visible": opp.is_salary_visible,
                "required_skills": opp.required_skills,
                "preferred_skills": opp.preferred_skills,
                "description": opp.description,
                "benefits": opp.benefits,
                "eligibility_criteria": opp.eligibility_criteria,
                "application_deadline": opp.application_deadline.isoformat() if opp.application_deadline else None,
                "url": opp.url,
                "source": opp.source,
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


# ==============================================================================
# AI-POWERED MATCHING ENDPOINTS
# ==============================================================================

@router.get("/ai/feed")
def get_ai_powered_feed(
    limit: int = Query(10, ge=1, le=50, description="Number of opportunities to return"),
    opportunity_type: Optional[str] = Query(None, description="Filter by type: job, internship, scholarship, grant"),
    use_preferences: bool = Query(True, description="Apply user preferences to scoring"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get AI-powered personalized opportunity feed.

    This endpoint uses semantic similarity (embeddings) combined with
    skills matching and user preferences to rank opportunities.

    **Scoring Components:**
    - 40% Semantic similarity (profile vs job description)
    - 30% Skills match (required + preferred skills)
    - 20% Preferences match (location, salary, work arrangement)
    - 10% Experience level alignment

    **Returns:**
    - Ranked list of opportunities with match scores
    - Breakdown of why each opportunity matched
    - User's matched skills for each opportunity
    """
    _check_screening(current_user)

    # Get IDs of already-swiped opportunities
    swiped_ids = db.query(UserSwipe.opportunity_id).filter(
        UserSwipe.user_id == current_user.id
    ).all()
    swiped_ids = [s[0] for s in swiped_ids]

    # Query opportunities excluding swiped ones
    query = db.query(Opportunity).filter(
        Opportunity.is_active == True,
        Opportunity.is_stale == False
    )

    if swiped_ids:
        query = query.filter(Opportunity.id.not_in(swiped_ids))

    if opportunity_type:
        query = query.filter(Opportunity.opportunity_type == opportunity_type)

    opportunities = query.all()

    if not opportunities:
        return {
            "user": {
                "id": current_user.id,
                "name": current_user.name,
            },
            "feed": [],
            "total_available": 0,
            "already_swiped": len(swiped_ids),
            "matching_method": "ai"
        }

    # Get user preferences if enabled
    user_preferences = None
    if use_preferences:
        prefs = db.query(UserPreferences).filter(
            UserPreferences.user_id == current_user.id
        ).first()
        user_preferences = preferences_to_dict(prefs)

    # Convert models to dicts
    user_data = user_to_dict(current_user)
    opp_dicts = [opportunity_to_dict(opp) for opp in opportunities]

    # Run AI matching
    try:
        matching_service = get_matching_service()
        match_results = matching_service.match_opportunities_batch(
            user_data=user_data,
            user_preferences=user_preferences,
            opportunities=opp_dicts
        )
    except Exception as e:
        logger.error(f"AI matching failed: {e}")
        # Fallback to basic scoring
        return get_opportunity_feed(
            limit=limit,
            opportunity_type=opportunity_type,
            current_user=current_user,
            db=db
        )

    # Build response
    feed = []
    opp_by_id = {opp.id: opp for opp in opportunities}

    for result in match_results[:limit]:
        opp = opp_by_id.get(result.opportunity_id)
        if not opp:
            continue

        feed.append({
            "opportunity": {
                "id": opp.id,
                "title": opp.title,
                "company_name": opp.company_name,
                "company": opp.company,
                "company_logo_url": opp.company_logo_url,
                "location": opp.location,
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
                "url": opp.url,
                "source": opp.source,
            },
            "match": {
                "overall_score": result.overall_score,
                "semantic_score": result.semantic_score,
                "skills_score": result.skills_score,
                "preferences_score": result.preferences_score,
                "experience_score": result.experience_score,
                "matched_skills": result.matched_skills,
                "reasons": result.match_reasons,
            }
        })

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "skills": current_user.skills
        },
        "feed": feed,
        "total_available": len(match_results),
        "already_swiped": len(swiped_ids),
        "matching_method": "ai"
    }


@router.get("/ai/score/{opportunity_id}")
def get_opportunity_match_score(
    opportunity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed match score for a single opportunity.

    Returns a breakdown of how well this opportunity matches the user's
    profile and preferences.
    """
    # Get opportunity
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()

    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Get user preferences
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    # Run matching
    matching_service = get_matching_service()
    result = matching_service.match_opportunity(
        user_data=user_to_dict(current_user),
        user_preferences=preferences_to_dict(prefs),
        opportunity=opportunity_to_dict(opportunity)
    )

    return {
        "opportunity_id": opportunity_id,
        "opportunity_title": opportunity.title,
        "user_id": current_user.id,
        "scores": {
            "overall": result.overall_score,
            "semantic": result.semantic_score,
            "skills": result.skills_score,
            "preferences": result.preferences_score,
            "experience": result.experience_score,
        },
        "matched_skills": result.matched_skills,
        "match_reasons": result.match_reasons,
        "score_weights": {
            "semantic": "40%",
            "skills": "30%",
            "preferences": "20%",
            "experience": "10%"
        }
    }


@router.post("/ai/explain")
def explain_match(
    opportunity_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a human-readable explanation of why an opportunity was matched.

    Useful for displaying "Why this match?" to users.
    """
    # Get opportunity
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()

    if not opportunity:
        raise HTTPException(status_code=404, detail="Opportunity not found")

    # Get user preferences
    prefs = db.query(UserPreferences).filter(
        UserPreferences.user_id == current_user.id
    ).first()

    # Run matching
    matching_service = get_matching_service()
    result = matching_service.match_opportunity(
        user_data=user_to_dict(current_user),
        user_preferences=preferences_to_dict(prefs),
        opportunity=opportunity_to_dict(opportunity)
    )

    # Build explanation
    explanations = []

    # Semantic match explanation
    if result.semantic_score >= 0.8:
        explanations.append("Your profile is highly relevant to this role")
    elif result.semantic_score >= 0.6:
        explanations.append("Your background aligns well with this position")
    elif result.semantic_score >= 0.4:
        explanations.append("Some aspects of your profile match this role")

    # Skills explanation
    if result.matched_skills:
        skills_str = ", ".join(result.matched_skills[:5])
        explanations.append(f"Your skills match: {skills_str}")
    elif result.skills_score >= 0.8:
        explanations.append("You have most of the required skills")

    # Add other match reasons
    for reason in result.match_reasons:
        if reason not in explanations:
            explanations.append(reason)

    # Experience level
    if result.experience_score >= 0.8:
        explanations.append("Experience level is a good fit")
    elif result.experience_score < 0.5:
        explanations.append("Experience level may be a stretch")

    return {
        "opportunity_id": opportunity_id,
        "match_percentage": int(result.overall_score * 100),
        "explanations": explanations[:6],
        "summary": f"{int(result.overall_score * 100)}% match based on your profile, skills, and preferences"
    }

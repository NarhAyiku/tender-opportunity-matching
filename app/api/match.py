from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.models.opportunity import Opportunity
from app.security import require_user, require_same_user

router = APIRouter(prefix="/match", tags=["match"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{user_id}", dependencies=[Depends(require_user)])
def match_user(
    user_id: int,
    limit: int = 10,
    db: Session = Depends(get_db),
    __=Depends(require_same_user),  # forces X-User-Id == user_id
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    opportunities = db.query(Opportunity).all()

    user_skills = set(user.skills or [])

    scored = []
    for opp in opportunities:
        opp_skills = set(opp.required_skills or [])

        overlap = user_skills & opp_skills
        union = user_skills | opp_skills

        # The fix: if no required skills, it's a perfect match
        if not opp_skills:
            score = 1.0
        else:
            score = round(len(overlap) / max(len(union), 1), 3)

        scored.append(
            {
                "opportunity_id": opp.id,
                "title": opp.title,
                "category": opp.category,
                "required_skills": opp.required_skills,
                "score": score,
                "matched_skills": sorted(overlap),
            }
        )

    scored.sort(key=lambda x: x["score"], reverse=True)

    return {
        "user": {"id": user.id, "name": user.name, "skills": user.skills},
        "matches": scored[:limit],
    }

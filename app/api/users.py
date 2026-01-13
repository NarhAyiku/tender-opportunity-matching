from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User

# 1️⃣ Router MUST be defined before using it
router = APIRouter(prefix="/users", tags=["users"])


# 2️⃣ DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# 3️⃣ Schemas
class UserCreate(BaseModel):
    name: str
    skills: list[str] = []
    education: str | None = None
    interests: str | None = None
    goals: str | None = None



# 4️⃣ Routes
@router.post("")
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.get("")
def list_users(db: Session = Depends(get_db)):
    return db.query(User).order_by(User.id.desc()).all()


@router.get("/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

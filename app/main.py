from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.api import auth, users, opportunities, match
from app.models import user, opportunity

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TENDER - AI-Powered Opportunity Matching Platform")

# Allow frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(opportunities.router)
app.include_router(match.router)

@app.get("/")
def root():
    return {"status": "API running"}


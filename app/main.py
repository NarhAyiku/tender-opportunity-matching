from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.api import auth, users, opportunities, match, preferences, swipes, files, applications
from app.models import user, opportunity, preferences as prefs_model, swipe, application

# Create all database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="TENDER - AI-Powered Opportunity Matching Platform",
    description="Swipe-based opportunity matching for students and graduates",
    version="1.0.0"
)

# Allow frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5173",
        "http://localhost:5173",
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
        "*"  # Allow all origins in development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Auth routes
app.include_router(auth.router)

# User routes
app.include_router(users.router)

# Preferences routes
app.include_router(preferences.router)

# Opportunity routes
app.include_router(opportunities.router)

# Match/Feed routes
app.include_router(match.router)

# Swipe routes
app.include_router(swipes.router)

# File upload routes
app.include_router(files.router)

# Application tracking routes
app.include_router(applications.router)


@app.get("/")
def root():
    return {
        "status": "API running",
        "name": "TENDER",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}

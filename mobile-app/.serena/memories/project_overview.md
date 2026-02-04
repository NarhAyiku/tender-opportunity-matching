# TENDER - AI-Powered Opportunity Matching Platform

## Purpose
A Tinder-style job/opportunity matching platform for students and graduates. Users swipe on opportunities (jobs, internships, scholarships, grants) and upon liking, their documents are sent to the company.

## Tech Stack

### Backend (FastAPI)
- **Framework**: FastAPI (Python)
- **Database**: SQLite (development) → PostgreSQL (production)
- **ORM**: SQLAlchemy
- **Auth**: JWT + bcrypt (passlib)
- **File uploads**: python-multipart, boto3 (S3)
- **AI/ML**: sentence-transformers

### Frontend (Mobile App - React/Vite)
- **Framework**: React 18 with Vite 7
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion, react-spring
- **Routing**: react-router-dom 6
- **Swipe UI**: react-tinder-card

## Project Structure
```
/app                    # FastAPI backend
  /api                  # Route handlers
  /models               # SQLAlchemy models
  /schemas              # Pydantic schemas
  /services             # Business logic
/mobile-app             # React mobile web app (main frontend)
  /src
    /components         # React components
    /pages              # Page components
    /services           # API client
    /context            # React contexts (auth)
/tests                  # Backend pytest tests
/uploads                # File storage directory
```

## Current Features (MVP)
- User authentication (JWT signup/login)
- Rich user profiles (work experience, education, skills)
- Opportunity management with filters
- Swipe system (like/dislike/save)
- Smart feed (excludes swiped, ranked by match)
- File uploads (resume, transcript, profile picture)
- Application tracking

## External APIs
- Jooble API - job aggregation
- Adzuna API - job aggregation

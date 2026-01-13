# AI-Powered Opportunity Matching Platform (TENDER)

## Inspiration
- Sorce.jobs - "Tinder for jobs" with AI auto-apply
- Goal: Be better by covering MORE opportunity types (jobs, scholarships, grants, internships) and focusing on students/graduates specifically

## Project Goal
Build a swipe-based (Tinder-style) opportunity matching app for students and graduates.
Users can upload CVs and documents, swipe on opportunities, and upon liking, their
documents are sent directly to the company.

## Owner
Benjamin Ayiku Narh

## Development Philosophy
- Ship fast, iterate with feedback
- Build only what moves the needle
- Execution-focused, not perfection-focused

## Tech Stack
- Backend: FastAPI (Python)
- Database: SQLite (now), PostgreSQL (later)
- ORM: SQLAlchemy
- Frontend: HTML/CSS/JS (moving toward mobile app)
- Auth: API keys + user headers (temporary)

## Current Features
- User profiles with skills
- Opportunity listings (CRUD)
- Matching endpoint (/match/{user_id}) - rule-based scoring
- Basic frontend to fetch and display matches

## Project Structure
```
app/
├── main.py           # FastAPI entry point
├── database.py       # SQLAlchemy setup
├── security.py       # Auth helpers
├── api/
│   ├── users.py      # User endpoints
│   ├── opportunities.py  # Opportunity CRUD
│   └── match.py      # Matching logic
└── models/
    ├── user.py       # User model
    └── opportunity.py # Opportunity model
frontend/
└── index.html        # Test UI
```

## Roadmap

### Phase 1 (Current Focus)
- [ ] User authentication (proper login/signup)
- [ ] Profile completion (education, goals, CV upload)
- [ ] Opportunity ingestion (bulk import, scraping)

### Phase 2
- [ ] Advanced AI matching (ML models, embeddings)
- [ ] Admin dashboard
- [ ] Analytics

### Phase 3
- [ ] Mobile app (React Native / Expo)
- [ ] API partnerships
- [ ] Regional scaling

## Claude Instructions
- Prefer clean, production-ready FastAPI code
- Do not break existing endpoints
- Ask before refactoring core logic
- Always explain changes clearly
- Prioritize Phase 1 features unless told otherwise

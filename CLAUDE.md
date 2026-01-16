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
- Auth: JWT + bcrypt (implemented)

## Current Features (MVP Complete)
- [x] User authentication (JWT signup/login)
- [x] Rich user profiles (work experience, education, projects, skills, languages, awards)
- [x] User preferences (job titles, locations, salary, job levels, work arrangements)
- [x] Expanded opportunities (company info, salary, location, type: job/internship/scholarship/grant)
- [x] Swipe system (like/dislike/save with history)
- [x] Smart feed (/match/feed - excludes already-swiped, ranked by match score)
- [x] File uploads (resume, transcript, profile picture)
- [x] Application tracking with timeline events
- [x] Profile completion percentage

## Project Structure
```
app/
├── main.py           # FastAPI entry point
├── database.py       # SQLAlchemy setup
├── security.py       # JWT auth, password hashing, get_current_user
├── config.py         # File upload settings
├── api/
│   ├── auth.py       # /auth/signup, /auth/login
│   ├── users.py      # /users/me (rich profile)
│   ├── preferences.py # /preferences/me (job preferences)
│   ├── opportunities.py  # Opportunity CRUD with filters
│   ├── match.py      # /match/feed (smart feed)
│   ├── swipes.py     # /swipes (like/dislike/save)
│   ├── files.py      # /files/resume, /files/transcript
│   └── applications.py # /applications (tracking + timeline)
├── models/
│   ├── user.py       # User model (rich profile)
│   ├── opportunity.py # Opportunity model (expanded)
│   ├── preferences.py # UserPreferences model
│   ├── swipe.py      # UserSwipe model
│   └── application.py # Application + ApplicationEvent models
└── schemas/
    ├── profile.py    # Profile Pydantic schemas
    ├── preferences.py
    ├── opportunity.py
    ├── swipe.py
    └── application.py
uploads/
├── resumes/
├── transcripts/
└── profile_pictures/
frontend/
└── index.html        # Test UI
```

---

## Backlog Management

### Priority Levels
- **P0 - Critical**: Blocking issues, security vulnerabilities, core features
- **P1 - High**: Important features, major improvements
- **P2 - Medium**: Nice-to-have features, minor improvements
- **P3 - Low**: Future enhancements, polish

### Story Points
- **1-2**: Small task (< 4 hours)
- **3-5**: Medium task (1-2 days)
- **8**: Large task (3-5 days)
- **13**: Very large task (1-2 weeks)
- **21+**: Epic-level (requires breakdown)

### User Story Format
```
As a [user type]
I want [feature/capability]
So that [benefit/outcome]

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
```

---

## Roadmap

### Phase 1: Core Platform (Current Focus)

#### TDR-001: User Authentication [P0] - DONE
- [x] JWT token authentication
- [x] Password hashing (bcrypt)
- [x] /auth/signup, /auth/login endpoints
- [x] get_current_user dependency
- [x] Protected /users/me endpoint

#### TDR-002: Profile Completion [P0] - DONE
**Points:** 8

As a student/graduate, I want to complete my profile with education, skills, and documents so that I get better opportunity matches.

Acceptance Criteria:
- [x] Education history (school, degree, year) - education_entries JSON array
- [x] Work experience history - work_experiences JSON array
- [x] Projects, Languages, Awards - all stored as JSON arrays
- [x] Career goals/interests field
- [x] CV/resume upload (PDF, DOCX) - POST /files/resume
- [x] Profile completion percentage indicator - calculated dynamically
- [x] File storage (local → S3 later) - /uploads/ directory

Technical Notes:
- Endpoint: PUT /users/me
- File handling: POST /files/resume, /files/transcript, /files/profile-picture
- Storage: /uploads/ directory

#### TDR-003: Opportunity Ingestion [P0]
**Points:** 13

As a platform admin, I want to bulk import opportunities so that users have things to match with.

Acceptance Criteria:
- [ ] CSV/JSON bulk import endpoint
- [ ] Web scraping integration (basic)
- [ ] Opportunity validation (required fields)
- [ ] Duplicate detection
- [ ] Source tracking (manual, scraped, API)

Technical Notes:
- Endpoint: POST /opportunities/bulk
- Consider: Crawl4AI or BeautifulSoup for scraping

#### TDR-004: Swipe Interface [P1] - DONE
**Points:** 13

As a user, I want to swipe right/left on opportunities so that I can quickly indicate interest.

Acceptance Criteria:
- [x] GET /match/feed - personalized feed excluding swiped, ranked by match score
- [x] POST /swipes - record swipe action (like/dislike/save)
- [x] Swipe history tracking - GET /swipes with filters
- [x] "Liked" opportunities list - GET /swipes/liked
- [x] Saved opportunities list - GET /swipes/saved
- [ ] Basic swipe UI (mobile-first) - Backend ready, UI pending

Technical Notes:
- Model: UserSwipe (user_id, opportunity_id, action, timestamp)
- Feed excludes already-swiped opportunities
- Applications created automatically on "like" action

### Phase 2: AI & Analytics

#### TDR-005: AI Matching Engine [P1]
**Points:** 21

As a user, I want AI-powered matching so that I see the most relevant opportunities first.

Acceptance Criteria:
- [ ] Embedding-based similarity (sentence-transformers)
- [ ] User profile → vector embedding
- [ ] Opportunity → vector embedding
- [ ] Cosine similarity scoring
- [ ] Hybrid scoring (AI + rule-based)

Technical Notes:
- sentence-transformers already in requirements
- Consider: pgvector for PostgreSQL phase

#### TDR-006: Auto-Apply Feature [P1]
**Points:** 13

As a user, I want my CV auto-sent when I like an opportunity so that I don't have to manually apply.

Acceptance Criteria:
- [ ] Email sending on "like" action
- [ ] Customizable cover letter template
- [ ] Application tracking (sent, viewed, responded)
- [ ] Rate limiting (prevent spam)

#### TDR-007: Analytics Dashboard [P2]
**Points:** 8

As a user, I want to see my application stats so that I can track my job search progress.

Acceptance Criteria:
- [ ] Total swipes (likes/passes)
- [ ] Applications sent
- [ ] Response rate
- [ ] Match quality score
- [ ] Weekly/monthly trends

### Phase 3: Scale & Mobile

#### TDR-008: Mobile App [P2]
**Points:** 34+

As a user, I want a mobile app so that I can swipe on opportunities anywhere.

Acceptance Criteria:
- [ ] React Native / Expo setup
- [ ] iOS and Android builds
- [ ] Push notifications
- [ ] Offline mode (cached opportunities)
- [ ] Biometric login

#### TDR-009: Multi-Tenancy [P2]
**Points:** 13

As a platform owner, I want to support multiple organizations so that universities/companies can have branded portals.

Acceptance Criteria:
- [ ] Organization model
- [ ] Organization-scoped data
- [ ] Role-based access (owner, admin, member)
- [ ] Organization switcher

#### TDR-010: API & Partnerships [P3]
**Points:** 21

As a platform owner, I want public APIs so that partners can integrate with TENDER.

Acceptance Criteria:
- [ ] API key management
- [ ] Rate limiting
- [ ] Webhook system
- [ ] Developer documentation

---

## Technical Patterns (Reference)

### Authentication Pattern
```python
from app.security import get_current_user
from app.models.user import User

@router.get("/protected")
def protected_route(current_user: User = Depends(get_current_user)):
    return {"user": current_user.email}
```

### Database Session Pattern
```python
from app.security import get_db
from sqlalchemy.orm import Session

@router.get("/items")
def get_items(db: Session = Depends(get_db)):
    return db.query(Item).all()
```

### File Upload Pattern (for CV upload)
```python
from fastapi import UploadFile, File

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    # Save to disk or S3
```

---

## Claude Instructions
- Prefer clean, production-ready FastAPI code
- Do not break existing endpoints
- Ask before refactoring core logic
- Always explain changes clearly
- Prioritize Phase 1 features unless told otherwise
- Use the backlog structure above when planning work
- Reference TDR-XXX codes when discussing features
- Update this file when features are completed

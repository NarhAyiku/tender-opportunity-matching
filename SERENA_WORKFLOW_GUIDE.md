# Serena Workflow Guide
## TENDER - AI-Powered Opportunity Matching Platform

> **Version:** 1.0
> **Last Updated:** January 30, 2026
> **Owner:** Benjamin Ayiku Narh
> **Purpose:** Guide for using Serena to develop the TENDER platform efficiently

---

## Table of Contents
1. [Project Context](#project-context)
2. [Serena Setup](#serena-setup)
3. [Daily Development Workflow](#daily-development-workflow)
4. [Feature Development Cycle](#feature-development-cycle)
5. [Backend Workflows (FastAPI)](#backend-workflows-fastapi)
6. [Frontend Workflows (React/Vite)](#frontend-workflows-reactvite)
7. [Prompt Templates](#prompt-templates)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Project Context

### What is TENDER?
A swipe-based (Tinder-style) opportunity matching app for students and graduates. Users upload CVs, swipe on opportunities (jobs, internships, scholarships, grants), and upon liking, their documents are sent to the company. Inspired by Sorce.jobs but broader in scope.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python), SQLAlchemy ORM |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Auth | JWT + bcrypt (passlib) |
| Frontend | React 18 + Vite 7 (mobile-first web app) |
| Styling | Tailwind CSS 4 |
| Animation | Framer Motion, react-spring |
| Swipe UI | react-tinder-card |
| AI/ML | sentence-transformers |
| External APIs | Jooble API, Adzuna API (job aggregation) |

### Project Structure
```
/                           # Project root
  /app                      # FastAPI backend
    /api                    # Route handlers (auth, match, opportunities, etc.)
    /models                 # SQLAlchemy models (user, opportunity, swipe, etc.)
    /schemas                # Pydantic request/response schemas
    /services               # Business logic (matching, parsing, embedding)
  /mobile-app               # React mobile web app (PRIMARY frontend)
    /src
      /components           # React components (BottomNav, OpportunityCard, etc.)
      /pages                # Page components (Feed, Profile, Login, etc.)
      /services             # API client (api.js)
      /context              # React contexts (AuthContext)
      /styles               # Theme CSS and design tokens
  /tender-frontend          # Desktop/recruiter frontend (secondary)
  /tests                    # Backend pytest tests
  /uploads                  # File storage (resumes, transcripts, profile pics)
```

### Backlog Reference Codes
Features are tracked using `TDR-XXX` codes (see CLAUDE.md for full backlog):
- **TDR-001**: User Authentication (DONE)
- **TDR-002**: Profile Completion (DONE)
- **TDR-003**: Opportunity Ingestion (in progress)
- **TDR-004**: Swipe Interface (DONE - backend; UI in progress)
- **TDR-005**: AI Matching Engine (planned)
- **TDR-006**: Auto-Apply Feature (planned)

---

## Serena Setup

### Configuration
- **Project name**: `mobile-app`
- **Activated path**: `/Users/benjaminnarh/AI-Powered Opportunity Matching Platform for Students and Graduates/mobile-app`
- **Language**: TypeScript (frontend analysis)
- **Context**: claude-code
- **Modes**: editing, interactive

### Available Memories
Serena stores project knowledge in these memories (read with `read_memory`):
- `project_overview` - Tech stack, structure, features
- `code_style` - Python and React coding conventions
- `suggested_commands` - Dev server, test, build commands
- `task_completion` - Checklist for completing tasks

### Key Development Commands

**Backend:**
```bash
# Activate virtualenv and run server
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Run tests
pytest tests/ -v
pytest tests/ --cov=app

# Database migration
python migrate_db.py

# API docs
open http://localhost:8000/docs      # Swagger UI
open http://localhost:8000/redoc     # ReDoc
```

**Frontend (mobile-app):**
```bash
cd mobile-app
npm install
npm run dev          # http://localhost:5173
npm run build
npm run lint
```

---

## Daily Development Workflow

### Starting a Session

**1. Check project state:**
```
"Show me the current git status and recent commits"
"What files were recently modified?"
```

**2. Review where you left off:**
```
"Read the WORK_LOG.md and summarize the last session's next steps"
"What's the current status of TDR-004?"
```

**3. Plan the session:**
```
"Based on the CLAUDE.md roadmap, what should I work on next?
Consider: pending features, technical debt, bugs"
```

### During Development

**Understand before modifying:**
```
# Use Serena's symbolic tools - don't read entire files
"Get an overview of symbols in app/api/match.py"
"Find the calculate_match_score function and show its body"
"Find all references to the User model"
```

**Search semantically:**
```
Good: "Where do we handle swipe actions?"
Good: "Find where opportunity feed is filtered"
Good: "Show me the authentication middleware"

Avoid: "Find match.py"  (too vague)
Avoid: "Search for score"  (too broad)
```

### Ending a Session

**1. Update the work log:**
```
"Update WORK_LOG.md with today's progress:
- What was completed
- Decisions made
- Current status
- Next steps to resume"
```

**2. Generate commit message:**
```
"Generate a conventional commit message referencing TDR-XXX for today's changes"
```

---

## Feature Development Cycle

### Phase 1: Plan (Interactive Mode)

Use this template when starting a new feature:
```
"I want to implement [FEATURE from TDR-XXX].

Description: [what it should do]

Requirements:
- [requirement 1]
- [requirement 2]

Please provide:
1. Files to create or modify (backend + frontend)
2. Database changes needed
3. API endpoint design
4. Frontend component plan
5. Integration with existing swipe/feed system
6. Edge cases to handle"
```

**Example:**
```
"I want to implement the AI Matching Engine (TDR-005).

Description: Use sentence-transformers to embed user profiles and
opportunities, then rank feed by cosine similarity.

Requirements:
- Embed user skills, education, and career goals
- Embed opportunity descriptions and requirements
- Hybrid scoring: AI similarity (60%) + rule-based filters (40%)
- Sub-200ms feed response for 10k opportunities
- Fallback to rule-based if embeddings unavailable

Please provide the implementation plan."
```

### Phase 2: Backend Implementation

```
"Implement [feature] in the FastAPI backend:

Files to modify/create:
- app/services/[service].py
- app/api/[router].py
- app/models/[model].py (if schema changes)
- app/schemas/[schema].py

Follow existing patterns:
- Use Depends(get_db) for sessions
- Use Depends(get_current_user) for auth
- Pydantic schemas for validation
- Type hints on all functions
- snake_case naming"
```

### Phase 3: Frontend Implementation

```
"Create the frontend for [feature]:

Files to modify/create:
- mobile-app/src/pages/[Page].jsx
- mobile-app/src/components/[Component].jsx
- mobile-app/src/services/api.js (add endpoints)

Follow existing patterns:
- Functional components with hooks
- Tailwind CSS for styling
- AuthContext for user state
- api.js service for backend calls
- Mobile-first responsive design
- Follow AGENT_RULES.md UI/UX guidelines"
```

### Phase 4: Integration & Testing

```
"Verify the [feature] integration:

Backend:
- [ ] Run pytest tests/ -v
- [ ] Test endpoints via http://localhost:8000/docs
- [ ] Check no breaking changes to existing endpoints

Frontend:
- [ ] Run npm run lint in mobile-app/
- [ ] Test in browser at http://localhost:5173
- [ ] Check mobile responsiveness
- [ ] Verify API calls work with backend

Database:
- [ ] Run migrate_db.py if schema changed
- [ ] Test with existing data"
```

---

## Backend Workflows (FastAPI)

### Adding a New API Endpoint

```
"Add a new endpoint to the matching module:

Endpoint: [METHOD] /match/[path]
Purpose: [what it does]
Auth: Required (JWT)

Request: [body/params]
Response: [schema]

Add to: app/api/match.py
Schema in: app/schemas/[file].py

Follow the pattern used in existing endpoints like /match/feed."
```

### Modifying a SQLAlchemy Model

```
"Update the [Model] in app/models/[file].py:

Changes needed:
- Add field: [name] ([type], [constraints])
- Modify field: [name] (change [what])

Also update:
- app/schemas/[file].py (Pydantic schema)
- migrate_db.py (add migration logic)
- Any API endpoints that use this model"
```

### Working with Services

```
"Implement [ServiceName] in app/services/[file].py:

Purpose: [what it does]
Methods:
- [method1](params) -> return: [description]
- [method2](params) -> return: [description]

Dependencies:
- SQLAlchemy session for DB access
- [other services or models]

Follow the pattern in app/services/document_parser.py"
```

---

## Frontend Workflows (React/Vite)

### Creating a New Page

```
"Create [PageName] page:

File: mobile-app/src/pages/[PageName].jsx

Features:
- [feature 1]
- [feature 2]

API calls needed:
- [endpoint 1]
- [endpoint 2]

Add route in App.jsx
Add to BottomNav if needed
Use Tailwind CSS (follow theme.css tokens)
Mobile-first design"
```

### Creating a New Component

```
"Create [ComponentName] component:

File: mobile-app/src/components/[ComponentName].jsx

Props:
- [prop1]: [type] - [description]
- [prop2]: [type] - [description]

Behavior:
- [behavior description]

Follow existing component patterns:
- Functional component with hooks
- Tailwind CSS styling
- Handle loading/error states"
```

### Working with the API Client

```
"Add [feature] endpoints to mobile-app/src/services/api.js:

New functions:
- [functionName](params): [METHOD] /api/[path]

Follow existing patterns in api.js:
- Use the existing axios/fetch instance
- Include auth token from localStorage
- Handle errors with try/catch
- Return response data"
```

---

## Prompt Templates

### Understanding Code

```
# Quick overview
"Get an overview of symbols in [file path]"

# Deep dive into a function
"Find [function_name] in [file] and show its body.
Explain what it does, its inputs, outputs, and edge cases."

# Trace a data flow
"Trace the data flow when a user swipes right on an opportunity:
From the frontend button click through API to database."

# Find related code
"Find all references to [symbol] across the codebase"
```

### Creating Code

```
# New service
"Create a [purpose] service following FastAPI patterns in app/services/"

# New component
"Create a React component for [purpose] using Tailwind CSS in mobile-app/src/components/"

# New endpoint
"Add [METHOD] /api/[path] endpoint following patterns in app/api/"
```

### Debugging

```
# Investigate an issue
"The [feature] is [problem]. Analyze [file] to find the cause.
Check: [specific areas to investigate]"

# Performance issue
"The [endpoint/component] is slow. Analyze for:
- Database query efficiency
- Unnecessary re-renders (frontend)
- Missing indexes
- N+1 query problems"
```

### Refactoring

```
# Code improvement
"Refactor [function] in [file] to:
- [improvement goal]
Keep the same interface. Don't break existing callers."

# Pattern migration
"Update [module] to use [new pattern] instead of [old pattern].
Check all references and update them too."
```

---

## Best Practices

### 1. Use Serena's Symbolic Tools First
Don't read entire files when you only need one function. Use `find_symbol`, `get_symbols_overview`, and `find_referencing_symbols` to navigate code efficiently.

### 2. Follow Existing Patterns
Always reference existing code when asking for new code:
```
Good: "Follow the pattern in app/api/auth.py for the new endpoint"
Bad:  "Create an endpoint" (no reference to existing patterns)
```

### 3. Respect Project Conventions
- **Python backend**: Type hints, Pydantic schemas, snake_case, PEP 8
- **React frontend**: Functional components, hooks, JSX, Tailwind CSS
- **UI/UX**: Follow AGENT_RULES.md (no default purple gradients, purposeful animations, mobile-first)
- **Commits**: Reference TDR-XXX codes when applicable

### 4. Always Check Integration Points
When modifying code, verify:
- Backend changes don't break the API contract with frontend
- Frontend changes match the expected API responses
- Database changes are migrated properly
- Auth is properly enforced on new endpoints

### 5. Iterate, Don't Overload
Break work into phases:
1. Plan the feature
2. Implement backend
3. Implement frontend
4. Integrate and test
5. Update docs/work log

Don't try to do everything in one prompt.

### 6. Keep the Work Log Updated
After each session, update WORK_LOG.md with:
- What was done
- Decisions made
- Current blockers
- Clear next steps for resuming

### 7. Use Task Completion Checklist
Before considering any task done, run through the checklist in the `task_completion` Serena memory:
- Backend tests pass
- Frontend lints clean
- API docs still work
- No breaking changes
- No secrets in code

---

## Troubleshooting

### Serena Not Finding Symbols
- Ensure the correct project is activated (`mobile-app`)
- For backend files outside `mobile-app/`, use `search_for_pattern` with the full path
- Use `substring_matching: true` when unsure of exact symbol names

### Frontend Won't Start
```bash
cd mobile-app
rm -rf node_modules
npm install
npm run dev
```

### Backend Won't Start
```bash
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Check for port conflicts: `lsof -i :8000`

### Database Issues
```bash
# Re-run migrations
python migrate_db.py

# Check database exists
ls -la app.db
```

### API Calls Failing from Frontend
- Verify backend is running on port 8000
- Check CORS settings in `app/main.py`
- Verify auth token is being sent in headers
- Test endpoint directly via Swagger: http://localhost:8000/docs

### Git Conflicts
```bash
git status
git stash              # Save local changes
git pull origin main
git stash pop          # Reapply local changes
```

---

## Quick Reference

### Most Used Serena Commands
```
# Navigate code
"Get symbols overview of [file]"
"Find [symbol] and show its body"
"Find references to [symbol]"
"Search for pattern [regex] in [path]"

# Edit code
"Replace [symbol] body with [new code]"
"Insert [code] after [symbol]"
"Rename [symbol] to [new_name]"

# Understand code
"Explain what [function] does"
"Trace the flow for [feature]"
"What calls [function]?"

# Project memory
"Read memory [name]"
"Write memory [name] with [content]"
```

### Key File Locations
| What | Where |
|------|-------|
| Backend entry point | `app/main.py` |
| Auth logic | `app/security.py` |
| API routes | `app/api/*.py` |
| DB models | `app/models/*.py` |
| Pydantic schemas | `app/schemas/*.py` |
| Frontend entry | `mobile-app/src/main.jsx` |
| App routing | `mobile-app/src/App.jsx` |
| API client | `mobile-app/src/services/api.js` |
| Auth context | `mobile-app/src/context/AuthContext.jsx` |
| Feed page | `mobile-app/src/pages/Feed.jsx` |
| Profile page | `mobile-app/src/pages/Profile.jsx` |
| Design tokens | `mobile-app/src/styles/theme.css` |
| UI/UX rules | `AGENT_RULES.md` |
| Roadmap/backlog | `CLAUDE.md` |

---

## Changelog

### Version 1.0 (January 30, 2026)
- Initial guide tailored to TENDER platform
- Serena configuration documented
- Backend (FastAPI) and frontend (React/Vite) workflows
- Prompt templates for common tasks
- Troubleshooting guide

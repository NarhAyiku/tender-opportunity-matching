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

### Active: Mobile App (primary focus)
- **Frontend:** React + Vite (mobile-app/) — NOT React Native, it's a PWA-style web app
- **Backend/DB/Auth/Storage:** Supabase (PostgreSQL, Auth, Storage, RLS)
- **Supabase Project:** ref `aykrsqglrngxbcokqpad`, URL: `https://aykrsqglrngxbcokqpad.supabase.co`
- **Key Libraries:** react-tinder-card, framer-motion, lucide-react, @supabase/supabase-js

### Legacy: FastAPI Backend (parallel, disconnected)
- Backend: FastAPI (Python)
- Database: SQLite
- ORM: SQLAlchemy
- Auth: JWT + bcrypt
- **NOTE:** The FastAPI backend and mobile-app are NOT connected. Mobile-app talks directly to Supabase.

### tender-frontend (secondary)
- React + TypeScript + Vite + Tailwind CSS + Zustand
- Talks to FastAPI backend (not Supabase)

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

### Mobile App (PRIMARY — Supabase-backed)
```
mobile-app/
├── src/
│   ├── App.jsx               # Router + layout
│   ├── main.jsx              # Entry point
│   ├── index.css             # Global styles (purple theme)
│   ├── components/
│   │   ├── BottomNav.jsx     # Tab navigation
│   │   ├── OpportunityCard.jsx # Swipe card
│   │   ├── ErrorBoundary.jsx # Error handling
│   │   ├── ProtectedRoute.jsx # Auth guard
│   │   ├── SwipeLimitCounter.jsx
│   │   └── ui/               # Button, Card, Skeleton, Toast, States
│   ├── context/
│   │   └── AuthContext.jsx   # Supabase auth provider
│   ├── lib/
│   │   ├── supabase.js       # Supabase client init
│   │   └── useFileUpload.js  # File upload hook (Storage + profile update)
│   ├── pages/
│   │   ├── Feed.jsx          # Swipe feed (screening gate)
│   │   ├── Profile.jsx       # User profile (3 tabs: personal, resume, files)
│   │   ├── Screening.jsx     # Onboarding wizard (5 steps)
│   │   ├── Inbox.jsx         # Conversations + timeline
│   │   ├── ApplicationPreview.jsx
│   │   ├── Login.jsx         # Supabase auth
│   │   ├── Signup.jsx        # Supabase auth
│   │   └── Preferences.jsx   # Job preferences
│   ├── services/
│   │   ├── api.js            # API helpers
│   │   └── errorLogger.js    # Error logging
│   └── styles/               # Component styles
├── supabase/
│   ├── schema.sql            # Full DB schema (profiles, conversations, triggers, storage)
│   └── seed.sql              # 15 sample opportunities
├── .env                      # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
└── vite.config.js
```

### FastAPI Backend (LEGACY — SQLite-backed)
```
app/
├── main.py           # FastAPI entry point
├── database.py       # SQLAlchemy setup
├── security.py       # JWT auth, password hashing
├── config.py         # File upload settings
├── api/              # auth, users, preferences, opportunities, match, swipes, files, applications, conversations, parsing, screening, sync
├── models/           # user, opportunity, preferences, swipe, application, conversation, document
├── schemas/          # All Pydantic schemas
└── services/         # document_parser, embedding, matching, job_sync, job_adapters/
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
- Prefer clean, production-ready code
- Do not break existing endpoints or Supabase queries
- Ask before refactoring core logic
- Always explain changes clearly
- Prioritize mobile-app work (Supabase-backed) unless told otherwise
- Use the backlog structure above when planning work
- Reference TDR-XXX codes when discussing features
- Update this file when features are completed
- **After every significant work session:** Update progress.txt + WORK_LOG.md

---

## Agentic Test-Driven Development (ATDD) Methodology

This project follows a hybrid methodology combining **Test-Driven Development**, **Spec-Driven Development**, and **Agentic Development**. The PRD doubles as an AI agent prompt — structured so that an agent can read it, understand the feature, design tests, implement, and self-verify in a recursive loop.

### Core Principles

1. **PRD-as-Prompt:** The PRD is structured to be machine-readable. Each feature has explicit acceptance criteria that map directly to testable assertions. The PRD can be invoked as a slash command (`/command <project>`) to kick off a full implementation cycle.

2. **Tests Before Code:** For every feature, the agent MUST design the test suite and success criteria BEFORE writing the implementation. This means:
   - Define what "done" looks like (acceptance criteria → test cases)
   - Write unit tests for individual functions/components
   - Write integration tests for end-to-end flows
   - Only then implement the feature to make the tests pass

3. **Commit-per-Feature:** Git commit after every significant feature implementation. The commit history becomes a verifiable audit trail. Each commit should represent a working, tested state.

4. **Regression on Every Change:** After implementing a new feature, re-run ALL previous tests. Check past git commits to understand what was already built. If a new feature breaks an old one, fix it before moving on. The test suite is cumulative — it only grows.

5. **Agent Memory (Self-Referencing Notes):** The agent leaves comments in the "Agent Session Notes" section (bottom of this file) for its future self. These notes capture: decisions made, gotchas discovered, patterns that worked, things to watch out for. Every session starts by reading these notes.

### The Recursive Loop

```
┌─────────────────────────────────────────────────────────────────┐
│  AGENTIC TDD LOOP (every feature cycle)                         │
│                                                                 │
│  1. RECALL   → Read Agent Session Notes + progress.txt          │
│               + latest WORK_LOG.md + past git commits           │
│                                                                 │
│  2. SPECIFY  → Pick next feature from PRD/backlog               │
│               Define success criteria from acceptance criteria   │
│                                                                 │
│  3. DESIGN TESTS → Write unit tests for the feature             │
│                    Write integration tests for the flow          │
│                    Tests MUST fail initially (red phase)         │
│                                                                 │
│  4. IMPLEMENT → Write the minimum code to pass the tests        │
│                 Follow existing code style and patterns          │
│                                                                 │
│  5. VERIFY   → Run new tests (should pass — green phase)        │
│               Run ALL previous tests (regression)               │
│               If anything fails → fix before proceeding         │
│                                                                 │
│  6. COMMIT   → git add + git commit with descriptive message    │
│               Commit represents a tested, working state         │
│                                                                 │
│  7. REFLECT  → Update progress.txt, WORK_LOG.md                 │
│               Leave notes in Agent Session Notes                │
│               Note any gotchas, patterns, or warnings           │
│                                                                 │
│  8. REPEAT   → Back to step 1 for next feature                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Why This Works

- **Tests as specification:** The tests ARE the spec. If the tests pass, the feature works. No ambiguity.
- **Git as checkpoint system:** Each commit is a known-good state. If something breaks, you can diff against the last working commit.
- **Regression catches drift:** New features often break old ones in subtle ways. Running the full suite every time catches this immediately.
- **Agent notes prevent amnesia:** AI agents lose context between sessions. The notes section is persistent memory — decisions, gotchas, and warnings survive across sessions.
- **PRD-as-prompt reduces translation loss:** The agent reads the same document the human wrote. No separate "agent instructions" that drift from requirements.

### Slash Command Pattern

The PRD is configured as a Claude Code slash command with an arguments variable:

```
/build-feature <feature-name>
```

This invokes the full ATDD loop for the specified feature. The agent:
1. Finds the feature in the PRD by name/TDR code
2. Reads acceptance criteria
3. Designs tests
4. Implements
5. Verifies
6. Commits
7. Leaves notes

### Test Organization (Convention)

```
mobile-app/
├── src/
│   └── __tests__/           # Unit tests (components, hooks, utils)
│       ├── components/
│       ├── hooks/
│       └── utils/
├── tests/
│   ├── integration/         # Integration tests (multi-component flows)
│   └── e2e/                 # End-to-end tests (full user journeys)

app/                         # FastAPI backend
├── tests/
│   ├── unit/                # Unit tests (services, models)
│   ├── integration/         # Integration tests (API endpoints)
│   └── fixtures/            # Shared test data
```

---

## Development Workflow Loop

**Every session should follow this expanded cycle:**

```
1. RECALL:   Read Agent Session Notes (bottom of this file)
2. READ:     progress.txt (what's done, what's next)
3. READ:     Latest WORK_LOG.md entry (context from last session)
4. READ:     Recent git log (what was committed, what's the diff)
5. SPECIFY:  Pick next task, define success criteria
6. TEST:     Design test suite BEFORE implementation
7. WORK:     Implement the feature (make the tests pass)
8. VERIFY:   Run new tests + regression tests on past features
9. COMMIT:   git commit (only if tests pass)
10. UPDATE:  progress.txt (mark items [x], add new items)
11. UPDATE:  WORK_LOG.md (new session entry)
12. UPDATE:  Agent Session Notes (decisions, gotchas, warnings)
13. UPDATE:  CLAUDE.md / SRS-Architecture.md (if architecture changed)
```

**Document relationships:**
- `PRD.md` — What to build (requirements, milestones) — also serves as agent prompt
- `progress.txt` — What's done vs what's left (milestone tracker)
- `WORK_LOG.md` — How we built it (session-by-session history)
- `CLAUDE.md` — How the project works (architecture, instructions, agent notes)
- `SRS-Architecture.md` — Aspirational vs actual architecture

---

## Claude Skills & Agents Guide

### Skills (invoke with `/skill-name`):

| Skill | When to Use |
|-------|-------------|
| `/senior-fullstack` | Full codebase audit, architecture review, multi-file refactors |
| `/senior-backend` | API design, database optimization, backend logic, security |
| `/ultra-think` | Complex debugging, strategic decisions, root cause analysis |
| `/brainstorming` | Feature ideation, UX flow design, requirements gathering |
| `/webapp-testing` | Browser testing with Playwright, UI verification, screenshots |
| `/create-architecture-documentation` | Generate architecture diagrams and ADRs |
| `/mcp-builder` | Build MCP servers for external service integrations |
| `/supabase` | Database operations, SQL, migrations, schema management |
| `/test-flow` | E2E testing of user flows (signup, screening, swipe, full) |
| `/error-check` | Check ERROR LOG before debugging — prevents repeat cycles |

### Recommended Skill per Task Type:

| Task | Recommended Skill |
|------|-------------------|
| "What's broken?" / "Audit the project" | `/senior-fullstack` |
| "What should I do next?" | `/ultra-think` |
| "Build feature X" | `/brainstorming` → implement → `/test-flow` |
| "Fix this bug" | `/error-check` → `/ultra-think` → implement → test |
| "Design the API for X" | `/senior-backend` |
| "Generate architecture docs" | `/create-architecture-documentation` |
| "Test the app in browser" | `/test-flow` or `/webapp-testing` |
| "Run SQL / change DB schema" | `/supabase` |
| "Debug an error" | `/error-check` first, then investigate |

### Agents (auto-selected by Claude Code):

| Agent | Purpose |
|-------|---------|
| Explore | Find files, search patterns, understand codebase structure |
| Plan | Design implementation strategy for complex tasks |
| fullstack-developer | End-to-end feature implementation |
| frontend-developer | React components, UI, state management |
| backend-architect | API design, database schemas, scalability |
| code-reviewer | Quality, security, maintainability review |

### MCP Servers (configured in `.mcp.json`):

| Server | Package | Purpose |
|--------|---------|---------|
| **supabase** | `@supabase/mcp-server-supabase` | 20+ tools: SQL, migrations, storage, RLS, project management. Replaces curl to Management API. |
| **playwright** | `@playwright/mcp` | Browser automation for E2E testing. Screenshots, DOM inspection, form filling. Used by `/test-flow`. |
| **fetch** | `@modelcontextprotocol/server-fetch` | HTTP requests to external APIs |
| **github** | `@modelcontextprotocol/server-github` | PR management, issue tracking, repo operations |
| **serena** | (local) | Code intelligence — symbols, references, semantic editing |

**Setup required:**
- Supabase MCP: Replace `<YOUR_SUPABASE_PAT>` in `.mcp.json` with your Supabase Personal Access Token (get from https://supabase.com/dashboard/account/tokens)
- GitHub MCP: Replace `<YOUR_TOKEN>` in `.mcp.json` with your GitHub PAT

### Hooks (configured in `.claude/settings.local.json`):

| Event | What it does |
|-------|-------------|
| `UserPromptSubmit` | Checks `progress.txt` for `[OPEN]` errors before every prompt — reminds agent to check ERROR LOG before debugging |

---

## Supabase Administration

**Project:** `aykrsqglrngxbcokqpad`
**URL:** `https://aykrsqglrngxbcokqpad.supabase.co`

### Running SQL via Management API:
```bash
curl -X POST "https://api.supabase.com/v1/projects/aykrsqglrngxbcokqpad/database/query" \
  -H "Authorization: Bearer sbp_60e86b3af293337a529315dc5297e1850b50d59b" \
  -H "Content-Type: application/json" \
  -d '{"query": "YOUR SQL HERE"}'
```

### After ALTER TABLE changes, ALWAYS run:
```sql
NOTIFY pgrst, 'reload schema';
```
This refreshes PostgREST's schema cache. Without it, new columns return PGRST204 errors.

### Known Gotcha:
`CREATE TABLE IF NOT EXISTS` does NOT add new columns to an existing table. Always use `ALTER TABLE ADD COLUMN IF NOT EXISTS` for adding columns to existing tables.

---

## Agent Session Notes

> **Purpose:** This section is persistent memory for the AI agent across sessions.
> Every session, the agent reads these notes first. Every session, the agent appends new notes.
> Notes capture: decisions made, gotchas discovered, patterns that worked, warnings for next time.
> **Format:** Reverse chronological (newest first). Keep entries concise. Delete stale notes when they no longer apply.

---

### Notes: 2026-02-04 — Comparative Gap Analysis & Product Redesign

**Session context:** Full 5-phase comparative analysis of TENDER vs Sorce.jobs. Produced gap analysis, feature specs, design system, AI architecture, sub-agent definitions.

**Key deliverables:**
- `GAP_ANALYSIS_PHASES.md` — Master document with all 5 phases
- `WORK_LOG.md` — Session entry with complete Phase 1 findings
- `progress.txt` — Updated with gap analysis section and new sprint-based priority order

**Critical findings:**
- 10 Critical gaps (C1-C10), 10 Enhancement gaps (E1-E10), 7 Optional (O1-O7)
- Biggest UX gap: After swiping right, nothing meaningful happens (no auto-apply, no tracking, no feedback)
- Biggest data gap: Only 28 seed opportunities (Sorce has 1.6M)
- Biggest missing feature: Profile entries can't be edited/deleted
- Biggest architecture issue: Two disconnected backends (FastAPI+SQLite vs Supabase)

**Strategic decisions:**
- TENDER's edge is NOT auto-apply (Sorce's infra-heavy moat). TENDER's edge is:
  1. Broader opportunity types (scholarships, grants, internships — not just jobs)
  2. Student/graduate focus with education matching
  3. Better profile quality via structured onboarding + parsing
- Keep purple brand identity (distinct from Sorce's green)
- Sprint order: Foundation → Feed Quality → Applications UX → AI Layer → Scale

**Sprint 1 (Foundation) — next implementation:**
- C2: Profile edit/delete on existing entries
- C4: Settings page (sign out, delete account)
- C8: Personal info expansion (demographics, DOB, title)
- C10: Test infrastructure (Vitest)

**Files to read for context:**
- `GAP_ANALYSIS_PHASES.md` — Full analysis document (Phases 1-5)
- `progress.txt` — GAP ANALYSIS section + REMAINING WORK updated
- `WORK_LOG.md` — 2026-02-04 session entry

**Sub-agents defined (Phase 5):**
1. UI/UX Design Agent — visual design, interaction, accessibility
2. Frontend Architecture Agent — React components, state, routing
3. Backend/API Agent — Supabase schema, RLS, Edge Functions
4. AI Systems Agent — LLM integration, matching, embeddings
5. QA & Edge-Case Agent — testing, security, regression

**Warnings for next session:**
- Three background agents were generating Phase 2/3/4 specs at session end — check GAP_ANALYSIS_PHASES.md for their outputs
- Background agent IDs: af550d6 (Phase 2), a6996bf (Phase 3), a8c7761 (Phase 4)
- If outputs weren't appended, re-run the agents or write the specs manually
- Architecture consolidation (C9) is the hardest decision — affects everything downstream

---

### Notes: 2026-01-31 (evening) — AbortError cascade fix

**Session context:** Fixed critical AbortError cascade that flooded the console on every page load. 6 files changed.

**Errors fixed (see progress.txt ERROR LOG for full details):**
- ERR-001: AbortError race condition in AuthContext — removed getSession() race with onAuthStateChange
- ERR-002: React Router v7 deprecation warnings — added future flags to BrowserRouter
- Also improved: Screening.jsx, Feed.jsx, useFileUpload.js, errorLogger.js — all now handle AbortErrors silently

**Key decision:**
- Removed explicit `getSession()` from AuthContext init. Supabase JS v2.39+ fires `INITIAL_SESSION` via `onAuthStateChange`, making the explicit call redundant and race-prone.
- Removed `global.fetch` wrapper from Supabase client config — was unnecessary indirection.
- Added retry logic to useFileUpload for AbortError-interrupted uploads.

**IMPORTANT RULE — Error Logging Protocol:**
- Every error encountered MUST be logged in `progress.txt` under ERROR LOG section with ERR-XXX ID
- Before debugging ANY error, CHECK the ERROR LOG FIRST to avoid repeating the same cycle
- Format: ERR-XXX | Status | Date | Summary + Root cause + Files + Fix + Verify steps

---

### Notes: 2026-01-31

**Session context:** Documented the Agentic TDD methodology into CLAUDE.md. This is the first session where the recursive testing loop is formalized.

**Decisions:**
- ATDD loop now part of the official workflow. Every feature should go through: specify → test → implement → verify → commit → reflect.
- Agent notes live at the bottom of CLAUDE.md, read first every session.

**Gotchas to remember:**
- Supabase `CREATE TABLE IF NOT EXISTS` does NOT add new columns. Always use `ALTER TABLE ADD COLUMN IF NOT EXISTS`.
- After any `ALTER TABLE` on Supabase, MUST run `NOTIFY pgrst, 'reload schema'` or REST API returns PGRST204 for new columns.
- Direct psql to Supabase DB fails. Use the Management API endpoint instead.
- File MIME detection varies by browser. Always do extension-based fallback validation.

**Testing status:**
- No formal test suite exists yet. Test infrastructure needs to be set up (Vitest for mobile-app, pytest for FastAPI backend).
- Seed data (`seed.sql`) has NOT been run in Supabase yet — feed shows no opportunities.

**Patterns that work:**
- `useFileUpload` hook pattern — reusable, handles validation + upload + profile update.
- Screening-as-gate pattern — check `screening_completed` before showing feed, redirect if not done.
- Inline operations (e.g., upload within screening wizard) prevent navigation interruptions.

**Warnings for next session:**
- Two disconnected architectures exist (Supabase vs FastAPI/SQLite). Consolidation decision still pending.
- Theme conflict: PRD says purple, tender-frontend uses emerald green. Owner decision needed.
- The full end-to-end flow (Signup -> Screening -> Feed -> Swipe -> Inbox) has NOT been tested yet.

<!-- AGENT: Append new session notes above this line. Keep the most recent 5-10 entries. Delete entries older than 30 days if they contain only transient info. -->

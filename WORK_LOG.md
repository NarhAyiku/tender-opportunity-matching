# TENDER — Work Log

> Session-by-session development history for the TENDER opportunity matching platform.
> Reverse chronological order (newest first).

---

## How to Use This Log

- **Before starting work:** Read the most recent entry to understand current state and blockers.
- **After completing work:** Add a new entry using the template below.
- **AI agents:** Always add an entry when completing significant work (new features, major fixes, architectural changes).
- **Reference:** Use `progress.txt` for milestone-level tracking. This log is for session-level detail.

---

## Entry Template

Copy this template for new entries:

```markdown
### Session: [Title] — [YYYY-MM-DD]

**Objective:** [What was the goal of this session?]
**Milestone:** [TDR-XXX or PRD Milestone reference]

#### Completed
- [x] Item 1
- [x] Item 2

#### Decisions Made
- Decision: [rationale]

#### Files Changed
- `path/to/file` — [what changed]

#### Blockers / Open Issues
- [description, or "None"]

#### Next Steps
1. Step 1
2. Step 2
```

---

## Session Log

---

### Session: Applications & Tracking Enhancement — 2026-02-04

**Objective:** Improve the Application page so users always understand where they stand, what is pending, what the organization has or hasn't received, and what they need to do next.
**Milestone:** C3 (Applications page enhancement from Gap Analysis)

#### Phase 1: Gap Analysis — COMPLETED

**Identified Gaps:**

| Category | Gap |
|----------|-----|
| Missing Feedback | No human-readable summary, no pending outcome explanation, no visibility into org actions |
| Missing Structure | "Your recent applications" unclear, progress not standardized |
| Visual Gaps | Logo fallback strategy basic, no branded placeholder logos |
| Process Gaps | No post-interest checklist, no checklist for org requirements |

#### Phase 2: New Components — COMPLETED

**Created 5 new components (mobile-app):**
1. `ApplicationSummary` — Dynamic plain-language status explanation
2. `PendingOutcomeIndicator` — Visual pipeline showing application stages
3. `OrganizationSignals` — Shows employer actions (received, viewed, requested info)
4. `ApplicationChecklist` — Dynamic checklist of requirements (resume, portfolio, interview, etc.)
5. `CompanyLogo` — Smart logo with gradient fallback using company initials

**Enhanced components:**
- `StatusBadge` — Added new statuses: viewed, action_required, pending
- `Applications.jsx` — Friendly greeting, status filters, search, improved cards
- `ApplicationTracking.jsx` — Integrated all new components, added "what happens next" guidance

**tender-frontend updates:**
- `ApplicationsPage.tsx` — CompanyLogo, status filters, search, summaries

#### Phase 3: UI/Design — COMPLETED

- Clean, calm, confidence-building UI
- Gradient logo fallbacks for consistent visual quality
- Color-coded status indicators
- Smooth animations with framer-motion
- Premium feel throughout

#### Phase 4: Mock Data — COMPLETED

Enhanced `mockApplications.js` with:
- 5 sample applications (submitted, in_progress, interview, offer, rejected)
- Rich event timelines
- Opportunity requirements (requires_transcript, requires_portfolio, etc.)

#### Decisions Made
- **Logo fallback strategy:** Generate consistent gradient based on company name hash + display 2-letter initials
- **Summary generation:** Dynamic based on status + events, with AI sparkle indicator
- **Progress visualization:** 5-stage pipeline (Submitted → Under Review → Viewed → Interview → Decision)
- **Checklist approach:** Generate dynamically from application data + opportunity requirements

#### Files Changed
- `mobile-app/src/components/ui/CompanyLogo.jsx` — NEW
- `mobile-app/src/components/applications/ApplicationSummary.jsx` — NEW
- `mobile-app/src/components/applications/PendingOutcomeIndicator.jsx` — NEW
- `mobile-app/src/components/applications/OrganizationSignals.jsx` — NEW
- `mobile-app/src/components/applications/ApplicationChecklist.jsx` — NEW
- `mobile-app/src/components/applications/index.js` — NEW
- `mobile-app/src/components/ui/StatusBadge.jsx` — Enhanced with new statuses
- `mobile-app/src/pages/Applications.jsx` — Full redesign
- `mobile-app/src/pages/ApplicationTracking.jsx` — Integrated new components
- `mobile-app/src/data/mockApplications.js` — Enhanced with more examples
- `tender-frontend/src/pages/ApplicationsPage.tsx` — Enhanced with new features
- `.gemini/implementation_plans/applications_tracking_enhancement.md` — NEW

#### Verification
- ✅ mobile-app build: SUCCESS (1.16 MB bundle)
- ✅ tender-frontend build: SUCCESS (459 KB bundle)

#### Blockers / Open Issues
- Mock data only — needs backend integration for real applications
- Real-time updates not implemented (would need Supabase subscriptions)

#### Next Steps
1. Connect to real Supabase data (replace mock data)
2. Implement real-time status updates
3. Add AI-generated "what happens next" predictions
4. Add follow-up reminder nudges

---

### Session: Comparative Gap Analysis & Product Redesign (Phase 1-5) — 2026-02-04

**Objective:** Full comparative analysis of TENDER vs Sorce.jobs (reference system). Produce gap analysis, feature specs, design system, AI architecture, and implementation plan across 5 phases.
**Milestone:** Cross-cutting — informs all future development.

#### Phase 1: Comparative Gap Analysis — COMPLETED

**Research performed:**
- Analyzed 33 Sorce app screenshots (owner's device) covering all screens: splash, feed, job details, applications dashboard, timeline, AI-filled form data, feedback chat, email inbox, profile (4 tabs), settings, credits, live sessions
- Web research: Sorce.jobs homepage, Y Combinator profile, HireTop deep-dive, App Store listing, FunBlocks review
- Full codebase exploration of mobile-app/src/ (all pages, components, hooks, styles, contexts, services)
- Read project memories, PRD, progress.txt, CLAUDE.md

**10 Critical Gaps Identified:**
1. C1: Feed preferences/filters not applied to feed query
2. C2: Profile entries can't be edited or deleted (only add)
3. C3: Applications page is flat list — no dashboard, no status breakdown
4. C4: No settings page (can't sign out, delete account, manage notifications)
5. C5: Resume parsing exists in backend but not wired to mobile app
6. C6: Smart feed ranking — match scoring exists but feed is unranked
7. C7: Only 28 seed opportunities — need job aggregation pipeline
8. C8: Personal info incomplete — missing demographics, DOB, title
9. C9: Dual architecture (FastAPI+SQLite vs Supabase) needs consolidation
10. C10: Zero test infrastructure

**10 Enhancement Gaps Identified:**
1. E1: AI cover letter generation
2. E2: Application pre-saved responses (Sorce's "Responses" tab)
3. E3: Company profile pages
4. E4: Passed/swiped-left jobs list (view history, undo)
5. E5: File management (preview, multi-file, select default)
6. E6: Match quality indicator on cards
7. E7: Real-time updates (Supabase subscriptions)
8. E8: Feedback/support channel
9. E9: Notification system
10. E10: Onboarding swipe tutorial

**7 Optional/Future Gaps:**
- O1: AI auto-apply agent (Sorce's core — requires browser automation infra)
- O2-O7: Monetization, referrals, live sessions, email inbox, resume tailoring, creator codes

**TENDER's Strategic Advantages over Sorce:**
- Broader opportunity types (jobs + internships + scholarships + grants)
- Student/graduate focus with education requirements matching
- Document vault with versioning
- Screening quality gate
- Structured 5-step onboarding
- Open architecture (Supabase + custom backend flexibility)

**Recommended Sprint Order:**
- Sprint 1 (Foundation): C2, C4, C8, C10
- Sprint 2 (Feed Quality): C1, C5, C6, E6, E10
- Sprint 3 (Applications UX): C3, E4, E3, E5
- Sprint 4 (AI Layer): E1, E2, E8
- Sprint 5 (Scale): C7, C9, E7, E9

#### Phase 2: Feature & System Implementation — IN PROGRESS
(See ARCHITECTURE.md or GAP_ANALYSIS_PHASES.md for full specs)

#### Phase 3: UI/Design System Rebuild — IN PROGRESS
(See ARCHITECTURE.md or GAP_ANALYSIS_PHASES.md for full specs)

#### Phase 4: AI & Agentic Architecture — IN PROGRESS
(See ARCHITECTURE.md or GAP_ANALYSIS_PHASES.md for full specs)

#### Phase 5: Sub-Agent Creation — IN PROGRESS
(See ARCHITECTURE.md or GAP_ANALYSIS_PHASES.md for full specs)

#### Decisions Made
- Decision: Keep purple brand identity (distinct from Sorce's green). Purple is TENDER's brand.
- Decision: TENDER's edge is breadth (jobs+scholarships+grants+internships) AND student-focus, NOT auto-apply (which is Sorce's infra-heavy moat). Focus on matching quality and profile completeness first.
- Decision: Sprint 1 (Foundation) should ship first — edit/delete, settings, personal info, tests. These are broken UX that undermine trust.
- Decision: Auto-apply (O1) is future/optional — requires browser automation infrastructure that's premature. Focus on AI-assisted matching, cover letters, and profile enrichment instead.

#### Files Changed
- `WORK_LOG.md` — This entry
- `progress.txt` — Updated with gap analysis results

#### Blockers / Open Issues
- Architecture consolidation decision (C9) still pending — FastAPI vs Supabase-only
- Job aggregation (C7) is large effort — Jooble/Adzuna adapters exist in FastAPI but not connected to Supabase
- Auto-apply agent (O1) requires significant infra discussion

#### Next Steps
1. Complete Phases 2-5 documentation (feature specs, design system, AI architecture)
2. Begin Sprint 1 implementation: Profile edit/delete, Settings page, Personal info expansion, Vitest setup
3. Owner testing checkpoint before Sprint 2

---

### Session: Supabase Migration, File Uploads & Critical Fixes — 2026-01-31

**Objective:** Run all pending SQL migrations against Supabase, wire file uploads into mobile-app, fix runtime errors blocking the feed/screening/upload flows.
**Milestone:** PRD Milestones 1A, 3B, 5B (Database migrations, Screening gate, Vault frontend)

#### Completed

**Supabase Schema Migrations (via Management API):**
- [x] Created `update_updated_at()` trigger function
- [x] Added 9 profile columns via DO $ block: `screening_completed`, `screening_completed_at`, `screening` (JSONB), `age`, `preferred_countries`, `consent_share_documents`, `cv_filename`, `transcript_url`, `transcript_filename`
- [x] Created `conversations` table with RLS policies + indexes
- [x] Created `conversation_events` table with RLS policies + index
- [x] Created `handle_interested_swipe()` trigger — auto-creates conversation + "applied" event on swipe right
- [x] Created Supabase Storage buckets: `resumes`, `transcripts`
- [x] Added 8 storage RLS policies (SELECT, INSERT, UPDATE, DELETE for both buckets)
- [x] **CRITICAL FIX:** Added 14 more missing columns to profiles (bio, phone, resume_url, resume_filename, skills, work_experiences, education_entries, projects, languages, awards, interests, linkedin_url, github_url, portfolio_url) — original `CREATE TABLE IF NOT EXISTS` didn't add these to the existing table
- [x] Ran `NOTIFY pgrst, 'reload schema'` to refresh PostgREST cache

**File Upload Hook:**
- [x] Created `mobile-app/src/lib/useFileUpload.js` — reusable hook for uploading files to Supabase Storage
- [x] Handles: file picker trigger, MIME + extension validation (PDF/DOCX), 10MB size limit, upload to bucket, update profile row with URL + filename
- [x] Returns: `{ inputRef, uploading, error, triggerPicker, handleFileChange }`

**Profile.jsx — File Upload Integration:**
- [x] Wired FilesTab with two `useFileUpload` instances (resumes + transcripts)
- [x] Added hidden `<input type="file">` elements + upload buttons + spinners + error display
- [x] Added `handleFinish` function (navigates to first incomplete tab)
- [x] Added `handleUploadSuccess` callback (reloads profile data)

**Screening.jsx — Inline Document Upload:**
- [x] Replaced `navigate('/profile')` in step 3 with inline `DocumentUploadStep` component
- [x] Two useFileUpload instances within screening flow
- [x] On upload success, updates `has_resume`/`has_transcript` state immediately
- [x] User stays on screening page — no navigation away

**Feed.jsx — Resilient Screening Check:**
- [x] Changed to `data?.screening_completed === true` (explicit boolean check)
- [x] On any query error, log warning and allow through (don't permanently block feed)

**BottomNav.jsx — Hidden During Screening:**
- [x] Added `/screening` to hidden-paths check (screening is a full blocking flow)

**File Upload Validation Fix:**
- [x] Added extension-based fallback in `isAllowedFile()` — some browsers don't set correct MIME for PDFs

#### Decisions Made
- **Supabase Management API:** Direct psql to Supabase DB fails (hostname doesn't resolve). Used `POST https://api.supabase.com/v1/projects/{ref}/database/query` with Bearer token instead.
- **CREATE TABLE IF NOT EXISTS gotcha:** This SQL statement does NOT add columns to an existing table. Must use ALTER TABLE ADD COLUMN separately. This caused 14 columns to be silently missing.
- **PostgREST cache:** After ALTER TABLE, must run `NOTIFY pgrst, 'reload schema'` or the REST API returns PGRST204 errors for new columns.
- **File validation:** MIME-first with extension fallback is more robust than MIME-only, since browser MIME detection varies.
- **Screening flow:** User must NOT navigate away during screening. All uploads happen inline within the screening wizard.

#### Files Changed
- `mobile-app/supabase/schema.sql` — Sections 5-9: profile columns, conversations table, conversation_events, swipe trigger, storage policies
- `mobile-app/src/lib/useFileUpload.js` — NEW: reusable file upload hook for Supabase Storage
- `mobile-app/src/pages/Profile.jsx` — FilesTab upload integration + Finish button
- `mobile-app/src/pages/Screening.jsx` — Inline DocumentUploadStep in step 3
- `mobile-app/src/pages/Feed.jsx` — Resilient screening check (allow through on error)
- `mobile-app/src/components/BottomNav.jsx` — Hide nav on /screening route

#### Blockers / Open Issues
- **Seed data not loaded:** `mobile-app/supabase/seed.sql` has 15 sample opportunities but hasn't been run in Supabase yet. Feed will show "No matches" until seeded.
- **Architecture split:** mobile-app uses Supabase directly; FastAPI backend uses SQLite. They are completely disconnected. Need to decide: consolidate or keep both.
- **Saved page:** No dedicated saved opportunities page exists yet. BottomNav links to `/saved` but no route handler.

#### Next Steps
1. Run `seed.sql` in Supabase to populate opportunities
2. Test full end-to-end flow: Signup → Screening → Feed → Swipe → Inbox
3. Build saved opportunities page
4. Start mobile-app parsing integration (Milestone 2D)

---

### Session: Full Project Audit — 2026-01-31

**Objective:** Comprehensive audit of entire codebase against PRD, SRS, progress tracker. Identify gaps, architectural drift, and next priorities.
**Milestone:** All milestones (cross-cutting audit)

#### Completed
- [x] Read and analyzed: PRD.md, SRS.md, SRS-Architecture.md, progress.txt, WORK_LOG.md
- [x] Explored full codebase structure (backend, mobile-app, tender-frontend)
- [x] Identified architecture drift: SRS describes Next.js + PostgreSQL + Redis, reality is React Vite + Supabase
- [x] Identified disconnected systems (FastAPI/SQLite vs mobile-app/Supabase)
- [x] Catalogued all incomplete milestones
- [x] Updated all project tracking documents (this session)

#### Decisions Made
- **Document loop established:** PRD → progress.txt → WORK_LOG.md → CLAUDE.md → SRS-Architecture.md. Every session should update these.
- **Priority: seed data first:** Feed cannot be tested until opportunities exist in Supabase.

#### Files Changed
- `progress.txt` — Updated with all 2026-01-31 work, added Supabase infrastructure section, architecture note, development workflow & tools guide
- `WORK_LOG.md` — Added two session entries for 2026-01-31
- `CLAUDE.md` — Added mobile-app architecture, Supabase details, development workflow, Claude skills guide
- `SRS-Architecture.md` — Added "Current Implementation Reality" section

#### Blockers / Open Issues
- None — documentation task

#### Next Steps
1. Seed opportunities into Supabase
2. Continue with remaining work items in progress.txt

---

### Session: Parsing Pipeline Implementation — 2026-01-25

**Objective:** Implement resume/transcript parsing to auto-fill user profiles (deterministic regex/heuristic approach for MVP).
**Milestone:** PRD Milestone 2 (Parsing Pipeline)

#### Completed

**Backend:**
- [x] Created `Document` and `ParsedDocument` SQLAlchemy models in `app/models/document.py`
- [x] Created Pydantic schemas in `app/schemas/document.py` for API validation
- [x] Implemented `DocumentParser` service in `app/services/document_parser.py` with section detection and named entity extraction (regex/heuristic)
- [x] Created `app/api/parsing.py` with endpoints:
  - `POST /files/resume/parse` — trigger resume parsing
  - `POST /files/transcript/parse` — trigger transcript parsing
  - `GET /files/parse/{id}` — get parse status/result
  - `POST /profile/apply-parsed` — apply parsed data to user profile
- [x] Registered parsing router in `app/main.py`
- [x] Updated `requirements.txt` with `python-docx`, `PyPDF2`

**Frontend (tender-frontend):**
- [x] Created `ParsedData`, `ParseResult` TypeScript interfaces in `src/types/document.ts`
- [x] Created `src/api/documentsApi.ts` API client for parsing endpoints
- [x] Created `ParsedDataReview.tsx` component for reviewing/confirming extracted data

#### Decisions Made
- **Parsing strategy:** Use `PyPDF2` and `python-docx` with keyword/regex matching for reliability and speed (MVP). LLM-assisted parsing planned for future.
- **Confidence scoring:** Field-level confidence scores (0.0–1.0). Threshold of 0.70 for auto-fill vs "review needed".
- **User flow:** Upload → Backend Parse → Frontend Polling → Review UI → Confirm/Edit → Apply to Profile.
- **Database:** Additive migration for `documents` and `parsed_documents` tables.

#### Files Changed
- `app/models/document.py` — New: Document + ParsedDocument models
- `app/schemas/document.py` — New: Pydantic schemas for parsing API
- `app/services/document_parser.py` — New: DocumentParser service with regex extraction
- `app/api/parsing.py` — New: Parsing API endpoints
- `app/main.py` — Added parsing router registration
- `requirements.txt` — Added python-docx, PyPDF2
- `tender-frontend/src/types/document.ts` — New: ParsedData types
- `tender-frontend/src/api/documentsApi.ts` — New: Parsing API client
- `tender-frontend/src/components/profile/ParsedDataReview.tsx` — New: Review component

#### Blockers / Open Issues
- **Frontend integration not wired up:** `ParsedDataReview` exists but is not yet integrated into `DocumentUploadPage.tsx`. Need to modify upload page to: call parse after upload → show loading → display review → handle "Apply to Profile".
- **Database migration not run:** New tables (documents, parsed_documents) need migration execution.

#### Next Steps
1. Integrate parsing into `DocumentUploadPage.tsx` (trigger parse after upload, show review UI)
2. Run database migration for new tables
3. Test end-to-end flow with a sample PDF resume
4. Add parsing integration to mobile-app (Milestone 2D)

---

### Session: UI Redesign (Sorce.jobs Emerald Theme) — 2026-01-24

**Objective:** Redesign the tender-frontend UI to match the aesthetic of Sorce.jobs — clean, rounded, Emerald Green theme.
**Milestone:** PRD Milestone 6 (Theming)

#### Completed
- [x] Updated `tailwind.config.js` — changed `colors.primary` palette to Emerald Green (`#059669` base), added Sorce.jobs-specific shades
- [x] Redesigned `AppLayout.tsx` header — minimal glassmorphic style (`backdrop-blur-md`), simplified mobile header
- [x] Updated `SwipeCard.tsx` — increased card border radius to `rounded-[2.5rem]`, Emerald Green accents on "Why you match" section, replaced "Applied" badge with "New Match" indicator, updated typography
- [x] Styled `SwipeActions.tsx` — large Red "X" circle for Pass (w-16 h-16), large Green Heart circle for Like/Apply (w-16 h-16), improved hover states and shadows

#### Decisions Made
- **Theme choice:** Adopted Emerald Green (`#059669`) inspired by Sorce.jobs aesthetic. Note: PRD specifies Purple — this needs owner alignment.
- **Card design:** Large rounded corners (`2.5rem`) for modern mobile feel.
- **Action buttons:** Oversized circle buttons (64px) for easy touch targets.

#### Files Changed
- `tender-frontend/tailwind.config.js` — Primary color palette → Emerald Green
- `tender-frontend/src/components/layout/AppLayout.tsx` — Header redesign
- `tender-frontend/src/components/swipe/SwipeCard.tsx` — Card visual overhaul
- `tender-frontend/src/components/swipe/SwipeActions.tsx` — Action button redesign

#### Blockers / Open Issues
- **Theme conflict:** PRD specifies Purple, but this session applied Emerald Green. Owner decision needed on which to use going forward.

#### Verification
- Ran `npm run build`: SUCCESS (TypeScript compilation + CSS generation clean)

#### Next Steps
1. Get owner decision on Purple vs Emerald Green theme
2. Apply chosen theme consistently across both frontends
3. Ensure feed cards show all opportunity fields per PRD

---

### Session: Swipe System Enhancement — 2026-01-16

**Objective:** Refine swipe functionality with status management, animations, and mobile app UX improvements.
**Milestone:** TDR-004 (Swipe Interface)

#### Completed
- [x] Added `@react-spring/web` dependency for swipe animations
- [x] Refined `UserSwipe` model with `status` field — values: `pending`, `interested`, `disliked`, `saved`
- [x] Updated default status to `"pending"` in UserSwipe model
- [x] Updated swipe API logic to set appropriate status based on swipe action
- [x] Enhanced mobile app swipe UX
- [x] Removed unused CSS styles from App.css
- [x] Created 2 feature PRs (#1, #2), both merged to `main`

#### Decisions Made
- **Swipe status model:** Swipes now carry a `status` field separate from `action`, allowing more granular tracking (e.g., a "like" action sets status to "interested").
- **Animation library:** Chose `@react-spring/web` for physics-based swipe animations.

#### Files Changed
- `app/models/swipe.py` — Added `status` column with default `"pending"`
- `app/api/swipes.py` — Updated logic to handle status for different actions
- `app/api/match.py` — Swipe status integration in feed logic
- `mobile-app/package.json` — Added @react-spring/web dependency
- `mobile-app/package-lock.json` — Updated lock file
- `mobile-app/src/` — Multiple component updates for swipe UX

#### Blockers / Open Issues
- None

#### Next Steps
1. Build mobile-first swipe UI (cards, gestures, animations)
2. Implement saved opportunities list view
3. Add swipe limit counter UI

---

### Session: MVP Phase 1 — Core Platform — 2026-01-16

**Objective:** Build complete MVP covering authentication, rich profiles, opportunities, smart matching feed, file uploads, and application tracking.
**Milestone:** TDR-001 (Auth), TDR-002 (Profile), TDR-004 (Swipe/Feed)

#### Completed

**Authentication (TDR-001):**
- [x] JWT token authentication with signup/login endpoints
- [x] Password hashing with pbkdf2_sha256 (via passlib)
- [x] `get_current_user` dependency for protected routes
- [x] OAuth2PasswordBearer token flow

**User Profiles (TDR-002):**
- [x] Rich user model: work experience, education, projects, skills, languages, awards (all JSON arrays)
- [x] Career goals/interests fields
- [x] Profile completion percentage (dynamically calculated)
- [x] PUT /users/me for profile updates

**Opportunities:**
- [x] Expanded opportunity model: company info, salary range, location, type (job/internship/scholarship/grant)
- [x] CRUD endpoints with filtering and pagination
- [x] Search by title, description, company

**Smart Feed & Matching:**
- [x] GET /match/feed — personalized feed excluding already-swiped opportunities
- [x] Match scoring (rule-based): skills overlap, preferences alignment, experience level
- [x] Feed ranked by match score descending

**Swipe System:**
- [x] POST /swipes — record like/dislike/save actions
- [x] Swipe history with filters (GET /swipes)
- [x] Liked/saved opportunity lists
- [x] Auto-create application on "like" action

**File Uploads:**
- [x] Resume upload (PDF, DOCX) — POST /files/resume
- [x] Transcript upload — POST /files/transcript
- [x] Profile picture upload — POST /files/profile-picture
- [x] Local file storage in /uploads/ directory
- [x] File validation (extension, size limits)

**Application Tracking:**
- [x] Application model with status tracking
- [x] Timeline events (ApplicationEvent model)
- [x] GET /applications with pagination

**Infrastructure:**
- [x] SQLAlchemy ORM with SQLite
- [x] Pydantic v2 schemas for all endpoints
- [x] CORS configuration
- [x] React/TypeScript frontend scaffolding (tender-frontend)

#### Decisions Made
- **Database:** SQLite for MVP speed; PostgreSQL migration planned for production.
- **Auth:** JWT with 15-minute token expiry. No refresh tokens yet.
- **File storage:** Local `/uploads/` directory. S3/cloud planned for production.
- **JSON columns:** Used for flexible profile arrays (skills, education, work experience) to avoid complex table joins during MVP.
- **Matching:** Rule-based scoring for MVP. AI embedding-based matching (sentence-transformers) planned for Phase 2.

#### Files Changed
- `app/main.py` — FastAPI app with all router registrations
- `app/database.py` — SQLAlchemy engine and session setup
- `app/security.py` — JWT auth, password hashing, auth dependencies
- `app/config.py` — File upload configuration
- `app/api/` — All router files (auth, users, preferences, opportunities, match, swipes, files, applications)
- `app/models/` — All model files (user, opportunity, preferences, swipe, application)
- `app/schemas/` — All schema files (profile, opportunity, preferences, swipe, application)
- `tender-frontend/` — Initial React + TypeScript project setup

#### Blockers / Open Issues
- None — Phase 1 MVP complete

#### Next Steps
1. Build mobile-first swipe UI
2. Implement opportunity bulk import (TDR-003)
3. Start AI matching engine (TDR-005)

---

### Session: Project Initialization & Auth — 2026-01-13

**Objective:** Set up the TENDER project from scratch and implement user authentication.
**Milestone:** TDR-001 (User Authentication)

#### Completed
- [x] FastAPI project scaffolding (`app/` directory structure)
- [x] SQLAlchemy database setup with SQLite (`app/database.py`)
- [x] JWT signup and login endpoints (`app/api/auth.py`)
- [x] User model with basic fields (`app/models/user.py`)
- [x] Password hashing with bcrypt/pbkdf2 (`app/security.py`)
- [x] Initial React frontend scaffolding (`tender-frontend/`)
- [x] Git repository initialized, first commit pushed

#### Decisions Made
- **Framework:** FastAPI for Python backend — async support, automatic OpenAPI docs, Pydantic integration.
- **ORM:** SQLAlchemy with declarative base pattern.
- **Auth strategy:** JWT tokens (stateless), no session storage needed.
- **Frontend:** React + TypeScript + Vite for fast development.

#### Files Changed
- Initial project structure created (all files are new)

#### Blockers / Open Issues
- None

#### Next Steps
1. Enrich user model with profile fields
2. Build opportunity model and endpoints
3. Implement swipe system

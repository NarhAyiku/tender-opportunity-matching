# TENDER - Architecture Documentation

**Version:** 1.0
**Generated:** 2026-02-01
**Status:** Development Readiness Assessment

---

## Table of Contents

1. [System Context (C4 Level 1)](#1-system-context)
2. [Container Architecture (C4 Level 2)](#2-container-architecture)
3. [Component Architecture (C4 Level 3)](#3-component-architecture)
4. [Data Architecture](#4-data-architecture)
5. [Security Architecture](#5-security-architecture)
6. [Development Readiness Assessment](#6-development-readiness-assessment)
7. [Architecture Decision Records](#7-architecture-decision-records)
8. [Risk Register](#8-risk-register)
9. [Recommendations](#9-recommendations)

---

## 1. System Context

### 1.1 System Context Diagram (C4 Level 1)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EXTERNAL ACTORS                              │
│                                                                     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────────────┐ │
│  │ Student/ │   │Recruiter │   │  Admin   │   │ Job Aggregators  │ │
│  │ Graduate │   │ (future) │   │ (future) │   │ (Jooble, Adzuna) │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────────┬─────────┘ │
│       │              │              │                   │           │
└───────┼──────────────┼──────────────┼───────────────────┼───────────┘
        │              │              │                   │
        ▼              ▼              ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    TENDER PLATFORM                                   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  Mobile App (React PWA)  ←→  Supabase (Auth, DB, Storage) │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │  FastAPI Backend (LEGACY)  ←→  SQLite (disconnected)       │    │
│  └─────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 System Boundaries

| Boundary | Description |
|----------|-------------|
| **Primary System** | Mobile App (React PWA) + Supabase backend |
| **Legacy System** | FastAPI + SQLite (parallel, NOT connected to mobile-app) |
| **External Services** | Supabase Cloud, Jooble API, Adzuna API (planned) |
| **Users** | Students, graduates seeking opportunities |
| **Future Users** | Recruiters, platform admins |

---

## 2. Container Architecture

### 2.1 Container Diagram (C4 Level 2)

```
┌────────────────────────────────────────────────────────────────────────────┐
│ USER DEVICE (Browser)                                                      │
│                                                                            │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  MOBILE APP (React + Vite PWA)                                       │  │
│  │  Port: 5173 (dev)                                                    │  │
│  │                                                                      │  │
│  │  Tech: React 18, Vite 7, Tailwind 4, Framer Motion, react-tinder-card│  │
│  │  Role: SPA with client-side routing, swipe UI, auth flows            │  │
│  └────────┬──────────────────────────┬──────────────────────┬───────────┘  │
│           │                          │                      │              │
└───────────┼──────────────────────────┼──────────────────────┼──────────────┘
            │ Auth (JWT)               │ Data (REST)          │ Files (S3-compat)
            ▼                          ▼                      ▼
┌────────────────────────────────────────────────────────────────────────────┐
│ SUPABASE CLOUD (aykrsqglrngxbcokqpad.supabase.co)                         │
│                                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  GoTrue      │  │  PostgREST   │  │  Storage     │  │  Realtime    │  │
│  │  (Auth)      │  │  (REST API)  │  │  (S3-compat) │  │  (disabled)  │  │
│  │              │  │              │  │              │  │              │  │
│  │  - Signup    │  │  - profiles  │  │  - resumes   │  │  eventsPerSec│  │
│  │  - Login     │  │  - opps      │  │  - transc.   │  │  = 0         │  │
│  │  - Session   │  │  - swipes    │  │              │  │              │  │
│  │  - JWT       │  │  - convos    │  │  RLS per-user│  │              │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────────────┘  │
│         │                 │                 │                              │
│         └─────────────────┼─────────────────┘                             │
│                           ▼                                               │
│                ┌──────────────────┐                                       │
│                │  PostgreSQL      │                                       │
│                │  (Supabase DB)   │                                       │
│                │                  │                                       │
│                │  Tables:         │                                       │
│                │  - profiles      │                                       │
│                │  - opportunities │                                       │
│                │  - swipes        │                                       │
│                │  - conversations │                                       │
│                │  - conv_events   │                                       │
│                └──────────────────┘                                       │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│ LEGACY SYSTEM (disconnected from mobile-app)                               │
│                                                                            │
│  ┌──────────────────┐       ┌──────────────────┐                          │
│  │  FastAPI Backend  │──────│  SQLite (app.db)  │                          │
│  │  Port: 8000       │       │                  │                          │
│  │                   │       │  SQLAlchemy ORM   │                          │
│  │  JWT + bcrypt     │       └──────────────────┘                          │
│  │  Python services  │                                                     │
│  └──────────────────┘                                                      │
└────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Container Inventory

| Container | Technology | Purpose | Status |
|-----------|-----------|---------|--------|
| **Mobile App** | React 18 + Vite 7 + Tailwind 4 | Primary user interface (PWA) | Active |
| **Supabase Auth (GoTrue)** | Supabase Cloud | Authentication, JWT, session management | Active |
| **Supabase PostgREST** | Supabase Cloud | Auto-generated REST API from PostgreSQL | Active |
| **Supabase Storage** | Supabase Cloud (S3-compat) | File uploads (resumes, transcripts) | Active |
| **PostgreSQL** | Supabase Cloud | Primary data store | Active |
| **FastAPI Backend** | Python 3.x + SQLAlchemy | Legacy REST API | Legacy/Parallel |
| **SQLite** | app.db | Legacy data store | Legacy/Parallel |
| **tender-frontend** | React + TypeScript + Vite | Secondary frontend (talks to FastAPI) | Secondary |

### 2.3 Communication Patterns

| From | To | Protocol | Auth |
|------|----|----------|------|
| Mobile App | GoTrue | HTTPS | Email/Password |
| Mobile App | PostgREST | HTTPS + JWT | Bearer token (anon key + JWT) |
| Mobile App | Storage | HTTPS + JWT | Bearer token |
| PostgREST | PostgreSQL | Internal | Service role |
| tender-frontend | FastAPI | HTTP (proxied) | JWT (bcrypt) |
| FastAPI | SQLite | Direct | N/A |

---

## 3. Component Architecture

### 3.1 Mobile App Components (C4 Level 3)

```
┌────────────────────────────────────────────────────────────────────┐
│ MOBILE APP (src/)                                                  │
│                                                                    │
│  ┌─────────────┐                                                  │
│  │  main.jsx   │  Entry point → React root                       │
│  └──────┬──────┘                                                  │
│         ▼                                                         │
│  ┌─────────────┐                                                  │
│  │  App.jsx    │  BrowserRouter + AuthProvider + Route definitions │
│  └──────┬──────┘                                                  │
│         │                                                         │
│  ┌──────┼──────────────────────────────────────────────┐          │
│  │ CONTEXT LAYER                                        │          │
│  │  ┌──────────────────┐                                │          │
│  │  │  AuthContext.jsx  │  Supabase auth state provider  │          │
│  │  │  (onAuthState     │  Provides: user, session,     │          │
│  │  │   Change)         │  signIn, signUp, signOut      │          │
│  │  └──────────────────┘                                │          │
│  └──────────────────────────────────────────────────────┘          │
│         │                                                         │
│  ┌──────┼──────────────────────────────────────────────┐          │
│  │ PAGE LAYER (routes)                                  │          │
│  │                                                      │          │
│  │  /login        → Login.jsx                           │          │
│  │  /signup       → Signup.jsx                          │          │
│  │  /screening    → Screening.jsx  (5-step wizard)      │          │
│  │  /             → Feed.jsx       (swipe cards)        │          │
│  │  /profile      → Profile.jsx    (3 tabs)             │          │
│  │  /preferences  → Preferences.jsx                     │          │
│  │  /inbox        → Inbox.jsx      (conversations)      │          │
│  │  /saved        → Saved.jsx                           │          │
│  │  /applications → Applications.jsx                    │          │
│  │  /opportunity  → OpportunityDetails.jsx              │          │
│  │  /application-preview → ApplicationPreview.jsx       │          │
│  └──────────────────────────────────────────────────────┘          │
│         │                                                         │
│  ┌──────┼──────────────────────────────────────────────┐          │
│  │ COMPONENT LAYER                                      │          │
│  │                                                      │          │
│  │  OpportunityCard.jsx  → Swipe card (react-tinder-card)│         │
│  │  BottomNav.jsx        → Tab navigation               │          │
│  │  SwipeLimitCounter.jsx→ Daily swipe limit display     │          │
│  │  ErrorBoundary.jsx    → Error catching wrapper        │          │
│  │  ProtectedRoute.jsx   → Auth guard (redirects)        │          │
│  │  ProfileForms.jsx     → Profile edit forms            │          │
│  │  ui/Button.jsx        → Design system button          │          │
│  │  ui/Card.jsx          → Design system card            │          │
│  │  ui/Skeleton.jsx      → Loading placeholder           │          │
│  │  ui/Toast.jsx         → Notification toast            │          │
│  │  ui/States.jsx        → Empty/error state displays    │          │
│  │  ui/Layout.jsx        → Page layout wrapper           │          │
│  │  ui/Chip.jsx          → Tag/badge component           │          │
│  └──────────────────────────────────────────────────────┘          │
│         │                                                         │
│  ┌──────┼──────────────────────────────────────────────┐          │
│  │ SERVICE/LIB LAYER                                    │          │
│  │                                                      │          │
│  │  lib/supabase.js      → Supabase client init         │          │
│  │  lib/useFileUpload.js → File upload hook (Storage)    │          │
│  │  lib/useResumeParser.js→ Resume parsing hook          │          │
│  │  services/api.js      → Legacy FastAPI client (unused)│          │
│  │  services/errorLogger.js→ Global error handler        │          │
│  └──────────────────────────────────────────────────────┘          │
│                                                                    │
│  ┌──────────────────────────────────────────────────────┐          │
│  │ STYLES                                                │          │
│  │                                                      │          │
│  │  index.css     → Global styles (Tailwind + custom)    │          │
│  │  styles/theme.css    → Design tokens                  │          │
│  │  styles/tokens.css   → CSS variables                  │          │
│  │  styles/auth.css     → Auth page styles               │          │
│  │  styles/components.css→ Component-specific styles     │          │
│  └──────────────────────────────────────────────────────┘          │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 User Flow Architecture

```
                           ┌──────────────┐
                           │  App Launch   │
                           └──────┬───────┘
                                  │
                           ┌──────▼───────┐
                           │  AuthContext  │
                           │  checks      │
                           │  session     │
                           └──────┬───────┘
                                  │
                    ┌─────────────┼─────────────┐
                    │ No session  │             │ Has session
                    ▼             │             ▼
             ┌──────────┐        │      ┌──────────────┐
             │ Login/   │        │      │ Check        │
             │ Signup   │        │      │ screening_   │
             └────┬─────┘        │      │ completed    │
                  │ success      │      └──────┬───────┘
                  └──────────────┘             │
                                    ┌──────────┼──────────┐
                                    │ false    │          │ true
                                    ▼          │          ▼
                             ┌──────────┐      │   ┌──────────┐
                             │Screening │      │   │  Feed    │
                             │ Wizard   │      │   │ (Swipe)  │
                             │ (5 steps)│      │   └────┬─────┘
                             └────┬─────┘      │        │
                                  │ complete   │        │ swipe right
                                  └────────────┘        ▼
                                                 ┌──────────────┐
                                                 │ Conversation │
                                                 │ created      │
                                                 │ (auto via    │
                                                 │  trigger)    │
                                                 └──────────────┘
```

### 3.3 Screening Wizard Steps

| Step | Content | Data Saved |
|------|---------|------------|
| 1 | Personal info (age, location) | `profiles.age`, `profiles.location` |
| 2 | Preferred countries | `profiles.preferred_countries[]` |
| 3 | Document uploads (resume, transcript) | Storage buckets + `profiles.resume_url` |
| 4 | Skills & interests | `profiles.skills[]`, `profiles.interests[]` |
| 5 | Consent + review | `profiles.consent_share_documents`, `profiles.screening_completed` |

---

## 4. Data Architecture

### 4.1 Database Schema (Supabase PostgreSQL)

```
┌──────────────────────────────────────────────────────────────────┐
│                      auth.users (Supabase managed)               │
│  id (UUID PK), email, encrypted_password, raw_user_meta_data     │
└───────────────────────┬──────────────────────────────────────────┘
                        │ 1:1 (trigger: handle_new_user)
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                      public.profiles                             │
│                                                                  │
│  id (UUID PK → auth.users)                                       │
│  email, full_name, avatar_url, headline, bio, phone, location    │
│  resume_url, resume_filename, cv_filename                        │
│  transcript_url, transcript_filename                             │
│  skills (TEXT[]), interests (TEXT[])                              │
│  work_experiences (JSONB), education_entries (JSONB)              │
│  projects (JSONB), languages (JSONB), awards (JSONB)             │
│  linkedin_url, github_url, portfolio_url                         │
│  preferences (JSONB)                                             │
│  screening_completed (BOOL), screening_completed_at (TIMESTAMPTZ)│
│  screening (JSONB), age (INT), preferred_countries (TEXT[])      │
│  consent_share_documents (BOOL)                                  │
│  created_at, updated_at (auto-trigger)                           │
│                                                                  │
│  RLS: Users can only CRUD their own row                          │
└──────────────────────────────────────────────────────────────────┘
                        │ 1:N
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                      public.swipes                               │
│                                                                  │
│  id (UUID PK)                                                    │
│  user_id (FK → auth.users) NOT NULL                              │
│  opportunity_id (FK → opportunities) NOT NULL                    │
│  action (TEXT: 'interested' | 'skip' | 'save')                   │
│  created_at                                                      │
│                                                                  │
│  UNIQUE(user_id, opportunity_id)                                 │
│  Trigger: handle_interested_swipe → creates conversation         │
│  RLS: Users can only CRUD their own swipes                       │
└──────────────────────────────────────────────────────────────────┘
                        │ N:1
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                      public.opportunities                        │
│                                                                  │
│  id (UUID PK, gen_random_uuid())                                 │
│  title, description, company_name, company_logo, location        │
│  opportunity_type ('job'|'internship'|'scholarship'|'grant')     │
│  work_arrangement ('remote'|'hybrid'|'onsite')                   │
│  experience_level, education_level                               │
│  salary_min, salary_max, salary_currency, salary_period          │
│  required_skills (TEXT[]), industry                               │
│  apply_url, apply_email                                          │
│  source, external_id                                             │
│  is_active (BOOL), expires_at                                    │
│  created_at, updated_at (auto-trigger)                           │
│                                                                  │
│  RLS: Anyone can SELECT where is_active = true                   │
│  Indexes: is_active, opportunity_type, created_at DESC           │
└──────────────────────────────────────────────────────────────────┘
                        │ referenced by
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                      public.conversations                        │
│                                                                  │
│  id (UUID PK)                                                    │
│  user_id (FK → auth.users) NOT NULL                              │
│  opportunity_id (FK → opportunities) NOT NULL                    │
│  type ('job'|'internship'|'scholarship'|'grant')                 │
│  status ('applied'|'viewed'|'shortlisted'|'interview'|           │
│          'offer'|'rejected'|'hired')                             │
│  unread_count (INT), last_message_at                             │
│  created_at, updated_at (auto-trigger)                           │
│                                                                  │
│  UNIQUE(user_id, opportunity_id)                                 │
│  Auto-created by handle_interested_swipe trigger                 │
│  RLS: Users can only CRUD their own conversations                │
└───────────────────────┬──────────────────────────────────────────┘
                        │ 1:N
                        ▼
┌──────────────────────────────────────────────────────────────────┐
│                      public.conversation_events                  │
│                                                                  │
│  id (UUID PK)                                                    │
│  conversation_id (FK → conversations) NOT NULL                   │
│  kind ('status_update'|'message'|'system')                       │
│  status (mirrors conversation.status values)                     │
│  message (TEXT)                                                   │
│  created_at                                                      │
│                                                                  │
│  RLS: Users can view/insert events for their own conversations   │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2 Storage Architecture

| Bucket | Visibility | Path Pattern | RLS |
|--------|-----------|-------------|-----|
| `resumes` | Private | `{user_id}/{filename}` | User can only access own folder |
| `transcripts` | Private | `{user_id}/{filename}` | User can only access own folder |

### 4.3 Database Triggers

| Trigger | Table | Event | Function | Purpose |
|---------|-------|-------|----------|---------|
| `on_auth_user_created` | `auth.users` | AFTER INSERT | `handle_new_user()` | Auto-creates profile row |
| `profiles_updated_at` | `profiles` | BEFORE UPDATE | `update_updated_at()` | Sets updated_at timestamp |
| `opportunities_updated_at` | `opportunities` | BEFORE UPDATE | `update_updated_at()` | Sets updated_at timestamp |
| `conversations_updated_at` | `conversations` | BEFORE UPDATE | `update_updated_at()` | Sets updated_at timestamp |
| `on_interested_swipe` | `swipes` | AFTER INSERT | `handle_interested_swipe()` | Creates conversation + "applied" event |

---

## 5. Security Architecture

### 5.1 Authentication Flow

```
┌──────────┐     ┌──────────────┐     ┌────────────┐
│  Client  │────▶│  GoTrue      │────▶│  auth.users│
│  (React) │     │  (Supabase)  │     │  (Postgres)│
│          │◀────│              │◀────│            │
│  Stores  │     │  Returns JWT │     │  Validates │
│  session │     │  + refresh   │     │  password  │
│  locally │     │  token       │     │  (bcrypt)  │
└──────────┘     └──────────────┘     └────────────┘
```

### 5.2 Authorization Model

| Layer | Mechanism | Description |
|-------|-----------|-------------|
| **API Access** | Supabase anon key | Rate-limited, enables PostgREST access |
| **Row-Level Security** | PostgreSQL RLS policies | Users can only access their own data |
| **Storage** | Folder-based RLS | Users can only access `{their_id}/` folder |
| **Frontend** | `ProtectedRoute.jsx` | Redirects unauthenticated users to `/login` |
| **Screening Gate** | `screening_completed` check | Blocks feed access until onboarding done |

### 5.3 Security Posture Assessment

| Area | Status | Notes |
|------|--------|-------|
| Authentication | **Good** | Supabase GoTrue handles password hashing, JWT, refresh tokens |
| Authorization (RLS) | **Good** | All tables have RLS enabled with per-user policies |
| Storage Security | **Good** | Private buckets with folder-level RLS |
| Input Validation | **Partial** | Supabase handles SQL injection; frontend validation is minimal |
| HTTPS | **Good** | Supabase endpoints are HTTPS by default |
| Secrets Management | **Needs work** | `.env` file with keys; Supabase PAT visible in `progress.txt` |
| CORS | **Default** | Using Supabase default CORS settings |
| Rate Limiting | **Default** | Supabase default rate limits only |

---

## 6. Development Readiness Assessment

### 6.1 Readiness Scorecard

| Category | Score | Status | Details |
|----------|-------|--------|---------|
| **Core Infrastructure** | 8/10 | Ready | Supabase fully set up, schema deployed, RLS active |
| **Authentication** | 9/10 | Ready | Signup, login, session management all working |
| **Database Schema** | 7/10 | Ready | 5 tables deployed; seed data NOT loaded |
| **Frontend Architecture** | 7/10 | Ready | 12 pages built, component library started |
| **File Storage** | 7/10 | Ready | Buckets created, upload hook works, RLS in place |
| **Testing** | 1/10 | Not Ready | No test framework, no tests, no CI |
| **CI/CD Pipeline** | 0/10 | Not Ready | No CI config, no automated deployments |
| **Error Handling** | 6/10 | Partial | ErrorBoundary + errorLogger exist; no monitoring |
| **Documentation** | 7/10 | Good | CLAUDE.md, PRD, progress.txt well-maintained |
| **Code Quality** | 5/10 | Needs work | No linting enforcement, no formatter, no pre-commit |

### 6.2 Blockers for Ongoing Development

#### Critical (Must Fix)

| # | Blocker | Impact | Effort |
|---|---------|--------|--------|
| 1 | **No seed data in Supabase** | Feed shows zero opportunities; app appears broken | Run `seed.sql` (15 min) |
| 2 | **No test infrastructure** | Zero regression safety; every change is a risk | Set up Vitest (1-2 days) |
| 3 | **Supabase PAT exposed in progress.txt** | Security vulnerability; PAT is committed to repo | Rotate PAT, use env vars (30 min) |
| 4 | **Two disconnected architectures** | Confusion about which system is canonical; duplicate work | Make consolidation decision |

#### High Priority (Should Fix Soon)

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 5 | No CI/CD pipeline | Manual deploys, no quality gates | GitHub Actions setup (1-2 days) |
| 6 | `services/api.js` still references FastAPI | Dead code confusion; 200+ lines of unused code | Delete or flag as legacy |
| 7 | No production build tested | `vite build` output untested | Test build + deploy to Vercel/Netlify |
| 8 | No end-to-end flow tested | Signup → Screening → Feed → Swipe → Inbox untested | Playwright E2E suite |

#### Medium Priority (Nice to Have)

| # | Issue | Impact |
|---|-------|--------|
| 9 | No error monitoring (Sentry/LogRocket) | Bugs in production invisible |
| 10 | No analytics | No usage data for product decisions |
| 11 | Realtime disabled (`eventsPerSecond: 0`) | No live updates in inbox |
| 12 | No PWA manifest/service worker | Not installable as PWA despite being designed as one |

### 6.3 What IS Working

These features are built and architecturally sound:

- **Auth flow**: Signup → Login → Session persistence → Protected routes
- **Profile system**: Rich profile with JSONB arrays for work/education/projects/skills
- **Screening gate**: 5-step wizard blocks feed until complete
- **Swipe system**: react-tinder-card integration with Supabase swipes table
- **Conversation auto-creation**: Database trigger creates conversation on "interested" swipe
- **Inbox**: Conversation list with type filtering, search, event timeline
- **File uploads**: useFileUpload hook → Supabase Storage with RLS
- **RLS security**: All tables protected; users isolated
- **Error boundaries**: Global error handler + component-level catching
- **Design system**: ui/ component library (Button, Card, Skeleton, Toast, States, Chip)

### 6.4 Architecture Health Indicators

```
Code Organization       ████████░░  80%  (clear separation, some dead code)
Data Integrity          █████████░  90%  (RLS, triggers, constraints)
Security                ███████░░░  70%  (auth good, secrets exposed)
Scalability Readiness   ██████░░░░  60%  (Supabase scales, but no caching)
Developer Experience    ████░░░░░░  40%  (no tests, no CI, no linting)
Production Readiness    ███░░░░░░░  30%  (no CI, no monitoring, no PWA setup)
Documentation           ████████░░  80%  (CLAUDE.md + PRD comprehensive)
```

---

## 7. Architecture Decision Records

### ADR-001: Supabase over Custom Backend

**Date:** January 2026
**Status:** Accepted
**Context:** Project started with FastAPI + SQLite backend. Mobile app needed auth, database, and file storage.
**Decision:** Use Supabase as the primary backend for the mobile app.
**Rationale:**
- Eliminates need to build/maintain auth, REST API, and storage
- PostgreSQL with RLS provides better security than SQLite
- Faster time-to-market with auto-generated REST API
- Built-in file storage with S3-compatible API
**Consequences:**
- FastAPI backend becomes legacy/parallel system
- Two disconnected data stores exist (Supabase PostgreSQL vs SQLite)
- Vendor lock-in to Supabase (mitigated: Supabase is open-source)
**Trade-offs not yet resolved:**
- No server-side business logic layer (everything is client-side or triggers)
- Complex queries require database functions or Edge Functions (not yet used)

### ADR-002: PWA over React Native

**Date:** January 2026
**Status:** Accepted
**Context:** Project PRD specified a mobile app (TDR-008). Decision needed between native app and PWA.
**Decision:** Build as a React web app (PWA-style) rather than React Native.
**Rationale:**
- Single codebase for web + mobile
- Faster development with familiar React + Vite tooling
- No app store approval process
- Supabase JS SDK works natively in browser
**Consequences:**
- No native push notifications (Web Push API only)
- No offline mode without service worker implementation
- No biometric login without WebAuthn
- Performance limitations vs native on older devices

### ADR-003: Client-Side Architecture (No BFF)

**Date:** January 2026
**Status:** Accepted, needs review
**Context:** Mobile app talks directly to Supabase without a Backend-for-Frontend.
**Decision:** Client communicates directly with Supabase services.
**Rationale:**
- Supabase JS SDK provides typed, ergonomic API
- RLS handles authorization at the database level
- No need to write/maintain API middleware
**Consequences:**
- Business logic lives in the client (e.g., screening validation, profile completion calculation)
- Complex operations require database triggers (e.g., `handle_interested_swipe`)
- AI matching engine (TDR-005) cannot run client-side; will need Edge Functions or external service
- No centralized logging or request tracing

### ADR-004: JSONB for Flexible Profile Data

**Date:** January 2026
**Status:** Accepted
**Context:** User profiles need to store variable-length arrays of structured data (work experience, education, projects).
**Decision:** Use JSONB columns instead of normalized relational tables.
**Rationale:**
- Simpler schema (one table vs. 6+ join tables)
- Flexible schema evolution without migrations
- Supabase PostgREST handles JSONB natively
- Profile data is always read/written as a whole (no partial updates)
**Consequences:**
- Cannot create indexes on individual fields within JSONB (performance impact at scale)
- No referential integrity within JSONB arrays
- Querying across JSONB arrays (e.g., "find all users with skill X") requires GIN indexes

### ADR-005: Architecture Consolidation (PENDING)

**Date:** February 2026
**Status:** Proposed — awaiting owner decision
**Context:** Two disconnected systems exist:
1. **Mobile App + Supabase** (active, primary)
2. **FastAPI + SQLite** (legacy, has services like document parsing, AI matching, job sync)

**Options:**
| Option | Description | Pros | Cons |
|--------|-------------|------|------|
| A. Keep Both | Supabase for mobile, FastAPI for advanced services | No migration risk | Dual maintenance, data sync needed |
| B. All Supabase | Migrate FastAPI logic to Edge Functions | One system, one DB | Edge Function limitations, rewrite effort |
| C. FastAPI as BFF | FastAPI calls Supabase DB, mobile calls FastAPI | Centralized logic | Rewrite mobile to use FastAPI, defeats Supabase benefits |
| D. Supabase + Microservices | Supabase for data, FastAPI services for AI/parsing only | Best of both | Complexity, inter-service communication |

**Recommendation:** Option D — Supabase remains the primary data layer; FastAPI services handle AI matching and document parsing via webhooks or Edge Function proxies.

---

## 8. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Supabase service outage | Low | High | Supabase is managed; accept risk; add error states for degraded mode |
| R2 | Data loss (no backups) | Low | Critical | Enable Supabase point-in-time recovery (Pro plan) |
| R3 | Security breach via exposed PAT | Medium | Critical | **Immediate:** Rotate PAT, remove from progress.txt, use env vars |
| R4 | Schema drift between code and DB | Medium | Medium | Version-control migrations; use Supabase CLI for migrations |
| R5 | No regression testing | High | High | Set up Vitest + Playwright; block merges without tests |
| R6 | Feature duplication across two systems | Medium | Medium | Make ADR-005 decision; consolidate or clearly delineate |
| R7 | PostgREST schema cache staleness | Medium | Medium | Document and automate `NOTIFY pgrst` after schema changes |
| R8 | AI matching engine has no server-side home | High | Medium | Plan Edge Function or microservice before TDR-005 |

---

## 9. Recommendations

### Immediate Actions (Before Next Feature Work)

1. **Rotate the Supabase PAT** — it's visible in `progress.txt` which is tracked by git. Generate a new one at `https://supabase.com/dashboard/account/tokens`, update `.mcp.json`, and ensure no secrets are in tracked files.

2. **Run seed.sql** — the feed is empty without sample opportunities. This unblocks all swipe/conversation testing.

3. **Delete or clearly mark `services/api.js`** — this 200+ line file talks to the FastAPI backend but is unused by the mobile app. It creates confusion.

4. **Set up Vitest** — add `vitest` to devDependencies, create a basic test config, and write at least one smoke test per page component.

### Short-Term Architecture Improvements

5. **Add a PWA manifest** — `manifest.json` with app name, icons, theme color. This makes the app installable on mobile devices.

6. **Add a service worker** — even a minimal one for offline fallback page.

7. **Make the ADR-005 decision** — the dual-architecture confusion is the single biggest source of complexity. Recommend Option D (Supabase + focused microservices).

8. **Set up GitHub Actions CI** — lint + build + test on every PR.

### Architectural Gaps for Roadmap Features

| Roadmap Feature | Architectural Gap |
|----------------|-------------------|
| **AI Matching (TDR-005)** | No server-side compute. Needs Edge Function or external service for embeddings. |
| **Auto-Apply (TDR-006)** | No email sending capability. Needs Supabase Edge Function + Resend/SendGrid. |
| **Bulk Import (TDR-003)** | No admin auth role. Needs Supabase custom claims or admin API. |
| **Analytics (TDR-007)** | No analytics infrastructure. Consider PostHog or Mixpanel. |
| **Push Notifications** | No service worker or Web Push setup. |

---

*This document should be updated when architectural decisions are made or the system topology changes. Next review: after ADR-005 decision.*

# Software Requirements Specification (SRS) & System Architecture
## AI-Powered Opportunity Matching Platform for Students and Graduates

**Version:** 2.0
**Last Updated:** January 2026
**Status:** Active Development

---

# Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Project Vision & Goals](#2-project-vision--goals)
3. [User Research & Personas](#3-user-research--personas)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture](#6-system-architecture)
7. [Data Architecture](#7-data-architecture)
8. [API Specification](#8-api-specification)
9. [UI/UX Architecture](#9-uiux-architecture)
10. [Security Architecture](#10-security-architecture)
11. [Infrastructure & DevOps](#11-infrastructure--devops)
12. [Implementation Roadmap](#12-implementation-roadmap)
13. [Risk Assessment](#13-risk-assessment)
14. [Appendices](#14-appendices)

---

# 1. Executive Summary

## 1.1 Problem Statement

Students and recent graduates face significant challenges in their job search:
- **Information Overload**: Hundreds of job boards with duplicated, outdated listings
- **Poor Matching**: Generic keyword search doesn't understand skills or potential
- **Application Fatigue**: Manually applying to 50+ jobs is exhausting and inefficient
- **Lack of Guidance**: No feedback on why applications fail or how to improve

## 1.2 Solution

A **Tinder-style job matching platform** that:
- Aggregates opportunities from multiple sources (Jooble, Adzuna, direct recruiters)
- Uses AI to match candidates based on skills, potential, and preferences
- Provides a frictionless swipe interface for quick decision-making
- Offers insights on match quality and improvement suggestions

## 1.3 Key Differentiators

| Feature | Traditional Job Boards | Our Platform |
|---------|----------------------|--------------|
| Discovery | Search-based | AI-curated feed |
| Interface | List/grid browsing | Swipe cards |
| Matching | Keyword matching | Skill + potential analysis |
| Application | Manual per job | One-tap interest |
| Feedback | None | Match scores + insights |

## 1.4 Success Metrics (KPIs)

| Metric | Target (6 months) | Target (12 months) |
|--------|------------------|-------------------|
| Monthly Active Users (MAU) | 10,000 | 50,000 |
| Jobs in Database | 100,000 | 500,000 |
| Swipes per User/Day | 20 | 30 |
| Match Rate | 15% | 25% |
| Interview Conversion | 5% | 10% |
| User Retention (30-day) | 40% | 60% |

---

# 2. Project Vision & Goals

## 2.1 Vision Statement

> "Empower every student and graduate to find meaningful opportunities that match their potential, not just their resume keywords."

## 2.2 Mission

To become the **#1 opportunity discovery platform** for students and early-career professionals by providing:
1. The largest aggregated database of entry-level opportunities
2. The most accurate AI-powered matching system
3. The most enjoyable job search experience

## 2.3 Strategic Goals

### Short-term (0-6 months)
- [ ] Launch MVP with core swipe functionality
- [ ] Integrate 3+ job data sources
- [ ] Achieve 10,000 registered users
- [ ] Establish baseline matching algorithm

### Medium-term (6-12 months)
- [ ] Launch mobile apps (iOS + Android)
- [ ] Implement AI-powered matching v2
- [ ] Add recruiter portal for direct postings
- [ ] Expand to 5 countries

### Long-term (12-24 months)
- [ ] AI interview preparation coach
- [ ] Skill gap analysis and course recommendations
- [ ] Premium features and monetization
- [ ] B2B enterprise recruiting solution

---

# 3. User Research & Personas

## 3.1 Primary Personas

### Persona 1: Sarah - The Anxious Graduate
```
Age: 22
Education: BS Computer Science, State University
Experience: 2 internships, 1 part-time job
Tech Comfort: High

Goals:
- Find first full-time job within 3 months
- Work at a reputable tech company
- Remote-friendly position

Pain Points:
- Overwhelmed by job board options
- Unsure which jobs match her skill level
- Tired of writing cover letters

Quote: "I've applied to 100 jobs and heard back from 3. What am I doing wrong?"
```

### Persona 2: Marcus - The Career Changer
```
Age: 28
Education: BA Marketing, now learning Data Science
Experience: 4 years marketing, completing bootcamp
Tech Comfort: Medium

Goals:
- Transition into data/analytics role
- Find company willing to train
- Competitive salary despite career change

Pain Points:
- Jobs require experience he doesn't have
- Doesn't know how to position himself
- Rejected by automated screening

Quote: "I have transferable skills but ATS systems don't see that."
```

### Persona 3: Recruiter Rachel
```
Age: 35
Role: Talent Acquisition Manager at Tech Startup
Hiring Volume: 20-30 entry-level roles/year

Goals:
- Find diverse, high-potential candidates
- Reduce time-to-hire
- Improve quality of applicant pool

Pain Points:
- Too many unqualified applications
- Hard to find candidates with right culture fit
- Entry-level hiring is time-consuming

Quote: "I want to see candidates who are genuinely interested, not mass-applying."
```

## 3.2 User Journey Maps

### Job Seeker Journey
```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           JOB SEEKER JOURNEY                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  AWARENESS        CONSIDERATION       ACTIVATION        RETENTION          │
│  ─────────        ─────────────       ──────────        ─────────          │
│                                                                             │
│  ┌─────────┐      ┌─────────┐        ┌─────────┐       ┌─────────┐        │
│  │ Hears   │      │Downloads│        │Completes│       │ Swipes  │        │
│  │ about   │─────▶│  app    │───────▶│ profile │──────▶│ daily   │        │
│  │ platform│      │         │        │         │       │         │        │
│  └─────────┘      └─────────┘        └─────────┘       └─────────┘        │
│       │                │                  │                 │              │
│       ▼                ▼                  ▼                 ▼              │
│  Social media     Onboarding         AI analyzes       Gets matches       │
│  Word of mouth    tutorial           skills/goals      and interviews     │
│  University       Value prop         Preferences       Lands job!         │
│                                                                             │
│  TOUCHPOINTS: Ads, Referrals, App Store, Email, Push, In-app             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 4. Functional Requirements

## 4.1 Feature Categories

### P0 - Must Have (MVP)
| ID | Feature | Description | User Story |
|----|---------|-------------|------------|
| F001 | User Registration | Email/Google signup with verification | As a user, I can create an account to save my progress |
| F002 | Profile Creation | Add education, skills, experience, preferences | As a user, I can build a profile so jobs match me better |
| F003 | Job Feed | Swipeable card interface showing matched jobs | As a user, I can browse jobs by swiping left/right |
| F004 | Swipe Actions | Left (skip), Right (interested), Up (save) | As a user, I can express interest with simple gestures |
| F005 | Job Details | Full job description, company info, requirements | As a user, I can see complete details before deciding |
| F006 | Saved Jobs | Bookmark jobs for later review | As a user, I can save jobs I want to revisit |
| F007 | Application Tracking | Track status of interested jobs | As a user, I can see which jobs I've shown interest in |
| F008 | Job Ingestion | Aggregate jobs from Jooble, Adzuna | As a system, I automatically fetch new jobs daily |

### P1 - Should Have (v1.1)
| ID | Feature | Description |
|----|---------|-------------|
| F101 | Push Notifications | New matches, application updates |
| F102 | Job Filters | Filter by location, salary, job type, remote |
| F103 | Search | Search within feed by keyword |
| F104 | Match Score | Show % match with explanation |
| F105 | Company Profiles | View company info, reviews, other jobs |
| F106 | Resume Upload | Parse resume to auto-fill profile |

### P2 - Nice to Have (v2.0)
| ID | Feature | Description |
|----|---------|-------------|
| F201 | AI Chat Coach | Get advice on applications, interviews |
| F202 | Skill Assessments | Verify skills with quick tests |
| F203 | Recruiter Portal | Recruiters post jobs directly |
| F204 | Analytics Dashboard | Insights on swipe patterns, market trends |
| F205 | Social Features | See where connections work |
| F206 | Interview Scheduler | Book interviews in-app |

## 4.2 Detailed Feature Specifications

### F003: Job Feed (Core Feature)

**Description:** The primary interface where users discover opportunities through a card-based swipe experience.

**Acceptance Criteria:**
```gherkin
Feature: Job Feed

  Scenario: Loading feed
    Given I am a logged-in user
    When I open the feed page
    Then I see a loading skeleton
    And jobs load within 2 seconds
    And I see the top job card

  Scenario: Swiping right (interested)
    Given I see a job card
    When I swipe right or tap the heart button
    Then the card animates off-screen to the right
    And the job is marked as "interested"
    And the next job card appears
    And I see a brief confirmation toast

  Scenario: Swiping left (skip)
    Given I see a job card
    When I swipe left or tap the X button
    Then the card animates off-screen to the left
    And the job is marked as "skipped"
    And the next job card appears

  Scenario: Empty feed
    Given I have swiped through all available jobs
    When the feed is empty
    Then I see a friendly empty state
    And I can tap "Refresh" to check for new jobs
    And I can adjust my filters

  Scenario: Error state
    Given the API is unavailable
    When I try to load jobs
    Then I see an error message
    And I can tap "Retry" to try again
```

**UI Components:**
- SwipeCard (job info, company, tags)
- ActionBar (skip, save, interested buttons)
- ProgressIndicator (cards remaining)
- MatchScore (% match badge)

**Technical Notes:**
- Prefetch next 5 cards for smooth UX
- Cache swiped jobs locally to prevent duplicates
- Implement gesture physics for natural feel
- Support keyboard navigation (← →) for web

---

# 5. Non-Functional Requirements

## 5.1 Performance

| Metric | Requirement | Measurement |
|--------|-------------|-------------|
| Page Load (LCP) | < 2.5 seconds | Lighthouse |
| Time to Interactive | < 3.5 seconds | Lighthouse |
| API Response Time | < 200ms (p95) | APM monitoring |
| Feed Load Time | < 1 second | Custom metric |
| Swipe Animation | 60 FPS | Performance profiler |
| Offline Support | Basic browsing | Service Worker |

## 5.2 Scalability

| Aspect | Current | 6-Month Target | 12-Month Target |
|--------|---------|----------------|-----------------|
| Concurrent Users | 100 | 5,000 | 25,000 |
| Database Size | 10K jobs | 100K jobs | 500K jobs |
| API Requests/sec | 50 | 500 | 2,500 |
| Storage | 1 GB | 50 GB | 250 GB |

## 5.3 Reliability

- **Uptime:** 99.5% (excluding planned maintenance)
- **Recovery Time Objective (RTO):** < 4 hours
- **Recovery Point Objective (RPO):** < 1 hour
- **Error Rate:** < 0.1% of requests

## 5.4 Security

- HTTPS everywhere (TLS 1.3)
- OAuth 2.0 / JWT authentication
- Password hashing (bcrypt, cost 12)
- SQL injection prevention (parameterized queries)
- XSS prevention (content security policy)
- Rate limiting (100 req/min per user)
- GDPR compliance for EU users

## 5.5 Accessibility

- WCAG 2.1 Level AA compliance
- Screen reader support
- Keyboard navigation
- Color contrast ratios ≥ 4.5:1
- Focus indicators visible
- Reduced motion support

---

# 6. System Architecture

## 6.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SYSTEM ARCHITECTURE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                              ┌─────────────┐                                │
│                              │   Vercel    │                                │
│                              │    CDN      │                                │
│                              └──────┬──────┘                                │
│                                     │                                       │
│         ┌───────────────────────────┼───────────────────────────┐          │
│         │                           │                           │          │
│         ▼                           ▼                           ▼          │
│  ┌─────────────┐           ┌─────────────┐            ┌─────────────┐      │
│  │   Next.js   │           │   Next.js   │            │React Native │      │
│  │    Web      │           │    API      │            │   Mobile    │      │
│  │   (SSR)     │           │  (Routes)   │            │    App      │      │
│  └──────┬──────┘           └──────┬──────┘            └──────┬──────┘      │
│         │                         │                          │             │
│         └─────────────────────────┼──────────────────────────┘             │
│                                   │                                        │
│                                   ▼                                        │
│                          ┌─────────────────┐                               │
│                          │   API Gateway   │                               │
│                          │  (Rate Limit)   │                               │
│                          └────────┬────────┘                               │
│                                   │                                        │
│                                   ▼                                        │
│  ┌────────────────────────────────────────────────────────────────────┐   │
│  │                         BACKEND SERVICES                           │   │
│  │                                                                    │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │   │
│  │  │   FastAPI    │  │   FastAPI    │  │   FastAPI    │            │   │
│  │  │    Auth      │  │    Jobs      │  │   Matching   │            │   │
│  │  │   Service    │  │   Service    │  │   Service    │            │   │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘            │   │
│  │         │                 │                 │                     │   │
│  └─────────┼─────────────────┼─────────────────┼─────────────────────┘   │
│            │                 │                 │                         │
│            ▼                 ▼                 ▼                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        DATA LAYER                                │    │
│  │                                                                  │    │
│  │  ┌────────────┐    ┌────────────┐    ┌────────────┐            │    │
│  │  │ PostgreSQL │    │   Redis    │    │    S3      │            │    │
│  │  │  (Primary) │    │  (Cache)   │    │  (Files)   │            │    │
│  │  └────────────┘    └────────────┘    └────────────┘            │    │
│  │                                                                  │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                     EXTERNAL SERVICES                             │   │
│  │                                                                   │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │   │
│  │  │  Jooble  │  │  Adzuna  │  │  OpenAI  │  │ SendGrid │        │   │
│  │  │   API    │  │   API    │  │   API    │  │  (Email) │        │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │   │
│  │                                                                   │   │
│  └───────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## 6.2 Technology Stack

### Frontend
| Layer | Technology | Justification |
|-------|------------|---------------|
| Framework | Next.js 14 (App Router) | SSR + SSG + API routes, great DX |
| Language | TypeScript | Type safety, better tooling |
| Styling | Tailwind CSS | Utility-first, fast development |
| State | Zustand + React Query | Simple global state + server cache |
| Animation | Framer Motion | Production-ready animations |
| Forms | React Hook Form + Zod | Performance + validation |
| Testing | Vitest + Playwright | Fast unit + E2E tests |

### Backend
| Layer | Technology | Justification |
|-------|------------|---------------|
| Framework | FastAPI | Async, fast, auto-docs |
| Language | Python 3.11+ | AI/ML ecosystem, readable |
| ORM | SQLAlchemy 2.0 | Mature, async support |
| Validation | Pydantic v2 | Fast, type-safe |
| Auth | JWT + OAuth2 | Stateless, standard |
| Task Queue | Celery + Redis | Reliable background jobs |
| Testing | Pytest + httpx | Async testing |

### Data
| Layer | Technology | Justification |
|-------|------------|---------------|
| Primary DB | PostgreSQL 15 | Robust, full-text search, JSONB |
| Cache | Redis 7 | Fast, pub/sub, sessions |
| Search | PostgreSQL FTS (→ Meilisearch) | Start simple, upgrade later |
| File Storage | S3 / Cloudflare R2 | Scalable, cheap |
| Analytics | PostHog | Open-source, self-hostable |

### Infrastructure
| Layer | Technology | Justification |
|-------|------------|---------------|
| Hosting (FE) | Vercel | Best Next.js support, edge |
| Hosting (BE) | Railway / Render | Simple Python deployment |
| CI/CD | GitHub Actions | Native, free for public repos |
| Monitoring | Sentry + Axiom | Errors + logs |
| DNS/CDN | Cloudflare | DDoS protection, caching |

## 6.3 Rendering Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    RENDERING STRATEGY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PAGE                    RENDERING    REASON                    │
│  ────                    ─────────    ──────                    │
│                                                                 │
│  Landing (/)             SSG          Static, fast, SEO         │
│  Jobs List (/jobs)       SSR + ISR    SEO + fresh data          │
│  Job Detail (/jobs/[id]) SSR          SEO + JSON-LD            │
│  Company (/companies/*)  SSR + ISR    SEO + caching            │
│  Blog (/blog/*)          SSG          Static content           │
│                                                                 │
│  Login (/login)          SSR          Simple, no JS needed     │
│  Signup (/signup)        SSR          Simple, no JS needed     │
│                                                                 │
│  Dashboard (/app/*)      CSR          Auth required, dynamic   │
│  Feed (/app/feed)        CSR          Real-time, animations    │
│  Profile (/app/profile)  CSR          User-specific            │
│  Settings (/app/*)       CSR          User-specific            │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  SSG = Static Site Generation (build time)                      │
│  SSR = Server-Side Rendering (request time)                     │
│  ISR = Incremental Static Regeneration (cached + revalidate)   │
│  CSR = Client-Side Rendering (browser)                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 6.4 Service Communication

```
┌─────────────────────────────────────────────────────────────────┐
│                  SERVICE COMMUNICATION                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐         REST/JSON          ┌──────────┐          │
│  │  Next.js │ ◄─────────────────────────► │ FastAPI  │          │
│  │  Client  │                            │  Server  │          │
│  └──────────┘                            └──────────┘          │
│       │                                       │                 │
│       │  WebSocket (future)                   │                 │
│       │  ─────────────────                    │                 │
│       │  • Real-time notifications            │                 │
│       │  • Match alerts                       │                 │
│       │  • Chat (if added)                    │                 │
│       │                                       │                 │
│       │                              ┌────────┴────────┐       │
│       │                              │                 │       │
│       │                              ▼                 ▼       │
│       │                       ┌──────────┐     ┌──────────┐   │
│       │                       │  Celery  │     │  Redis   │   │
│       │                       │  Worker  │     │  Pub/Sub │   │
│       │                       └──────────┘     └──────────┘   │
│       │                              │                         │
│       │                              ▼                         │
│       │                       ┌──────────────────────┐        │
│       │                       │   Background Tasks    │        │
│       │                       │   • Job sync          │        │
│       │                       │   • Email sending     │        │
│       │                       │   • AI matching       │        │
│       │                       │   • Analytics         │        │
│       │                       └──────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 7. Data Architecture

## 7.1 Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ENTITY RELATIONSHIP DIAGRAM                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────┐       ┌──────────────┐       ┌──────────────┐           │
│  │    users     │       │   profiles   │       │    skills    │           │
│  ├──────────────┤       ├──────────────┤       ├──────────────┤           │
│  │ id (PK)      │──1:1──│ id (PK)      │       │ id (PK)      │           │
│  │ email        │       │ user_id (FK) │       │ name         │           │
│  │ password_hash│       │ headline     │       │ category     │           │
│  │ google_id    │       │ bio          │       └──────────────┘           │
│  │ is_verified  │       │ location     │              │                    │
│  │ created_at   │       │ resume_url   │              │ M:N                │
│  │ updated_at   │       │ avatar_url   │              │                    │
│  └──────────────┘       │ preferences  │       ┌──────┴───────┐           │
│         │               └──────────────┘       │              │           │
│         │                      │               │              │           │
│         │ 1:N                  │ M:N           │              │           │
│         │               ┌──────┴───────┐      │              │           │
│         │               │              │      │              │           │
│         ▼               ▼              ▼      ▼              │           │
│  ┌──────────────┐ ┌────────────┐ ┌────────────────┐         │           │
│  │   swipes     │ │ education  │ │ profile_skills │         │           │
│  ├──────────────┤ ├────────────┤ ├────────────────┤         │           │
│  │ id (PK)      │ │ id (PK)    │ │ profile_id(FK) │         │           │
│  │ user_id (FK) │ │ profile_id │ │ skill_id (FK)  │         │           │
│  │ opp_id (FK)  │ │ institution│ │ level          │         │           │
│  │ action       │ │ degree     │ └────────────────┘         │           │
│  │ created_at   │ │ field      │                            │           │
│  └──────────────┘ │ start_date │                            │           │
│         │         │ end_date   │                            │           │
│         │         └────────────┘                            │           │
│         │                                                    │           │
│         │ N:1                                                │           │
│         │                                                    │           │
│         ▼                                                    │           │
│  ┌──────────────────┐       ┌──────────────┐                │           │
│  │  opportunities   │───────│  companies   │                │           │
│  ├──────────────────┤  N:1  ├──────────────┤                │           │
│  │ id (PK)          │       │ id (PK)      │                │           │
│  │ title            │       │ name         │                │           │
│  │ description      │       │ logo_url     │                │           │
│  │ company_id (FK)  │       │ website      │                │           │
│  │ location         │       │ industry     │                │           │
│  │ salary_min       │       │ size         │                │           │
│  │ salary_max       │       │ description  │                │           │
│  │ job_type         │       └──────────────┘                │           │
│  │ remote           │              │                         │           │
│  │ url              │              │ M:N                     │           │
│  │ source           │              │                         │           │
│  │ external_id      │       ┌──────┴───────┐                │           │
│  │ is_stale         │       │              │                │           │
│  │ refreshed_at     │       ▼              │                │           │
│  │ created_at       │ ┌────────────────┐   │                │           │
│  └──────────────────┘ │ opp_skills     │   │                │           │
│         │             ├────────────────┤   │                │           │
│         │ M:N         │ opp_id (FK)    │◄──┘                │           │
│         │             │ skill_id (FK)  │◄────────────────────┘           │
│         │             │ required       │                                  │
│  ┌──────┴───────┐     └────────────────┘                                 │
│  │              │                                                         │
│  ▼              │                                                         │
│ ┌────────────┐  │     ┌──────────────┐                                   │
│ │applications│  │     │ saved_jobs   │                                   │
│ ├────────────┤  │     ├──────────────┤                                   │
│ │ id (PK)    │  │     │ id (PK)      │                                   │
│ │ user_id    │  └────►│ user_id (FK) │                                   │
│ │ opp_id     │        │ opp_id (FK)  │                                   │
│ │ status     │        │ created_at   │                                   │
│ │ applied_at │        └──────────────┘                                   │
│ │ notes      │                                                           │
│ └────────────┘                                                           │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

## 7.2 Database Schema (PostgreSQL)

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    google_id VARCHAR(255) UNIQUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);

-- User Profiles
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    headline VARCHAR(255),
    bio TEXT,
    location VARCHAR(255),
    resume_url VARCHAR(500),
    avatar_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    industry VARCHAR(100),
    size VARCHAR(50),
    founded_year INTEGER,
    headquarters VARCHAR(255),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_companies_slug ON companies(slug);

-- Opportunities (Jobs)
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    company_id UUID REFERENCES companies(id),
    company_name VARCHAR(255), -- Denormalized for external jobs
    location VARCHAR(255),
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency VARCHAR(10) DEFAULT 'USD',
    job_type VARCHAR(50),
    experience_level VARCHAR(50),
    remote BOOLEAN DEFAULT FALSE,
    url VARCHAR(500) NOT NULL,

    -- Source tracking
    source VARCHAR(50) NOT NULL, -- 'jooble', 'adzuna', 'recruiter', 'manual'
    external_id VARCHAR(255),
    external_url VARCHAR(500),

    -- Freshness
    is_stale BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    refreshed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_source_external_id UNIQUE (source, external_id)
);

CREATE INDEX idx_opportunities_source ON opportunities(source);
CREATE INDEX idx_opportunities_is_active ON opportunities(is_active);
CREATE INDEX idx_opportunities_location ON opportunities(location);
CREATE INDEX idx_opportunities_job_type ON opportunities(job_type);
CREATE INDEX idx_opportunities_remote ON opportunities(remote);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at DESC);

-- Full-text search index
CREATE INDEX idx_opportunities_search ON opportunities
    USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Swipes (User interactions)
CREATE TABLE swipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    action VARCHAR(20) NOT NULL, -- 'interested', 'skip', 'save'
    created_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_user_opportunity UNIQUE (user_id, opportunity_id)
);

CREATE INDEX idx_swipes_user_id ON swipes(user_id);
CREATE INDEX idx_swipes_action ON swipes(action);

-- Applications
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'applied', -- 'applied', 'viewed', 'interviewing', 'offered', 'rejected'
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT uq_user_application UNIQUE (user_id, opportunity_id)
);

-- Skills
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profile Skills (M:N)
CREATE TABLE profile_skills (
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
    years_experience DECIMAL(3,1),
    PRIMARY KEY (profile_id, skill_id)
);

-- Opportunity Skills (M:N)
CREATE TABLE opportunity_skills (
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (opportunity_id, skill_id)
);
```

---

# 8. API Specification

## 8.1 API Design Principles

1. **RESTful** - Resource-based URLs, standard HTTP methods
2. **Versioned** - `/api/v1/` prefix for all endpoints
3. **Consistent** - Standard response format, error codes
4. **Documented** - OpenAPI/Swagger auto-generated

## 8.2 Base URL & Authentication

```
Base URL: https://api.opportunitymatch.com/api/v1

Authentication: Bearer Token (JWT)
Header: Authorization: Bearer <token>

Rate Limit: 100 requests/minute (authenticated)
            20 requests/minute (anonymous)
```

## 8.3 Response Format

```typescript
// Success Response
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": [
      { "field": "email", "message": "Must be a valid email" }
    ]
  }
}
```

## 8.4 Core Endpoints

### Authentication
```yaml
POST   /auth/register          # Create account
POST   /auth/login             # Login (email/password)
POST   /auth/google            # Login with Google
POST   /auth/refresh           # Refresh access token
POST   /auth/logout            # Invalidate token
POST   /auth/forgot-password   # Request password reset
POST   /auth/reset-password    # Reset password with token
GET    /auth/me                # Get current user
```

### Users & Profiles
```yaml
GET    /users/me               # Get current user profile
PATCH  /users/me               # Update profile
DELETE /users/me               # Delete account
POST   /users/me/avatar        # Upload avatar
POST   /users/me/resume        # Upload resume

GET    /users/me/skills        # Get user skills
POST   /users/me/skills        # Add skill
DELETE /users/me/skills/:id    # Remove skill

GET    /users/me/education     # Get education history
POST   /users/me/education     # Add education
PATCH  /users/me/education/:id # Update education
DELETE /users/me/education/:id # Remove education
```

### Opportunities (Jobs)
```yaml
GET    /opportunities                    # List opportunities (paginated, filtered)
GET    /opportunities/feed               # Get personalized feed for swiping
GET    /opportunities/:id                # Get single opportunity
GET    /opportunities/:id/similar        # Get similar opportunities

# Query Parameters for GET /opportunities
?search=python developer           # Full-text search
&location=remote                   # Location filter
&job_type=fulltime                 # Job type filter
&remote=true                       # Remote only
&salary_min=50000                  # Minimum salary
&salary_max=100000                 # Maximum salary
&source=jooble                     # Source filter
&page=1                            # Page number
&per_page=20                       # Items per page
&sort=created_at                   # Sort field
&order=desc                        # Sort order
```

### Swipes & Interactions
```yaml
POST   /swipes                  # Record a swipe
       Body: { opportunity_id, action: "interested" | "skip" | "save" }

GET    /swipes                  # Get swipe history
GET    /swipes/interested       # Get interested jobs
GET    /swipes/saved            # Get saved jobs

DELETE /swipes/:id              # Undo a swipe (within time limit)
```

### Applications
```yaml
GET    /applications            # Get all applications
POST   /applications            # Create application
GET    /applications/:id        # Get application details
PATCH  /applications/:id        # Update application (notes, status)
DELETE /applications/:id        # Withdraw application
```

### Companies
```yaml
GET    /companies               # List companies
GET    /companies/:slug         # Get company profile
GET    /companies/:slug/jobs    # Get company's job listings
```

### Admin / Sync (Protected)
```yaml
POST   /sync/jobs               # Trigger job sync from sources
GET    /sync/status             # Get sync status
GET    /sync/sources            # List available sources
DELETE /sync/stale              # Remove stale jobs
```

---

# 9. UI/UX Architecture

## 9.1 Design System

### Color Palette
```css
/* Brand Colors */
--color-primary-50: #f0fdf4;
--color-primary-100: #dcfce7;
--color-primary-500: #22c55e;   /* Main Green */
--color-primary-600: #16a34a;
--color-primary-700: #15803d;

--color-secondary-500: #6366f1; /* Indigo accent */

/* Semantic Colors */
--color-success: #22c55e;
--color-warning: #f59e0b;
--color-error: #ef4444;
--color-info: #3b82f6;

/* Neutral Colors */
--color-gray-50: #f9fafb;
--color-gray-100: #f3f4f6;
--color-gray-200: #e5e7eb;
--color-gray-500: #6b7280;
--color-gray-800: #1f2937;
--color-gray-900: #111827;

/* Background */
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9fafb;
--color-bg-tertiary: #f3f4f6;
```

### Typography
```css
/* Font Family */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Spacing Scale
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
```

## 9.2 Component Library

### Core Components
```
├── Button          # Primary, Secondary, Ghost, Danger variants
├── Input           # Text, Email, Password, Search
├── Select          # Single, Multi-select
├── Checkbox        # Standard, Toggle switch
├── Card            # Container with variants
├── Modal           # Dialog, Drawer, Bottom Sheet
├── Toast           # Success, Error, Warning, Info
├── Avatar          # Image with fallback
├── Badge           # Status indicators
├── Chip            # Tags, Skills
├── Skeleton        # Loading placeholders
├── Spinner         # Loading indicator
└── Icon            # Lucide icon wrapper
```

### Feature Components
```
├── SwipeCard       # Main swipe interface card
├── JobCard         # Job listing card
├── CompanyCard     # Company info card
├── ProfileCard     # User profile summary
├── FilterBar       # Search filters
├── ActionBar       # Swipe action buttons
├── MatchScore      # Match percentage display
├── SalaryRange     # Salary visualization
└── SkillBadge      # Skill with level indicator
```

## 9.3 Page Layouts

```
┌─────────────────────────────────────────────────────────────────┐
│                      PAGE LAYOUTS                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PUBLIC LAYOUT (Landing, Jobs, Blog)                           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Header (Logo, Nav, CTA)                                 │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │                      Content                            │   │
│  │                                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Footer (Links, Social, Legal)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  APP LAYOUT (Dashboard, Feed, Profile)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Top Bar (Title, Actions)                                │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │                      Content                            │   │
│  │                   (Scrollable)                          │   │
│  │                                                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Bottom Nav (Feed, Search, Saved, Profile)               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  FEED LAYOUT (Swipe Interface)                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Header (Logo, Filters, Profile)                         │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ ┌─────────────────────────────────────────────────────┐ │   │
│  │ │                                                     │ │   │
│  │ │                   Swipe Card                        │ │   │
│  │ │                   (Centered)                        │ │   │
│  │ │                                                     │ │   │
│  │ └─────────────────────────────────────────────────────┘ │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │         [✕]        [★]        [♥]                       │   │
│  │        Skip       Save     Interested                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

# 10. Security Architecture

## 10.1 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  EMAIL/PASSWORD LOGIN                                          │
│  ─────────────────────                                         │
│                                                                 │
│  Client                    Server                   Database   │
│    │                         │                         │       │
│    │─── POST /auth/login ───►│                         │       │
│    │    {email, password}    │                         │       │
│    │                         │──── Find user ─────────►│       │
│    │                         │◄─── User data ──────────│       │
│    │                         │                         │       │
│    │                         │ Verify password (bcrypt)│       │
│    │                         │ Generate JWT tokens     │       │
│    │                         │                         │       │
│    │◄── {access, refresh} ───│                         │       │
│    │                         │                         │       │
│    │ Store tokens            │                         │       │
│    │ (httpOnly cookies)      │                         │       │
│    │                         │                         │       │
│                                                                 │
│  GOOGLE OAUTH LOGIN                                            │
│  ───────────────────                                           │
│                                                                 │
│  Client          Google           Server           Database    │
│    │                │                │                 │       │
│    │── Redirect ───►│                │                 │       │
│    │◄── Auth Code ──│                │                 │       │
│    │                                 │                 │       │
│    │─── POST /auth/google ──────────►│                 │       │
│    │    {code}                       │                 │       │
│    │                                 │── Verify ──────►│       │
│    │                                 │◄─ User info ────│       │
│    │                                 │                 │       │
│    │                                 │ Find/Create user│       │
│    │                                 │ Generate JWT    │       │
│    │                                 │                 │       │
│    │◄── {access, refresh} ───────────│                 │       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 10.2 JWT Token Structure

```typescript
// Access Token (15 min expiry)
{
  "sub": "user-uuid",           // User ID
  "email": "user@example.com",
  "role": "user",               // user | recruiter | admin
  "iat": 1706745600,            // Issued at
  "exp": 1706746500,            // Expires at
  "type": "access"
}

// Refresh Token (7 days expiry)
{
  "sub": "user-uuid",
  "iat": 1706745600,
  "exp": 1707350400,
  "type": "refresh",
  "jti": "unique-token-id"      // For revocation
}
```

## 10.3 Security Checklist

```
☐ HTTPS only (HSTS enabled)
☐ JWT tokens with short expiry
☐ Refresh token rotation
☐ Password hashing (bcrypt, cost 12)
☐ Rate limiting on auth endpoints
☐ SQL injection prevention (parameterized queries)
☐ XSS prevention (CSP headers, sanitization)
☐ CSRF protection (SameSite cookies)
☐ Input validation (Pydantic/Zod)
☐ Error messages don't leak info
☐ Audit logging for sensitive actions
☐ Dependency vulnerability scanning
☐ Secrets management (env vars, not in code)
```

---

# 11. Infrastructure & DevOps

## 11.1 Environment Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT STRATEGY                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  DEVELOPMENT (Local)                                           │
│  ├── Frontend: localhost:3000 (Next.js dev)                    │
│  ├── Backend:  localhost:8000 (uvicorn --reload)               │
│  ├── Database: localhost:5432 (Docker PostgreSQL)              │
│  └── Cache:    localhost:6379 (Docker Redis)                   │
│                                                                 │
│  STAGING (Preview)                                             │
│  ├── Frontend: staging.opportunitymatch.com (Vercel Preview)   │
│  ├── Backend:  api-staging.opportunitymatch.com (Railway)      │
│  ├── Database: PostgreSQL (Railway, isolated)                  │
│  └── Purpose:  Testing, QA, demos                              │
│                                                                 │
│  PRODUCTION                                                    │
│  ├── Frontend: opportunitymatch.com (Vercel)                   │
│  ├── Backend:  api.opportunitymatch.com (Railway/Render)       │
│  ├── Database: PostgreSQL (Railway/Supabase, backups)          │
│  ├── Cache:    Redis (Upstash)                                 │
│  └── CDN:      Cloudflare                                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 11.2 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml

name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  # ──────────────────────────────────────────
  # LINT & TYPE CHECK
  # ──────────────────────────────────────────
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm type-check

  # ──────────────────────────────────────────
  # TEST
  # ──────────────────────────────────────────
  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install --frozen-lockfile
      - run: pnpm test:coverage

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  test-backend:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - run: pip install -r requirements.txt
      - run: pytest --cov=app tests/

  # ──────────────────────────────────────────
  # BUILD
  # ──────────────────────────────────────────
  build:
    runs-on: ubuntu-latest
    needs: [test, test-backend]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4

      - run: pnpm install --frozen-lockfile
      - run: pnpm build

      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: .next

  # ──────────────────────────────────────────
  # DEPLOY (Production - main branch only)
  # ──────────────────────────────────────────
  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      # Deploy to Vercel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 11.3 Docker Configuration

```yaml
# docker-compose.yml

version: '3.8'

services:
  # ──────────────────────────────────────────
  # FRONTEND (Next.js)
  # ──────────────────────────────────────────
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:8000
    depends_on:
      - api

  # ──────────────────────────────────────────
  # BACKEND (FastAPI)
  # ──────────────────────────────────────────
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/opportunitymatch
      - REDIS_URL=redis://redis:6379
      - SECRET_KEY=${SECRET_KEY}
      - JOOBLE_API_KEY=${JOOBLE_API_KEY}
      - ADZUNA_APP_ID=${ADZUNA_APP_ID}
      - ADZUNA_APP_KEY=${ADZUNA_APP_KEY}
    depends_on:
      - db
      - redis

  # ──────────────────────────────────────────
  # DATABASE (PostgreSQL)
  # ──────────────────────────────────────────
  db:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=opportunitymatch
    volumes:
      - postgres_data:/var/lib/postgresql/data

  # ──────────────────────────────────────────
  # CACHE (Redis)
  # ──────────────────────────────────────────
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  # ──────────────────────────────────────────
  # WORKER (Celery)
  # ──────────────────────────────────────────
  worker:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    command: celery -A app.worker worker --loglevel=info
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/opportunitymatch
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis

volumes:
  postgres_data:
  redis_data:
```

---

# 12. Implementation Roadmap

## 12.1 Phase Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION PHASES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: Foundation (Weeks 1-2)                               │
│  ════════════════════════════════                               │
│  • Project setup (Next.js, FastAPI, PostgreSQL)                │
│  • Design system & UI components                                │
│  • Authentication (email + Google)                              │
│  • Basic database schema                                        │
│                                                                 │
│  PHASE 2: Core Features (Weeks 3-4)                            │
│  ═══════════════════════════════════                           │
│  • Job ingestion (Jooble, Adzuna)                              │
│  • Swipe feed interface                                        │
│  • User profiles                                               │
│  • Saved jobs & applications                                   │
│                                                                 │
│  PHASE 3: Public Pages & SEO (Weeks 5-6)                       │
│  ════════════════════════════════════════                       │
│  • Landing page                                                │
│  • Job listings (SSR)                                          │
│  • Job detail (SSR + JSON-LD)                                  │
│  • Company profiles                                            │
│                                                                 │
│  PHASE 4: Polish & Launch (Weeks 7-8)                          │
│  ═════════════════════════════════════                         │
│  • Performance optimization                                    │
│  • Testing & QA                                                │
│  • Deployment pipeline                                         │
│  • Beta launch                                                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 12.2 Detailed Sprint Plan

### Sprint 1 (Week 1): Project Foundation
```
Day 1-2:
  ☐ Initialize Next.js 14 project with App Router
  ☐ Initialize FastAPI project structure
  ☐ Setup PostgreSQL with Docker
  ☐ Configure ESLint, Prettier, TypeScript

Day 3-4:
  ☐ Create design tokens (colors, typography, spacing)
  ☐ Build core UI components (Button, Input, Card)
  ☐ Setup Tailwind CSS configuration
  ☐ Create component documentation (Storybook optional)

Day 5:
  ☐ Setup database models (SQLAlchemy)
  ☐ Create initial migration
  ☐ Setup Alembic for migrations
  ☐ Test database connection
```

### Sprint 2 (Week 2): Authentication
```
Day 1-2:
  ☐ Implement user registration endpoint
  ☐ Implement login endpoint (JWT)
  ☐ Setup password hashing (bcrypt)
  ☐ Create auth middleware

Day 3-4:
  ☐ Implement Google OAuth
  ☐ Setup NextAuth.js
  ☐ Create login/signup pages
  ☐ Implement token refresh

Day 5:
  ☐ Protected routes (frontend)
  ☐ Auth context/hooks
  ☐ Testing auth flow
  ☐ Error handling
```

### Sprint 3 (Week 3): Job Ingestion
```
Day 1-2:
  ☐ Create opportunity model & schema
  ☐ Implement Jooble adapter
  ☐ Implement Adzuna adapter
  ☐ Create adapter registry

Day 3-4:
  ☐ Build sync service
  ☐ Create sync API endpoints
  ☐ Implement deduplication logic
  ☐ Add stale job handling

Day 5:
  ☐ Schedule automated sync (Celery)
  ☐ Sync monitoring & logging
  ☐ Testing with real APIs
  ☐ Documentation
```

### Sprint 4 (Week 4): Swipe Feed
```
Day 1-2:
  ☐ Create SwipeCard component
  ☐ Implement swipe gestures (Framer Motion)
  ☐ Build action bar (skip, save, interested)
  ☐ Card animations & transitions

Day 3-4:
  ☐ Feed data fetching
  ☐ Implement swipe API endpoints
  ☐ Prefetching & caching
  ☐ Loading & error states

Day 5:
  ☐ Match score display
  ☐ Job detail modal
  ☐ Empty state handling
  ☐ Testing & polish
```

### Sprint 5-6 (Weeks 5-6): Public Pages
```
Week 5:
  ☐ Landing page (hero, features, CTA)
  ☐ Jobs listing page (SSR)
  ☐ Filters & search
  ☐ Pagination

Week 6:
  ☐ Job detail page (SSR)
  ☐ JSON-LD structured data
  ☐ Company profiles
  ☐ SEO meta tags & sitemap
```

### Sprint 7-8 (Weeks 7-8): Launch Prep
```
Week 7:
  ☐ Performance audit (Lighthouse)
  ☐ Core Web Vitals optimization
  ☐ Accessibility audit
  ☐ Cross-browser testing

Week 8:
  ☐ CI/CD pipeline finalization
  ☐ Production deployment
  ☐ Monitoring setup (Sentry, analytics)
  ☐ Beta launch & feedback
```

---

# 13. Risk Assessment

## 13.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Job API rate limits | Medium | High | Implement caching, multiple providers |
| Database performance at scale | Medium | High | Indexing, query optimization, read replicas |
| Third-party API changes | Medium | Medium | Adapter pattern, version pinning |
| Security vulnerabilities | Low | Critical | Security audits, dependency scanning |
| Mobile performance issues | Medium | Medium | Code splitting, lazy loading |

## 13.2 Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | Critical | Marketing, partnerships with universities |
| Job data quality issues | Medium | High | Validation, user reporting |
| Competitor features | High | Medium | Focus on UX, unique matching |
| Legal/compliance issues | Low | High | Legal review, GDPR compliance |

## 13.3 Contingency Plans

1. **If Jooble/Adzuna APIs fail:**
   - Fallback to cached data
   - Add alternative providers (RemoteOK, Indeed scraping)
   - Manual job submission by recruiters

2. **If user growth is slow:**
   - Partner with university career centers
   - Influencer marketing on TikTok/LinkedIn
   - Referral program with incentives

3. **If performance degrades:**
   - Implement aggressive caching (Redis)
   - Database read replicas
   - CDN for static assets
   - Consider serverless functions for spikes

---

# 14. Appendices

## 14.1 Glossary

| Term | Definition |
|------|------------|
| SSR | Server-Side Rendering - HTML generated on server per request |
| SSG | Static Site Generation - HTML generated at build time |
| ISR | Incremental Static Regeneration - SSG with periodic updates |
| CSR | Client-Side Rendering - HTML generated in browser |
| JWT | JSON Web Token - Stateless authentication token |
| ORM | Object-Relational Mapping - Database abstraction layer |

## 14.2 Reference Links

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Jooble API](https://jooble.org/api/about)
- [Adzuna API](https://developer.adzuna.com/)

## 14.3 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2026 | Team | Initial draft |
| 2.0 | Jan 2026 | Team | Added SSR architecture, detailed roadmap |

---

**Document Status:** Living Document
**Next Review:** After Phase 1 completion
**Owner:** Engineering Team

---

# 15. Current Implementation Reality (as of 2026-01-31)

> **IMPORTANT:** The architecture described in sections 6-11 above is the aspirational/planned
> architecture. The actual implementation has diverged significantly. This section documents
> what is actually built and running.

## 15.1 Actual Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    ACTUAL ARCHITECTURE (Jan 2026)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────┐          ┌─────────────────────────┐          │
│  │  mobile-app (PRIMARY)   │          │ tender-frontend          │          │
│  │  React + Vite           │          │ React + TypeScript       │          │
│  │  PWA-style web app      │          │ + Tailwind + Zustand     │          │
│  └───────────┬─────────────┘          └──────────┬──────────────┘          │
│              │                                   │                          │
│              ▼                                   ▼                          │
│  ┌─────────────────────────┐          ┌─────────────────────────┐          │
│  │      SUPABASE           │          │    FastAPI (Python)      │          │
│  │  ┌─────────────────┐   │          │    localhost:8000        │          │
│  │  │ PostgreSQL      │   │          └──────────┬──────────────┘          │
│  │  │ (profiles,      │   │                     │                          │
│  │  │  opportunities, │   │                     ▼                          │
│  │  │  swipes,        │   │          ┌─────────────────────────┐          │
│  │  │  conversations) │   │          │    SQLite (local)        │          │
│  │  ├─────────────────┤   │          │    tender.db             │          │
│  │  │ Auth (Supabase) │   │          └─────────────────────────┘          │
│  │  ├─────────────────┤   │                                                │
│  │  │ Storage         │   │          ════════════════════════════          │
│  │  │ (resumes,       │   │           These two systems are               │
│  │  │  transcripts)   │   │           COMPLETELY DISCONNECTED             │
│  │  └─────────────────┘   │          ════════════════════════════          │
│  └─────────────────────────┘                                                │
│                                                                             │
│  MISSING from aspirational architecture:                                    │
│  ✗ Next.js (using Vite instead)                                            │
│  ✗ Redis (no caching layer)                                                │
│  ✗ Celery (no background workers)                                          │
│  ✗ S3 (using Supabase Storage instead)                                     │
│  ✗ API Gateway (direct client-to-Supabase)                                 │
│  ✗ React Native (web-based PWA instead)                                    │
│  ✗ Docker/CI/CD pipeline                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 15.2 Actual Tech Stack

| Layer | Planned (SRS) | Actual (Built) |
|-------|--------------|----------------|
| **Frontend** | Next.js 14 (SSR) | React + Vite (CSR only) |
| **Mobile** | React Native / Expo | PWA-style web app (mobile-app/) |
| **Backend** | FastAPI microservices | Supabase (direct client access) + FastAPI (disconnected) |
| **Database** | PostgreSQL (self-hosted) | Supabase PostgreSQL (hosted) + SQLite (FastAPI) |
| **Auth** | JWT + OAuth2 (custom) | Supabase Auth (@supabase/supabase-js) |
| **File Storage** | S3 / Cloudflare R2 | Supabase Storage (buckets with RLS) |
| **Cache** | Redis | None |
| **Task Queue** | Celery + Redis | None |
| **Search** | PostgreSQL FTS | Basic Supabase queries |
| **CI/CD** | GitHub Actions | None (manual deployment) |
| **Monitoring** | Sentry + Axiom | Console.error only |

## 15.3 Supabase Schema (Actual)

**Tables:** `profiles`, `opportunities`, `swipes`, `conversations`, `conversation_events`
**Triggers:** `handle_interested_swipe` (auto-create conversation on swipe right)
**Storage Buckets:** `resumes`, `transcripts` (with user-scoped RLS)
**Auth:** Supabase Auth with email/password

**Key Profile Columns (23 total):**
`full_name`, `bio`, `phone`, `age`, `location`, `resume_url`, `resume_filename`,
`cv_filename`, `transcript_url`, `transcript_filename`, `skills` (JSONB),
`work_experiences` (JSONB), `education_entries` (JSONB), `projects` (JSONB),
`languages` (JSONB), `awards` (JSONB), `interests` (TEXT), `linkedin_url`,
`github_url`, `portfolio_url`, `screening_completed`, `screening_completed_at`,
`screening` (JSONB), `preferred_countries` (JSONB), `consent_share_documents`

## 15.4 What's Working (End-to-End)

- [x] User signup/login via Supabase Auth
- [x] Screening wizard (5 steps including inline document upload)
- [x] Feed with swipe interface (Tinder-style cards)
- [x] Swipe actions (interested, skip, save)
- [x] Auto-create conversation on swipe right (DB trigger)
- [x] Inbox with conversation list + timeline events
- [x] Profile editing (personal info, resume tab, files tab)
- [x] File upload to Supabase Storage (resume + transcript)
- [x] Bottom nav with active state indicators
- [x] Error boundary + protected routes

## 15.5 Architecture Decision Needed

**The mobile-app and FastAPI backend are completely independent systems.**
The mobile-app talks directly to Supabase. The FastAPI backend has its own
SQLite database with overlapping models but no shared data.

**Options:**
1. **Supabase-only:** Drop FastAPI, use Supabase Edge Functions for server logic
2. **FastAPI + Supabase DB:** Point FastAPI at Supabase PostgreSQL, use it as API layer
3. **Keep both:** FastAPI for admin/parsing/AI, Supabase for mobile-app real-time
4. **Migrate to FastAPI:** Move mobile-app to use FastAPI endpoints, drop direct Supabase

**Current recommendation:** Option 3 — keep FastAPI for backend-heavy features (parsing,
AI matching, bulk import) and Supabase for real-time mobile-app features.

---

# Quick Start for Claude Code

```
IMPORTANT: Read progress.txt first to understand what's done and what's next.

For mobile-app work (primary):
1. Read mobile-app/supabase/schema.sql to understand the database
2. Read mobile-app/src/lib/supabase.js for the Supabase client
3. All pages are in mobile-app/src/pages/
4. UI components in mobile-app/src/components/ui/

For FastAPI work:
1. Read app/main.py for router registrations
2. Models in app/models/, schemas in app/schemas/
3. API endpoints in app/api/

Document workflow: PRD → progress.txt → WORK_LOG.md → CLAUDE.md → SRS-Architecture.md
```

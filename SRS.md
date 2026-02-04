# Tender — Software Requirements Specification (SRS)

**Document Version:** 1.0  
**Prepared by:** Technical Software Manager  
**Date:** 2026-01-20

## 1. Introduction

### 1.1 Purpose
Defines software requirements for “Tender”, a Tinder-style opportunity matching platform for students and graduates. Audience: engineering, QA, product, security, and stakeholders.

### 1.2 Scope
Web-first (Vite + React) client with FastAPI backend. MVP supports secure auth, document vault, resume/transcript parsing → profile auto-fill, screening gate, swipe feed with full details, matching, applications, conversations timeline, and consistent purple UI theme. Dev DB: SQLite; production: PostgreSQL. Dev storage: local uploads; production: cloud.

### 1.3 Definitions
- SRS: Software Requirements Specification
- CV/Resume, Transcript, PII, JWT, OWASP, MVP
- Feed: swipe-based opportunity discovery interface

## 2. Overall Description

### 2.1 Product Perspective
Tinder-like UX for careers: swipe cards, like/save/apply after consent. Modular architecture: React frontend, FastAPI API, ORM, file storage.

### 2.2 Product Functions
- Auth (signup/login/session)
- Upload & manage documents (resume/transcript vault)
- Parse documents to auto-fill profile
- Screening questions before feed
- Opportunity feed with full detail
- Matching engine
- Swipe actions (like/dislike/save)
- Applications tracker
- Conversations/status timeline
- Admin: manage opportunities, applicants (later company role)

### 2.3 User Classes
- Candidate: upload docs, swipe, apply, view messages
- Admin: create/manage opportunities, view/respond to applicants
- Company/Org (later): post opportunities, respond

### 2.4 Operating Environment
Browser (mobile-first); FastAPI on Linux/macOS; SQLite→PostgreSQL; local uploads→cloud.

### 2.5 Constraints
No public exposure of resumes/transcripts; documents only shared with user consent; OWASP-aligned; no secrets in frontend.

## 3. System Features & Requirements

### 3.1 Authentication & Account Management
**Functional**: /auth/signup, /auth/login, session persistence, /auth/me, logout (if refresh).  
**Security**: bcrypt or stronger hashing; rate-limit login/signup; 15m JWT expiry; generic errors to avoid user enumeration.

### 3.2 Resume/Transcript Upload (Document Vault)
**Functional**: upload resume+transcript; list; replace/delete; reuse files.  
**File handling**: reject unsupported types; max size (default 5MB).  
**Security**: private per user, randomized filenames, no resume content in logs.

### 3.3 Parsing & Profile Auto-Fill
Extract structured data (education, work, projects, skills, languages, awards, certifications, interests, volunteering/leadership) and populate profile; user can edit before saving; store as JSON.

### 3.4 Screening (Eligibility Gate)
Collect age, location, preferred countries, work auth, availability; require resume before feed; transcript for scholarships; store consent for document sharing. Block feed/apply until complete.

### 3.5 Opportunity Feed
Each card shows: title, company, category (job/internship/scholarship/part-time/full-time), education/entry level, work arrangement, compensation/stipend, location, eligibility rules, deadline, full description visible initially. Exclude disliked items; support category filter; load immediately post onboarding.

### 3.6 Matching Engine
Score opportunities by overlap of user skills vs required skills; include transcript/education where available; run after onboarding.

### 3.7 Swipe Actions
Like/dislike/save; like prepares application; dislike removes from future feed; save to Saved list.

### 3.8 Applications Module (Enhanced Application Tracking)
Create application on like/apply including resume, transcript (if required), profile summary, screening answers. Track statuses: Applied → Viewed → Shortlisted → Interview → Offer / Rejected.

**Application Tracking Screen Requirements:**
- **Header**: Back button, title ("Application Details"), overflow menu (Archive, Share)
- **Status Card**: Status badge (color-coded), job title (bold), company name, company logo
- **Meta Actions**: Applied date, "Job Description >" link, "View Credentials >" link (if available)
- **Timeline**: Date-grouped events with vertical connector line, milestone icons, timestamps
- **Event Types**: swiped_right, application_started, questions_answered, documents_attached, submitted, viewed_by_employer, interview_scheduled, offer_received, rejected, etc.
- **Qualification Check**: Show user's match score against job requirements
- **Application Details**: My Information section, Documents Attached section

### 3.9 Conversations Module
Show responses per application; MVP = status timeline + admin messages; future real chat.

### 3.10 UI & Branding
Global purple theme; loading skeletons; empty/error states; micro-animations; toast for save/apply.

## 4. External Interface Requirements
- API groups: /auth, /users, /documents, /profile, /screening, /opportunities, /feed, /swipe, /applications, /conversations.
- DB: SQLAlchemy ORM, migrations (recommend Alembic).
- File storage: local `/uploads/{user_id}/resumes|transcripts/` for dev; cloud later.

## 5. Non-Functional Requirements
- Performance: feed ≤500ms locally; uploads ≤5s typical.
- Reliability: graceful recovery if parsing fails; no doc loss.
- Maintainability: modular routers, service layer, tests for critical paths.
- Security: OWASP-driven, strict access control, prevent PII leaks.

## 6. Acceptance Criteria (MVP)
- User can signup/login.
- Resume upload → profile auto-filled.
- Screening completed before feed.
- Feed shows full job details and match results instantly.
- Swipe/save/apply works.
- Applications list with status.
- Conversations timeline present.
- Purple theme consistent; skeleton/empty/error states; toasts.
- Privacy and access controls enforced; no secrets in frontend.

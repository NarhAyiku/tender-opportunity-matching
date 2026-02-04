# Tender – Product Requirements (MVP Extensions)
_Date: 2026-01-20 | Owners: Product & Security_

## Scope
Extend Tender (Tinder-style opportunity matching) with document parsing, vault, richer opportunities, pre-access screening, conversations, and a consistent purple theme. No backend changes are implied here unless specified; this doc drives subsequent design/implementation tasks.

---
## A) Resume + Transcript Parsing (Deep)
- Inputs: Resume/CV (PDF/DOCX), Transcript (PDF).
- Output → structured profile fields: Education, Work Experience, Projects, Skills, Languages, Awards & Honors, Certifications, Interests, Volunteering/Leadership, Publications (optional).
- Behavior:
  - On upload, parse → prefill profile draft.
  - User reviews/edits, then confirms to persist.
  - Store parsed snapshot + confidence per section; allow rollback to previous parse.
  - Flag low-confidence fields for review.

## B) Document Vault (“File Session”)
- Per-user vault items: resumes, transcripts, cover letters (optional).
- Each item: filename, type, version, uploaded_at, size, mime, storage_url, hash, is_default, deleted_at (soft delete).
- Upload once, reuse for applications; choose default per type.
- Secure, time-limited download links; per-user authorization on every access.

## C) Opportunity Data (Feed Completeness)
Each opportunity must include and display (no hidden click):
- Category: Job / Internship / Scholarship / Part-time / Full-time
- Education requirements
- Work arrangement: Remote / Hybrid / On-site
- Compensation/stipend (if available)
- Location
- Rules/requirements: eligibility, deadlines, visa, etc.
- Full description visible immediately in feed.

## D) Pre-Assessment Screening (Before Feed Access)
Collect before showing feed:
- Age
- Location
- Preferred countries to work in
- Resume + Transcript uploaded (at least one of each)
- Consent to share documents on application (auditable)
Behavior: block feed until complete; show checklist; allow edits later; store screening_completed flag/timestamp.

## E) Conversations / Responses
- “Conversations” section per user:
  - Thread per application/opportunity.
  - Timeline events: applied, viewed, shortlisted, interview, offer, rejected, hired (initially read-only, system-generated).
  - Types: jobs, internships, scholarships, interviews.
  - (Future) messaging with recruiters.

## F) Branding / Theme
- Apply consistent purple theme tokens (primary, hover, surfaces, borders, focus).

---
## Data Model (add/extend tables)
- **users**: age (int), location (string), preferred_countries (string[]), screening_completed (bool), screening_completed_at (datetime), consent_share_documents (bool).
- **documents**: id, user_id, type (resume/transcript/cover_letter), filename, mime_type, size_bytes, storage_url, sha256_hash, is_default (bool), version (int), uploaded_at, deleted_at.
- **parsed_documents**: id, document_id, user_id, source_type, raw_text, parsed_json, confidence_scores, status (succeeded/failed/partial), error_message, created_at.
- **profiles** (json fields): education, work_experience, projects, skills, languages, awards, certifications, interests, volunteering, publications, last_parsed_document_id.
- **opportunities**: category, education_requirements, work_arrangement, compensation (json/text), rules_requirements (json), location, full_description (text).
- **applications**: attached_resume_id, attached_transcript_id, attached_cover_letter_id, conversation_id.
- **conversations**: id, user_id, application_id, opportunity_id, type, last_message_at, unread_count, created_at.
- **conversation_events**: id, conversation_id, kind (status_update/message/system), status, message, created_at, actor (system/recruiter/user).

---
## API Endpoints (new/updated)
### Documents & Parsing
- POST /files/resume | /files/transcript | /files/cover-letter (upload)
- GET /files (list vault items)
- PATCH /files/:id (set default, soft delete/restore)
- POST /files/:id/parse (trigger parse)
- GET /files/:id/parse/:parse_id (status/result)
- POST /profile/apply-parsed (body: parsed_document_id, merge/overwrite)

### Screening
- GET /screening/status
- POST /screening/complete (age, location, preferred_countries[], consent, resume_id, transcript_id)

### Opportunities
- GET /match/feed (must include full_description, category, education_requirements, work_arrangement, compensation, rules_requirements, location)
- POST /opportunities/bulk (enforce required fields) [admin]

### Applications
- POST /swipes (like) accepts attached doc IDs (defaults if omitted)
- POST /applications/:id/attach (update attachments)

### Conversations
- GET /conversations
- GET /conversations/:id
- GET /conversations/:id/events
- (Future) POST /conversations/:id/messages

---
## Threat Model (OWASP alignment)
- Broken Access Control (A01): Signed, time-limited URLs; per-user checks on documents/parses/conversations.
- Cryptographic Failures (A02): No public buckets; TLS; hashed files; signed downloads.
- Injection/XSS (A03): Sanitize parsed text before render; store raw separately.
- DoS/SSRF (A10): Upload/parse rate limits, size/type validation, optional AV scan.
- Logging/Monitoring (A09): Audit consent, document access, parse failures.
- Input validation: enums for categories/types; reject unknowns.

---
## Implementation Plan (Milestones)
1) Data & API plumbing: migrations for new columns/tables; vault & screening endpoints; feed returns full fields.
2) Parsing pipeline: parser worker/service; store parsed_documents; apply-to-profile endpoint; confidence handling.
3) Screening gate: UI/BE gating before feed; checklist; persist answers; defaults for attachments on apply.
4) Conversations (read-only): models, endpoints, timeline UI; hook application status changes to events.
5) Vault UX & attachments: manage docs, set default, soft delete/restore; app flow doc picker.
6) Theming: apply purple tokens across UI; ensure feed shows full description and new metadata.
7) **Application Tracking (Enhanced)**: Full application tracking screen with:
   - Status badge with color-coded indicators (submitted, in_progress, interview, offer, rejected)
   - Job info card (title, company, logo)
   - Meta actions row (applied date, job description link, portal credentials link)
   - Timeline with date-grouped events (vertical connector line, milestone icons, timestamps)
   - Event types: swiped_right, application_started, questions_answered, submitted, viewed_by_employer, interview_scheduled, offer_received, rejected, etc.
   - Qualification check section (match score, eligibility criteria)
   - Application details section (my information, documents attached)
   - Reusable UI components (StatusBadge, ActionRow, Timeline, TimelineItem, SectionCard)
   - (AI Enhancement) Timeline summary generation, next step suggestions

Non-functional
- No secrets in frontend.
- Strict auth on all file/parse endpoints.
- Performance: pagination on conversations and files; async parsing jobs.

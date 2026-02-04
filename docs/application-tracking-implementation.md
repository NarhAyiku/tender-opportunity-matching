# Application Tracking Feature Implementation Plan
# Created: 2026-02-04
# Project: TENDER Mobile App
# Stack: React + Vite + Supabase (mobile-app)

================================================================================
## PHASE 0: SUB-AGENTS DEFINITION
================================================================================

### 🎨 UI/DESIGN SYSTEM AGENT
**Responsibility**: Define visual specs, component library, design tokens
**Outputs**:
- Component tree and hierarchy
- Design token definitions (spacing, colors, typography)
- Figma-to-code mapping
- Accessibility requirements (WCAG 2.1 AA)

### 💻 FRONTEND IMPLEMENTATION AGENT
**Responsibility**: React components, state management, routing
**Outputs**:
- Component implementations (.jsx files)
- State management hooks
- Route configurations
- Integration with existing components

### 🔌 DATA MODEL/API AGENT
**Responsibility**: Database schema, API endpoints, mock data
**Outputs**:
- Supabase table schemas (SQL migrations)
- TypeScript/JavaScript type definitions
- Mock data generators
- RLS policies

### 🧪 QA/EDGE CASE AGENT
**Responsibility**: Test cases, error handling, accessibility testing
**Outputs**:
- Test case matrix
- Edge case documentation
- Performance benchmarks
- Regression test list

### 🤖 AI SYSTEMS AGENT (Optional)
**Responsibility**: AI-powered enhancements
**Outputs**:
- Timeline summarization prompts
- Next-step prediction logic
- Auto-categorization of events

================================================================================
## PHASE 1: UI SPECIFICATION (FROM SORCE REFERENCE)
================================================================================

### Component Tree Structure

```
ApplicationTrackingScreen/
├── ScreenHeader/
│   ├── BackButton (top-left, navigates back)
│   ├── Title ("Application Details" or brand name)
│   └── OverflowMenu (top-right, options like "Archive", "Share")
│
├── StatusJobCard/
│   ├── StatusIndicator/
│   │   ├── StatusDot (color-coded: green=submitted, blue=in-progress, etc.)
│   │   └── StatusLabel ("SUBMITTED", "IN PROGRESS", etc.)
│   ├── JobInfo/
│   │   ├── JobTitle (large, bold text)
│   │   └── CompanyName (smaller, muted text)
│   └── CompanyLogo (circular avatar, right-aligned)
│
├── MetaActionsRow/
│   ├── AppliedDate ("Applied on Jan 13, 2026")
│   ├── ActionLink ("Job Description >")
│   └── ActionLink ("View Credentials >")
│
├── TimelineSection/
│   ├── TimelineCard/
│   │   ├── DateHeader ("JANUARY 13")
│   │   └── TimelineItems[]/
│   │       ├── TimelineItem/
│   │       │   ├── TimelineConnector (vertical green line + check icon)
│   │       │   ├── EventLabel ("You swiped right")
│   │       │   └── EventTime ("15:45")
│   │       └── ...more items grouped by date
│   └── ...more date groups
│
└── ApplicationDetailsSection/
    ├── SectionCard ("My Information")
    │   └── FormFields[] (pre-filled from profile)
    ├── SectionCard ("Documents Attached")
    │   └── DocumentList[] (resume, transcript, etc.)
    └── SectionCard ("Additional Questions")
        └── QuestionAnswers[]
```

### Component Specifications

#### 1. ScreenHeader
```
Props:
  - title: string
  - onBack: () => void
  - menuItems?: { label: string, onClick: () => void }[]

Style:
  - Height: 56px
  - Background: white
  - Border-bottom: 1px solid --color-border
  - BackButton: size 24px, icon ChevronLeft
  - Title: font-weight 600, size 18px, color --color-text-primary
```

#### 2. StatusBadge
```
Props:
  - status: 'submitted' | 'in_progress' | 'interview' | 'offer' | 'rejected'
  - size?: 'sm' | 'md'

Style:
  - submitted: green-500 dot, green-100 bg, green-700 text
  - in_progress: blue-500 dot, blue-100 bg, blue-700 text
  - interview: purple-500 dot, purple-100 bg, purple-700 text
  - offer: emerald-500 dot, emerald-100 bg, emerald-700 text
  - rejected: red-500 dot, red-100 bg, red-700 text
```

#### 3. ActionRow
```
Props:
  - icon?: LucideIcon
  - label: string
  - onClick: () => void
  - chevron?: boolean (default true)

Style:
  - Padding: 12px 16px
  - Background: white
  - Border-radius: 12px
  - Font: 14px, font-weight 500
  - Icon: 16px, color --color-text-secondary
  - Chevron: size 16px, color --color-text-tertiary
```

#### 4. Timeline
```
Props:
  - events: ApplicationEvent[]
  - groupByDate?: boolean (default true)

Logic:
  - Group events by date (YYYY-MM-DD)
  - Sort events DESC within each date
  - Render DateHeader for each group
  - Connect items with vertical line
```

#### 5. TimelineItem
```
Props:
  - event: ApplicationEvent
  - isFirst: boolean
  - isLast: boolean
  - isMilestone: boolean

Style:
  - Connector line: 2px wide, --color-primary (vertical)
  - Milestone icon: 20px circle with check
  - Non-milestone: 8px dot
  - Label: font-weight 500, 14px
  - Time: 12px, color --color-text-tertiary
```

#### 6. SectionCard
```
Props:
  - title: string
  - children: ReactNode
  - collapsible?: boolean

Style:
  - Background: white
  - Border-radius: 16px
  - Padding: 16px
  - Title: font-weight 600, 16px, margin-bottom 12px
  - Shadow: 0 1px 3px rgba(0,0,0,0.08)
```

================================================================================
## PHASE 2: DATA MODEL + STORAGE
================================================================================

### Supabase Tables

#### applications (extend existing or create)
```sql
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id),
    status TEXT NOT NULL DEFAULT 'submitted' 
        CHECK (status IN ('draft', 'submitted', 'in_progress', 'interview', 'offer', 'rejected', 'withdrawn')),
    applied_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Attached documents (references to documents table)
    resume_id UUID REFERENCES documents(id),
    transcript_id UUID REFERENCES documents(id),
    cover_letter_id UUID REFERENCES documents(id),
    
    -- Portal credentials (encrypted in production)
    portal_url TEXT,
    portal_username TEXT,
    portal_password_encrypted TEXT,
    
    -- Additional application data
    answers JSONB DEFAULT '[]',
    notes TEXT,
    
    UNIQUE(user_id, opportunity_id)
);

-- RLS Policies
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
```

#### application_events
```sql
CREATE TABLE IF NOT EXISTS application_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL 
        CHECK (event_type IN (
            'swiped_right',
            'application_started',
            'questions_requested',
            'questions_answered',
            'documents_attached',
            'submitted',
            'viewed_by_employer',
            'interview_scheduled',
            'interview_completed',
            'offer_received',
            'offer_accepted',
            'offer_declined',
            'rejected',
            'withdrawn',
            'follow_up_sent',
            'note_added'
        )),
    label TEXT NOT NULL,
    description TEXT,
    timestamp TIMESTAMPTZ DEFAULT now(),
    metadata JSONB DEFAULT '{}',
    is_milestone BOOLEAN DEFAULT false,
    is_user_action BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policies
ALTER TABLE application_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view events for own applications"
    ON application_events FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.id = application_events.application_id 
            AND applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert events for own applications"
    ON application_events FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications 
            WHERE applications.id = application_events.application_id 
            AND applications.user_id = auth.uid()
        )
    );

-- Indexes
CREATE INDEX idx_application_events_application_id ON application_events(application_id);
CREATE INDEX idx_application_events_timestamp ON application_events(timestamp DESC);
```

### JavaScript Types (mobile-app/src/types/application.js)

```javascript
/**
 * @typedef {'draft' | 'submitted' | 'in_progress' | 'interview' | 'offer' | 'rejected' | 'withdrawn'} ApplicationStatus
 */

/**
 * @typedef {'swiped_right' | 'application_started' | 'questions_requested' | 'questions_answered' | 'documents_attached' | 'submitted' | 'viewed_by_employer' | 'interview_scheduled' | 'interview_completed' | 'offer_received' | 'offer_accepted' | 'offer_declined' | 'rejected' | 'withdrawn' | 'follow_up_sent' | 'note_added'} ApplicationEventType
 */

/**
 * @typedef {Object} Application
 * @property {string} id
 * @property {string} user_id
 * @property {string} opportunity_id
 * @property {ApplicationStatus} status
 * @property {string} applied_at
 * @property {string} updated_at
 * @property {string|null} resume_id
 * @property {string|null} transcript_id
 * @property {string|null} cover_letter_id
 * @property {string|null} portal_url
 * @property {string|null} portal_username
 * @property {string|null} portal_password_encrypted
 * @property {Object[]} answers
 * @property {string|null} notes
 * @property {Object} opportunity - Joined opportunity data
 */

/**
 * @typedef {Object} ApplicationEvent
 * @property {string} id
 * @property {string} application_id
 * @property {ApplicationEventType} event_type
 * @property {string} label
 * @property {string|null} description
 * @property {string} timestamp
 * @property {Object} metadata
 * @property {boolean} is_milestone
 * @property {boolean} is_user_action
 */

/**
 * @typedef {Object} TimelineGroup
 * @property {string} date - YYYY-MM-DD
 * @property {string} displayDate - "JANUARY 13"
 * @property {ApplicationEvent[]} events
 */
```

### Mock Data (mobile-app/src/data/mockApplications.js)

```javascript
export const MOCK_APPLICATIONS = [
  {
    id: 'app-001',
    user_id: 'user-001',
    opportunity_id: 'opp-001',
    status: 'submitted',
    applied_at: '2026-01-13T15:30:00Z',
    updated_at: '2026-01-13T16:02:00Z',
    opportunity: {
      id: 'opp-001',
      title: 'Machine Learning Engineering Intern - 2026',
      company_name: 'Nvidia Usa',
      company_logo: 'https://logo.clearbit.com/nvidia.com',
      location: 'Santa Clara, CA',
      opportunity_type: 'internship',
    },
    events: [
      {
        id: 'evt-001',
        event_type: 'swiped_right',
        label: 'You swiped right',
        timestamp: '2026-01-13T15:30:00Z',
        is_milestone: true,
      },
      {
        id: 'evt-002',
        event_type: 'application_started',
        label: 'Started application',
        timestamp: '2026-01-13T15:35:00Z',
        is_milestone: false,
      },
      {
        id: 'evt-003',
        event_type: 'questions_answered',
        label: 'Answered screening questions',
        timestamp: '2026-01-13T15:50:00Z',
        is_milestone: false,
      },
      {
        id: 'evt-004',
        event_type: 'documents_attached',
        label: 'Attached resume and transcript',
        timestamp: '2026-01-13T15:55:00Z',
        is_milestone: false,
      },
      {
        id: 'evt-005',
        event_type: 'submitted',
        label: 'Application submitted',
        timestamp: '2026-01-13T16:02:00Z',
        is_milestone: true,
      },
    ],
  },
];

export const EVENT_TYPE_CONFIG = {
  swiped_right: { icon: 'Heart', color: 'purple', label: 'You swiped right' },
  application_started: { icon: 'Play', color: 'blue', label: 'Started application' },
  questions_requested: { icon: 'HelpCircle', color: 'amber', label: 'Questions requested' },
  questions_answered: { icon: 'CheckSquare', color: 'green', label: 'Answered questions' },
  documents_attached: { icon: 'Paperclip', color: 'slate', label: 'Documents attached' },
  submitted: { icon: 'Send', color: 'purple', label: 'Application submitted' },
  viewed_by_employer: { icon: 'Eye', color: 'blue', label: 'Viewed by employer' },
  interview_scheduled: { icon: 'Calendar', color: 'purple', label: 'Interview scheduled' },
  interview_completed: { icon: 'Video', color: 'green', label: 'Interview completed' },
  offer_received: { icon: 'Gift', color: 'emerald', label: 'Offer received!' },
  offer_accepted: { icon: 'CheckCircle', color: 'emerald', label: 'Offer accepted' },
  offer_declined: { icon: 'XCircle', color: 'red', label: 'Offer declined' },
  rejected: { icon: 'X', color: 'red', label: 'Application rejected' },
  withdrawn: { icon: 'Undo', color: 'slate', label: 'Application withdrawn' },
  follow_up_sent: { icon: 'Mail', color: 'blue', label: 'Follow-up sent' },
  note_added: { icon: 'FileText', color: 'slate', label: 'Note added' },
};

export const STATUS_CONFIG = {
  draft: { dot: 'slate', bg: 'slate-100', text: 'slate-700', label: 'DRAFT' },
  submitted: { dot: 'green-500', bg: 'green-100', text: 'green-700', label: 'SUBMITTED' },
  in_progress: { dot: 'blue-500', bg: 'blue-100', text: 'blue-700', label: 'IN PROGRESS' },
  interview: { dot: 'purple-500', bg: 'purple-100', text: 'purple-700', label: 'INTERVIEW' },
  offer: { dot: 'emerald-500', bg: 'emerald-100', text: 'emerald-700', label: 'OFFER' },
  rejected: { dot: 'red-500', bg: 'red-100', text: 'red-700', label: 'REJECTED' },
  withdrawn: { dot: 'slate-500', bg: 'slate-100', text: 'slate-700', label: 'WITHDRAWN' },
};
```

================================================================================
## PHASE 3: IMPLEMENTATION TASKS
================================================================================

### Task Order (with dependencies)

```
TASK 1: Create Design Tokens (extend existing tokens.css)
├── Files: mobile-app/src/styles/tokens.css
├── Adds: timeline-specific tokens, status colors
├── Depends on: None
└── Agent: UI/Design

TASK 2: Create Reusable UI Components
├── Files:
│   ├── mobile-app/src/components/ui/StatusBadge.jsx
│   ├── mobile-app/src/components/ui/ActionRow.jsx
│   ├── mobile-app/src/components/ui/SectionCard.jsx
│   ├── mobile-app/src/components/ui/ScreenHeader.jsx (if not exists)
├── Depends on: TASK 1
└── Agent: Frontend

TASK 3: Create Timeline Components
├── Files:
│   ├── mobile-app/src/components/timeline/Timeline.jsx
│   ├── mobile-app/src/components/timeline/TimelineItem.jsx
│   ├── mobile-app/src/components/timeline/DateHeader.jsx
│   ├── mobile-app/src/components/timeline/index.js
├── Depends on: TASK 1, TASK 2
└── Agent: Frontend

TASK 4: Create Type Definitions & Mock Data
├── Files:
│   ├── mobile-app/src/types/application.js
│   ├── mobile-app/src/data/mockApplications.js
├── Depends on: None
└── Agent: Data Model

TASK 5: Create ApplicationTracking Page
├── Files:
│   ├── mobile-app/src/pages/ApplicationTracking.jsx
├── Depends on: TASK 2, TASK 3, TASK 4
└── Agent: Frontend

TASK 6: Create Job Description Modal
├── Files:
│   ├── mobile-app/src/components/modals/JobDescriptionModal.jsx
├── Depends on: TASK 2
└── Agent: Frontend

TASK 7: Create Portal Credentials Modal (stub with security warning)
├── Files:
│   ├── mobile-app/src/components/modals/PortalCredentialsModal.jsx
├── Depends on: TASK 2
└── Agent: Frontend

TASK 8: Add Route & Navigation
├── Files:
│   ├── mobile-app/src/App.jsx (add route)
│   ├── mobile-app/src/pages/Applications.jsx (add navigation link)
├── Depends on: TASK 5
└── Agent: Frontend

TASK 9: Database Migrations (Supabase)
├── SQL: CREATE TABLE applications, application_events
├── RLS: User-scoped policies
├── Indexes: application_id, timestamp
├── Depends on: None (can run in parallel)
└── Agent: Data Model

TASK 10: Wire Real Data (replace mock)
├── Files:
│   ├── mobile-app/src/pages/ApplicationTracking.jsx
│   ├── mobile-app/src/lib/applicationsApi.js (new)
├── Depends on: TASK 9, TASK 5
└── Agent: Frontend

TASK 11: Polish & Responsiveness
├── Files: All component files
├── Focus: spacing, typography, animations, dark mode
├── Depends on: TASK 5-8
└── Agent: UI/Design
```

### File Structure After Implementation

```
mobile-app/src/
├── components/
│   ├── timeline/
│   │   ├── Timeline.jsx
│   │   ├── TimelineItem.jsx
│   │   ├── DateHeader.jsx
│   │   └── index.js
│   ├── modals/
│   │   ├── JobDescriptionModal.jsx
│   │   └── PortalCredentialsModal.jsx
│   └── ui/
│       ├── StatusBadge.jsx
│       ├── ActionRow.jsx
│       ├── SectionCard.jsx
│       └── ScreenHeader.jsx
├── data/
│   └── mockApplications.js
├── lib/
│   └── applicationsApi.js
├── pages/
│   ├── ApplicationTracking.jsx  ← NEW
│   └── Applications.jsx         ← MODIFIED
├── types/
│   └── application.js
└── styles/
    └── tokens.css               ← EXTENDED
```

================================================================================
## PHASE 4: DESIGN SYSTEM (TENDER BRAND)
================================================================================

### Unique Design Differentiators (NOT a Sorce clone)

1. **Primary Color**: Purple/Violet (#7c3aed) instead of Sorce's teal/green
2. **Accent**: Gradient from purple to indigo for CTAs
3. **Milestone Icons**: Filled circles with gradient backgrounds
4. **Cards**: More rounded (rounded-2xl) with subtle shadows
5. **Typography**: Inter font, slightly larger body text
6. **Animations**: Smooth spring transitions (framer-motion)

### Extended Design Tokens

```css
/* Add to tokens.css - Application Tracking specific */

:root {
  /* Timeline */
  --timeline-line-color: var(--color-primary);
  --timeline-line-width: 2px;
  --timeline-milestone-size: 24px;
  --timeline-dot-size: 10px;
  --timeline-spacing: 16px;

  /* Status Badge Colors */
  --status-draft-dot: var(--color-slate-400);
  --status-draft-bg: var(--color-slate-100);
  --status-draft-text: var(--color-slate-700);
  
  --status-submitted-dot: #22c55e;
  --status-submitted-bg: #dcfce7;
  --status-submitted-text: #15803d;
  
  --status-in-progress-dot: #3b82f6;
  --status-in-progress-bg: #dbeafe;
  --status-in-progress-text: #1d4ed8;
  
  --status-interview-dot: var(--color-primary);
  --status-interview-bg: var(--color-primary-light);
  --status-interview-text: var(--color-primary-dark);
  
  --status-offer-dot: #10b981;
  --status-offer-bg: #d1fae5;
  --status-offer-text: #047857;
  
  --status-rejected-dot: #ef4444;
  --status-rejected-bg: #fee2e2;
  --status-rejected-text: #dc2626;
}
```

================================================================================
## PHASE 5: QA CHECKLIST
================================================================================

### Test Scenarios

| ID | Scenario | Expected Result | Priority |
|----|----------|-----------------|----------|
| QA-001 | No applications | Empty state with CTA to explore jobs | High |
| QA-002 | 1 application, 0 events | Show application card, empty timeline | High |
| QA-003 | 1 application, 5 events (same day) | Single date group, 5 items | High |
| QA-004 | 1 application, 10 events (3 days) | 3 date groups, correctly sorted | High |
| QA-005 | Events out of order (server returns unsorted) | UI sorts correctly by timestamp | Medium |
| QA-006 | Missing company logo | Show fallback (first letter avatar) | Medium |
| QA-007 | Very long job title (100+ chars) | Truncate with ellipsis, no overflow | Medium |
| QA-008 | Portal credentials present | Show "View Credentials" link | Medium |
| QA-009 | Portal credentials absent | Hide "View Credentials" link | Medium |
| QA-010 | Tap "Job Description" | Open modal with full description | High |
| QA-011 | Tap "View Credentials" | Open modal with masked password | Medium |
| QA-012 | Dark mode | All colors adapt correctly | Low |
| QA-013 | Offline mode | Show cached data or error state | Low |
| QA-014 | Pull to refresh | Reload application data | Medium |

### Edge Cases to Handle

1. **Null/undefined opportunity data** - Gracefully degrade with placeholders
2. **Timestamp in different timezones** - Display in user's local timezone
3. **Duplicate events** - Dedupe by event ID
4. **Future-dated events** - Show with "Upcoming" indicator
5. **Hundreds of events** - Virtualize list for performance

================================================================================
## PHASE 6: AI ENHANCEMENTS (POST-MVP)
================================================================================

### Proposed AI Features

#### 1. Timeline Summary (High Value)
```javascript
// Generate a natural language summary of the application journey
const generateTimelineSummary = (events) => {
  // Prompt: "Summarize this job application timeline in 1-2 sentences"
  // Example output: "You applied on Jan 13, answered screening questions, 
  //                  and submitted your application at 4:02 PM."
};
```

#### 2. Next Step Suggestion (High Value)
```javascript
// Predict and suggest next action based on status and time elapsed
const suggestNextStep = (application) => {
  if (application.status === 'submitted') {
    const daysSinceApplied = daysSince(application.applied_at);
    if (daysSinceApplied > 7) {
      return "Consider sending a follow-up email to check on your application status.";
    }
  }
  // ... more logic
};
```

#### 3. Auto-categorize Events (Medium Value)
- Automatically detect event type from email content (future: email integration)
- Extract interview dates from calendar invites

================================================================================
## IMPLEMENTATION LOG
================================================================================

### Session: 2026-02-04
- [x] Created implementation plan document
- [x] Defined sub-agents and responsibilities
- [x] Completed Phase 1: UI Specification
- [x] Completed Phase 2: Data Model Definition
- [x] Completed Phase 3: Implementation Task Breakdown
- [x] Completed Phase 4: Design System Extensions
- [x] Completed Phase 5: QA Checklist
- [x] Completed Phase 6: AI Enhancement Proposals
- [ ] BEGIN IMPLEMENTATION (after owner approval)

### Awaiting Owner Approval
Before proceeding to code implementation:
1. ✓ UI Spec reviewed and approved?
2. ✓ Data model reviewed and approved?
3. ✓ Implementation task order reviewed?
4. ✓ Design tokens reviewed?

================================================================================
## REFERENCES
================================================================================

- PRD.md: Original product requirements
- SRS.md: System requirements specification
- progress.txt: Project progress tracker
- mobile-app/src/styles/tokens.css: Existing design tokens
- mobile-app/src/pages/Inbox.jsx: Similar UI pattern reference

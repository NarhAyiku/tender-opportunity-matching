# Applications & Tracking Enhancement - Implementation Plan

**Created:** 2026-02-04
**Objective:** Improve the Application page so users always understand where they stand, what is pending, what the organization has or hasn't received, and what they need to do next.

---

## Sub-Agents Assignment

| Agent | Responsibility |
|-------|----------------|
| **Data Model Agent** | Extend application types, add new status values, checklist model |
| **UI/Design System Agent** | New components: ApplicationSummary, PendingIndicator, CompanyLogo, Checklist |
| **Frontend Agent** | Integrate components into Applications and ApplicationTracking pages |
| **AI Systems Agent** | Generate dynamic summaries and predictions |
| **QA/Edge-Case Agent** | Handle missing data, loading states, error states |

---

## Phase 2: Features to Implement

### 1. Application Summary (Top of Page)
**Location:** Top of `ApplicationTracking.jsx` / `ApplicationsPage.tsx`

Dynamic plain-language summary based on status + events:
- "Your application has been submitted and is pending review."
- "Great news! The employer has viewed your application."
- "The employer has requested additional information."
- "You have an upcoming interview."

### 2. Pending Outcome Indicator
**New component:** `PendingOutcomeIndicator`

Visual stages:
1. ⏳ Pending review
2. 👁 Viewed by employer
3. 📩 Additional info requested
4. 🗓 Interview stage
5. ⏱ Decision pending
6. ✅ Accepted / ❌ Rejected

Visible on both list and detail pages.

### 3. Organization Visibility Signals
**New component:** `OrganizationSignals`

Show:
- ✔ Application received
- 👁 Employer viewed your profile
- ❓ Awaiting employer action
- 📩 Employer requested more information
- "Status not yet shared by the organization" (fallback)

### 4. "Your Recent Applications" Section
**Enhance:** `Applications.jsx` header

- Friendly greeting: "Your Recent Applications"
- Group by recency
- Show: job title, company, logo, status, last activity

### 5. Company Logo Strategy
**New component:** `CompanyLogo`

Features:
- Primary: Fetch from `company_logo` URL
- Fallback: Generate gradient background with initials
- Consistent sizing and styling
- Error handling with graceful degradation

### 6. Post-Interest Checklist
**New component:** `ApplicationChecklist`

Dynamic checklist:
- ✔ Profile submitted
- ✔ Resume uploaded
- ⏳ Portfolio required
- ⏳ Assessment pending
- ⏳ Interview scheduling
- ⏳ References requested

---

## Phase 3: UI/Design Requirements

- Clean, calm, confidence-building
- Clear hierarchy
- No visual clutter
- Consistent iconography
- Neutral but friendly tone
- Premium feel (better than competitors)

---

## Phase 4: File Changes

### New Components (mobile-app)
1. `src/components/applications/ApplicationSummary.jsx`
2. `src/components/applications/PendingOutcomeIndicator.jsx`
3. `src/components/applications/OrganizationSignals.jsx`
4. `src/components/applications/ApplicationChecklist.jsx`
5. `src/components/ui/CompanyLogo.jsx`

### Modified Files (mobile-app)
1. `src/pages/Applications.jsx` - Add summary header, enhance cards
2. `src/pages/ApplicationTracking.jsx` - Add summary, signals, checklist
3. `src/components/ui/StatusBadge.jsx` - Add new status types
4. `src/data/mockApplications.js` - Extend with new fields

### New Components (tender-frontend)
1. `src/components/applications/ApplicationSummary.tsx`
2. `src/components/applications/PendingOutcomeIndicator.tsx`
3. `src/components/applications/OrganizationSignals.tsx`
4. `src/components/applications/ApplicationChecklist.tsx`
5. `src/components/ui/CompanyLogo.tsx`

### Modified Files (tender-frontend)
1. `src/pages/ApplicationsPage.tsx` - Full enhancement
2. `src/types/application.ts` - Extend types

---

## Implementation Order

1. ✅ Data Model updates (types, mock data)
2. ✅ CompanyLogo component
3. ✅ ApplicationSummary component
4. ✅ PendingOutcomeIndicator component
5. ✅ OrganizationSignals component
6. ✅ ApplicationChecklist component
7. ✅ Integrate into Applications list page
8. ✅ Integrate into ApplicationTracking detail page
9. ✅ Polish and test

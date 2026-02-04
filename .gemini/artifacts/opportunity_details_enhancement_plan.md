# Implementation Plan: Enhanced Opportunity Details & Profile Fixes

## Summary
This plan addresses three key issues identified in the mobile app:

1. **OpportunityDetails.jsx** - Sparse job details need comprehensive sections
2. **Profile.jsx** - User's name not displaying from profile data
3. **Screening/Matching** - Need to show if job seeker meets recruiter requirements

---

## Issue 1: Enhanced Opportunity Details Page

### Current State
The `OpportunityDetails.jsx` page shows:
- Basic title, company, salary, location
- A sparse "Requirements" section (often showing "No specific requirements listed")
- A basic description

### Proposed Enhancement
Add the following comprehensive sections:

#### A. About the Role (Detailed Description)
- Full job description with responsibilities
- Key duties and expectations

#### B. Key Responsibilities
- Bullet list of core job duties
- What the candidate will be doing day-to-day

#### C. Required Qualifications
- Technical skills required
- Education requirements
- Experience level needed
- Certifications/licenses required

#### D. Desired Qualifications
- Problem-solving skills
- Passion for technology/security
- Automation knowledge
- Communication skills
- Any "nice-to-have" skills

#### E. Work Authorization & Eligibility
- US work authorization requirements
- International candidate eligibility
- Visa sponsorship availability
- Country restrictions

#### F. Availability & Timeline
- Work period (start date - end date)
- Graduation year requirements (e.g., 2025-2027)
- Application deadline
- Expected start date

#### G. Match Score & Fit Analysis
- Show match percentage prominently
- List matched skills
- Show areas where candidate qualifies/doesn't qualify

#### H. Back Button
- Prominent "Back to Opportunities" button at top and bottom
- Works on all device sizes

### Files to Modify
- `mobile-app/src/pages/OpportunityDetails.jsx` - Complete overhaul

---

## Issue 2: Profile Name Not Displaying

### Current State
Profile page shows "Hello, Member!" instead of actual user name (line 721 in Profile.jsx):
```javascript
const firstName = profile?.name?.split(' ')[0] || 'Member';
```

The problem is that `profile.name` is not being populated from the resume or user data.

### Root Cause
Looking at line 648:
```javascript
const firstName = profile?.name?.split(' ')[0] || 'Member';
```

The profile loads `name` field, but when resume is uploaded, the parsed name might be stored in a different field (`full_name` or `parsed_name`).

### Proposed Fix
1. Check for name in multiple fields: `name`, `full_name`, auth user name
2. Use the Supabase auth user's email/name as fallback
3. After resume parsing, ensure name is saved to profile

### Files to Modify
- `mobile-app/src/pages/Profile.jsx` - Fix name resolution
- `mobile-app/src/pages/Screening.jsx` - Ensure parsed name saves correctly

---

## Issue 3: Screening Progress & Requirement Matching

### Current State
- Screening collects basic info (age, location, countries, documents, consent)
- No validation against specific recruiter requirements
- No progress indicator showing if candidate meets job requirements

### Proposed Enhancement
Add a **Qualification Check** feature that:

1. **Before applying to a job**, shows a checklist:
   - ✅ Work authorization matches
   - ✅ Location preference matches
   - ✅ Education level meets requirement
   - ✅ Skills match (X of Y required)
   - ⚠️ Graduation year (if applicable)

2. **Additional screening questions** when needed:
   - Security clearance eligibility
   - Relocation willingness
   - Start date availability
   - Specific technical assessments

3. **Visual progress indicator** on opportunity cards:
   - Green: Fully qualified
   - Yellow: Partially qualified (some questions need answers)
   - Red: Major requirements not met

### Files to Modify
- `mobile-app/src/pages/OpportunityDetails.jsx` - Add qualification check
- Create new component: `mobile-app/src/components/QualificationCheck.jsx`
- Create new component: `mobile-app/src/components/AdditionalQuestions.jsx`

---

## Implementation Order

### Phase 1: Quick Fixes (Profile Name)
1. Fix Profile.jsx to correctly display user name

### Phase 2: Opportunity Details Enhancement
1. Extend opportunity data model with new fields
2. Redesign OpportunityDetails.jsx with all sections
3. Add prominent back button (responsive)
4. Add sample/demo data for missing fields

### Phase 3: Qualification Matching
1. Create QualificationCheck component
2. Add pre-application screening
3. Show match progress on opportunity cards

---

## Technical Notes

### Data Model Additions
The opportunity table may need these fields (or we provide demo/sample data):
```
- responsibilities: text[]
- desired_qualifications: text[]
- work_authorization: text[]
- country_restrictions: text[]
- graduation_year_min: integer
- graduation_year_max: integer
- availability_start: date
- availability_end: date
```

### Responsive Design
- Use CSS flexbox/grid for layout
- Test on mobile (375px), tablet (768px), desktop (1024px+)
- Ensure back button is always accessible

---

## Approval Required

Please review this plan and confirm:
1. ✅ Proceed with all phases?
2. ⚡ Any priority changes?
3. 🔧 Any specific requirements I should add?

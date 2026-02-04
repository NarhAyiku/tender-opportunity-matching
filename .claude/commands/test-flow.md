---
description: Test the mobile app end-to-end flow using Playwright browser automation
argument-hint: [flow to test, e.g. "signup", "screening", "full", "swipe"]
---

# End-to-End Flow Testing

## Context
- App URL: `http://localhost:5173` (Vite dev server)
- Stack: React PWA + Supabase
- Test user: rose.scottman@gmail.com (or create new during signup flow)

## Instructions

Test the specified flow: $ARGUMENTS

### Before Testing
1. Verify the dev server is running: `curl -s http://localhost:5173 | head -1`
2. If not running: `cd mobile-app && npm run dev &`
3. Check if Playwright MCP is available for browser automation
4. If Playwright MCP not available, use the `/webapp-testing` skill instead

### Available Test Flows

#### `full` — Complete User Journey
1. Navigate to http://localhost:5173/signup
2. Create account (or login if exists)
3. Complete screening wizard (5 steps)
4. Verify feed loads with opportunities
5. Swipe right on an opportunity
6. Check inbox for new conversation
7. Visit profile page
8. Screenshot each step

#### `signup` — Registration Flow
1. Navigate to /signup
2. Fill in name, email, password
3. Submit and verify redirect to screening

#### `login` — Authentication Flow
1. Navigate to /login
2. Enter credentials
3. Verify redirect based on screening_completed status

#### `screening` — Onboarding Wizard
1. Navigate to /screening (must be logged in)
2. Step through all 5 steps
3. Verify data saved to profiles table
4. Verify redirect to feed after completion

#### `swipe` — Feed & Swipe
1. Navigate to /feed (must have completed screening)
2. Verify opportunity cards load
3. Swipe right on one
4. Verify swipe recorded in swipes table
5. Verify conversation created in inbox

#### `profile` — Profile Management
1. Navigate to /profile
2. Check all 3 tabs render (personal, resume, files)
3. Test file upload flow
4. Verify profile data displays correctly

### Error Checking
After each flow:
1. Check browser console for errors
2. Cross-reference any errors with progress.txt ERROR LOG
3. If new error found: log it as ERR-XXX in progress.txt
4. Take screenshots of failures

### Output Format
Report results as:
```
FLOW: [name]
STATUS: PASS / FAIL
STEPS COMPLETED: X/Y
SCREENSHOTS: [list of files]
ERRORS FOUND: [list or "none"]
NEW ERRORS LOGGED: [ERR-XXX or "none"]
```

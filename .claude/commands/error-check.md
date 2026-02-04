---
description: Check the error log before debugging — prevents repeating known issues
argument-hint: [optional: error message or symptom to search for]
---

# Error Log Check

## Purpose
ALWAYS run this before investigating any bug. The error log in progress.txt
tracks all known issues with root causes and fixes. Checking it first prevents
wasting time re-debugging solved problems.

## Instructions

Check for: $ARGUMENTS

### Steps

1. **Read the ERROR LOG section** from progress.txt
   - Look for `[FIXED]` entries matching the symptom
   - Look for `[OPEN]` entries that might be related
   - Look for `[WATCHING]` entries that may have recurred

2. **If a matching entry exists:**
   - Show the ERR-XXX entry with root cause and fix
   - If `[FIXED]`: verify the fix is still in place (files may have been reverted)
   - If `[OPEN]`: show what's known and what's needed
   - If `[WATCHING]`: check if the issue has recurred

3. **If no matching entry exists:**
   - This is a NEW error — proceed with investigation
   - After identifying root cause, log it as the next ERR-XXX in progress.txt
   - Use format:
     ```
     ERR-XXX | [STATUS] | DATE | Summary
       Root cause: ...
       Files affected: ...
       Fix applied: ...
       How to verify: ...
     ```

4. **Cross-reference with Agent Session Notes** in CLAUDE.md
   - Check "Gotchas to remember" section
   - Check "Warnings for next session" section

### Common Error Patterns in This Project

| Pattern | Likely Cause | See |
|---------|-------------|-----|
| `AbortError: signal is aborted` | Supabase auth race condition | ERR-001 |
| `PGRST204` | PostgREST schema cache stale | ERR-003 |
| Column not found after migration | CREATE TABLE IF NOT EXISTS misuse | ERR-004 |
| Empty feed / no opportunities | Seed data not loaded | ERR-005 |
| React Router deprecation warnings | Missing future flags on Router | ERR-002 |

### Output Format
```
ERROR LOG CHECK RESULTS
=======================
Search: [what was searched]
Match: [ERR-XXX or "No match — new error"]
Status: [FIXED / OPEN / WATCHING / NEW]
Action: [What to do next]
```

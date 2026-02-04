---
description: Run Supabase database operations — SQL, migrations, schema inspection, storage management
argument-hint: [SQL query or natural language description of what to do]
---

# Supabase Database Operations

## Context
- Project ref: `aykrsqglrngxbcokqpad`
- URL: `https://aykrsqglrngxbcokqpad.supabase.co`
- This project uses Supabase for: Auth, PostgreSQL, Storage, RLS
- The mobile-app talks directly to Supabase via @supabase/supabase-js

## Instructions

Execute the requested Supabase operation: $ARGUMENTS

### Before ANY Operation
1. Check if the Supabase MCP server is available (`mcp__supabase__*` tools)
2. If available, use MCP tools directly (preferred — faster, safer)
3. If MCP not available, fall back to the Management API via curl:
   ```bash
   curl -X POST "https://api.supabase.com/v1/projects/aykrsqglrngxbcokqpad/database/query" \
     -H "Authorization: Bearer sbp_60e86b3af293337a529315dc5297e1850b50d59b" \
     -H "Content-Type: application/json" \
     -d '{"query": "YOUR SQL HERE"}'
   ```

### Critical Rules (from ERROR LOG)
- **ERR-003**: After ANY `ALTER TABLE`, ALWAYS run: `NOTIFY pgrst, 'reload schema';`
- **ERR-004**: NEVER use `CREATE TABLE IF NOT EXISTS` to add columns. Use `ALTER TABLE ADD COLUMN IF NOT EXISTS`.
- **Never** run destructive operations (DROP TABLE, TRUNCATE) without explicit user confirmation
- **Always** show the SQL to be executed before running it
- **Always** verify the result after execution

### Common Operations
- `schema` — Show all tables and columns in public schema
- `seed` — Run supabase/seed.sql to populate sample data
- `rls` — Show RLS policies for all tables
- `storage` — List storage buckets and policies
- `migrate <description>` — Generate and run ALTER TABLE migration
- Any raw SQL — Execute directly

### Output Format
After execution, show:
1. The SQL that was run
2. The result (data or confirmation)
3. Any follow-up actions needed (e.g., schema reload)

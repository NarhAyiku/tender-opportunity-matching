# TENDER — Gap Analysis & Redesign: Phases 1-5
# Generated: 2026-02-04
# Reference System: Sorce.jobs (YC W25, "Tinder for Jobs")
# Analysis: 33 Sorce screenshots + web research + full TENDER codebase exploration

---

# PHASE 1 — COMPARATIVE GAP ANALYSIS (COMPLETED)

See WORK_LOG.md (2026-02-04 session) and progress.txt GAP ANALYSIS section for the
complete gap analysis. Summary:
- 10 Critical gaps (C1-C10)
- 10 Enhancement gaps (E1-E10)
- 7 Optional/future gaps (O1-O7)
- TENDER's strategic advantages: broader opportunity types, student focus, document vault, screening gate

---

# PHASE 5 — SUB-AGENT DEFINITIONS & COLLABORATION PROTOCOL

## Why Sub-Agents?

Complex system redesigns fail when a single entity tries to hold all concerns simultaneously.
By decomposing into specialized agents, we get:
- **Focused expertise** per domain
- **Parallel execution** of independent work
- **Built-in review** — agents critique each other's output
- **Reusable** for future projects

## Agent Roster

### Agent 1: UI/UX Design Agent
**Responsibility:** Visual design, interaction design, design system, accessibility
**Skills:** Design tokens, component specs, motion design, responsive layout, WCAG compliance
**Tools:** CSS/Tailwind configuration, component prop definitions, animation specs
**Triggers:**
  - When a new page or component is needed
  - When existing UI needs refinement
  - When accessibility audit is requested
  - When design system needs extension
**Inputs:** Feature requirements, user flow descriptions, reference screenshots
**Outputs:** Component specs (variants, states, sizes), CSS token definitions, motion specs, accessibility annotations
**Review protocol:** Frontend Architecture Agent validates implementability; QA Agent validates accessibility

### Agent 2: Frontend Architecture Agent
**Responsibility:** React component structure, state management, routing, performance, code organization
**Skills:** React patterns, hooks, context, lazy loading, code splitting, Supabase client integration
**Tools:** Read/write React components, Vite config, router setup, hook creation
**Triggers:**
  - When implementing new features (pages, components, hooks)
  - When refactoring existing code
  - When optimizing performance
**Inputs:** UI/UX specs from Design Agent, API contracts from Backend Agent
**Outputs:** Component implementations, hook definitions, state management patterns, route configurations
**Review protocol:** UI/UX Agent validates visual fidelity; QA Agent validates edge cases; Code Reviewer validates quality

### Agent 3: Backend / API Agent
**Responsibility:** Database schema, Supabase configuration, RLS policies, Edge Functions, API design
**Skills:** PostgreSQL, Supabase SDK, RLS policies, Edge Functions (Deno), data modeling
**Tools:** SQL execution (Supabase Management API), Edge Function deployment, schema migrations
**Triggers:**
  - When data model changes are needed
  - When new API endpoints are required
  - When RLS policies need updating
  - When Edge Functions need creation
**Inputs:** Feature requirements, data flow diagrams from Architecture Agent
**Outputs:** SQL migrations, RLS policies, Edge Function code, API contracts (input/output schemas)
**Review protocol:** Frontend Agent validates API usability; QA Agent validates security (RLS); AI Agent validates AI integration points

### Agent 4: AI Systems Agent
**Responsibility:** AI feature design, LLM integration, embedding strategy, matching algorithms
**Skills:** LLM API calls (OpenAI/Anthropic), embedding models, similarity search, prompt engineering
**Tools:** Supabase Edge Functions, pgvector, external API calls, prompt templates
**Triggers:**
  - When AI-powered features are being built
  - When matching/ranking logic needs improvement
  - When content generation is needed (cover letters, summaries)
**Inputs:** User profile data, opportunity data, feature requirements
**Outputs:** Prompt templates, scoring algorithms, Edge Function implementations, embedding pipelines
**Review protocol:** Backend Agent validates data flow; QA Agent validates output quality; Frontend Agent validates UX integration

### Agent 5: QA & Edge-Case Agent
**Responsibility:** Test design, edge case identification, accessibility audit, security review, regression detection
**Skills:** Vitest, Playwright, WCAG auditing, security testing, error scenario mapping
**Tools:** Test runners, browser automation, accessibility checkers, console monitoring
**Triggers:**
  - After ANY code change (mandatory review)
  - When new features are implemented
  - When bugs are reported
  - Periodically for regression checks
**Inputs:** Code changes (diffs), feature specs, component implementations
**Outputs:** Test suites, bug reports, accessibility findings, security observations, edge case lists
**Review protocol:** Reviews ALL other agents' output. Has veto power on shipping if critical issues found.

## Collaboration Protocol

### Workflow for New Features
```
1. REQUIREMENTS
   → UI/UX Agent: Produces component specs & interaction design
   → Backend Agent: Produces data model & API contract

2. REVIEW (parallel)
   → Frontend Agent reviews UI specs for implementability
   → QA Agent reviews both for edge cases & accessibility
   → AI Agent reviews for AI integration opportunities

3. IMPLEMENTATION (parallel where possible)
   → Backend Agent: Schema migration + RLS + Edge Functions
   → Frontend Agent: Components + hooks + routing
   → AI Agent: AI features (if applicable)

4. INTEGRATION
   → Frontend Agent: Wires API to UI
   → QA Agent: Writes & runs tests

5. REVIEW ROUND
   → ALL agents review the integrated result
   → QA Agent runs full regression
   → UI/UX Agent validates visual fidelity
   → Backend Agent validates data integrity

6. SHIP
   → Only if QA Agent approves
```

### Conflict Resolution
- **Design vs Implementation**: Frontend Agent proposes alternative; UI/UX Agent accepts or counter-proposes
- **Performance vs Features**: Backend Agent has final say on what's feasible
- **Security vs UX**: QA Agent has veto power on security issues
- **AI quality vs Speed**: AI Agent recommends; Backend Agent decides execution strategy

### Communication Format
Each agent communicates using structured outputs:
```
[AGENT: name]
[ACTION: spec | implement | review | flag]
[CONTEXT: feature/component being discussed]
[CONTENT: the actual output]
[NEEDS_REVIEW_BY: agent1, agent2]
```

## Sprint Assignments

### Sprint 1 (Foundation)
| Gap | Lead Agent | Supporting Agents |
|-----|-----------|-------------------|
| C2: Profile edit/delete | Frontend Agent | UI/UX (modal specs), QA (edge cases) |
| C4: Settings page | Frontend Agent | UI/UX (layout), Backend (auth deletion), QA (account deletion flow) |
| C8: Personal info expansion | Backend Agent (schema) | Frontend (form UI), UI/UX (field layout), QA (privacy) |
| C10: Test infrastructure | QA Agent | Frontend (component tests), Backend (API tests) |

### Sprint 2 (Feed Quality)
| Gap | Lead Agent | Supporting Agents |
|-----|-----------|-------------------|
| C1: Feed filters | Backend Agent (query logic) | Frontend (filter UI), UI/UX (filter interaction), QA (empty states) |
| C5: Resume parsing mobile | AI Agent | Backend (Edge Function), Frontend (review UI), QA (parsing accuracy) |
| C6: Smart ranking | AI Agent | Backend (scoring RPC), Frontend (sort integration), QA (ranking quality) |
| E6: Match indicator | AI Agent (scoring) | UI/UX (badge design), Frontend (card integration), QA (accuracy) |
| E10: Onboarding tutorial | UI/UX Agent | Frontend (implementation), QA (first-time detection) |

### Sprint 3 (Applications UX)
| Gap | Lead Agent | Supporting Agents |
|-----|-----------|-------------------|
| C3: Applications dashboard | UI/UX Agent (design) | Frontend (implementation), Backend (status queries), QA (all states) |
| E4: Passed jobs list | Frontend Agent | Backend (query), QA (undo logic) |
| E3: Company profiles | Frontend Agent | Backend (aggregation query), UI/UX (page design) |
| E5: File management | Frontend Agent | Backend (Storage API), UI/UX (file UI), QA (upload/delete) |

### Sprint 4 (AI Layer)
| Gap | Lead Agent | Supporting Agents |
|-----|-----------|-------------------|
| E1: Cover letter generation | AI Agent | Backend (Edge Function), Frontend (preview/edit UI), QA (quality) |
| E2: Saved responses | Backend Agent (schema) | Frontend (responses tab), AI (auto-fill logic), QA (data persistence) |
| E8: Feedback channel | Frontend Agent | Backend (storage), UI/UX (chat UI) |

### Sprint 5 (Scale)
| Gap | Lead Agent | Supporting Agents |
|-----|-----------|-------------------|
| C7: Job aggregation | Backend Agent | AI (dedup/normalize), QA (data quality) |
| C9: Architecture consolidation | Backend Agent | ALL agents (migration impact) |
| E7: Real-time updates | Backend Agent (subscriptions) | Frontend (listeners), QA (connection handling) |
| E9: Notifications | Backend Agent (triggers) | Frontend (UI), UI/UX (notification design) |

---

# PHASE 2 — FEATURE & SYSTEM IMPLEMENTATION SPECS
(Generated by Backend/API Agent — see below)

<!-- PHASE 2 CONTENT WILL BE APPENDED BY BACKGROUND AGENT -->

---

# PHASE 3 — UI/DESIGN SYSTEM SPECIFICATION
(Generated by UI/UX Design Agent — see below)

<!-- PHASE 3 CONTENT WILL BE APPENDED BY BACKGROUND AGENT -->

---

# PHASE 4 — AI & AGENTIC ARCHITECTURE
(Generated by AI Systems Agent — see below)

<!-- PHASE 4 CONTENT WILL BE APPENDED BY BACKGROUND AGENT -->

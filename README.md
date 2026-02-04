# Opportunity Engine

## Overview
Opportunity Engine is an AI-powered platform that matches students and graduates
to relevant scholarships, internships, jobs, and grants using natural language
processing and semantic similarity.

## Problem Statement
Opportunities are scattered across multiple platforms and generic filters fail
to capture a person’s real background, skills, and goals. As a result, many
qualified candidates miss life-changing opportunities.

## Solution
Opportunity Engine uses AI embeddings to understand both user profiles and
opportunity descriptions semantically, enabling personalized and explainable
recommendations.

## System Architecture
User Profile → Text Embeddings → Similarity Engine → Ranked Opportunities → Explanation Layer

## AI Matching Logic
- Convert user profiles and opportunities into vector embeddings
- Compute cosine similarity between vectors
- Rank opportunities by relevance score
- Provide explanations based on overlapping skills and goals

## Tech Stack
- Backend: Python, FastAPI
- AI: Sentence Transformers / OpenAI Embeddings
- Database: PostgreSQL
- Frontend: React / Next.js
- Deployment: Docker, Render

## Setup Instructions
1. Clone the repository
2. Create a virtual environment
3. Install dependencies
4. Run the FastAPI server
5. Seed the database with dummy opportunities:
   ```bash
   python3 seed_opportunities.py
   ```

## Results and Metrics
(To be added after deployment)

## Future Improvements
- Feedback-based learning
- Email alerts
- Advanced ranking models
- Admin moderation panel

## Design System Guardrails
Avoid “vibe-coded” patterns. Every UI change should align to the shared design system:

- Colors/visual: no default purple gradients unless brand-approved; remove sparkles/emojis from hero headings; avoid generic glowing hovers.
- Typography: stick to a defined type scale and line-height; consistent weight hierarchy; avoid oversized headings with thin body text.
- Layout/components: consistent component placement across pages; use only 2–3 border-radius values; subtle hovers (2–4px lift max); icons sized proportionally to text; remove non-functional social icons.
- Animations/interactions: purposeful animations only, with easing curves (cubic-bezier) and intentional staggering.
- UX behaviors: loading states for async actions (skeletons for heavy data), progress indicators on buttons when applicable, functional toggles/carousels.
- Copywriting: avoid vague slogans, overused em-dashes, fake testimonials, and generic AI faces/placeholders.
- Core principle: define tokens (spacing, color, radius, weight, animation) and reference them everywhere; inconsistency is a blocker.

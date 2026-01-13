# AI-Powered Opportunity Matching Platform (TENDER)

## Project Goal
Build a swipe-based (Tinder-style) opportunity matching app for students and graduates.
Users can upload CVs and documents, swipe on opportunities, and upon liking, their
documents are sent directly to the company.

## Tech Stack
- Backend: FastAPI (Python)
- Database: SQLite (for now), later Postgres
- ORM: SQLAlchemy
- Frontend: HTML/CSS/JS (moving toward mobile app)
- Auth: API keys + user headers (temporary)

## Current Features
- User profiles with skills
- Opportunity listings
- Matching endpoint (/match/{user_id})
- Basic frontend to fetch and display matches

## Next Major Features
1. CV / document upload (PDF, DOCX)
2. Swipe-based matching (like / dislike)
3. Auto-send CV to company on "like"
4. Company dashboard
5. Mobile app (React Native / Expo)

## Claude Instructions
- Prefer clean, production-ready FastAPI code
- Do not break existing endpoints
- Ask before refactoring core logic
- Always explain changes clearly

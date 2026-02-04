# Task Completion Checklist

When completing a task, ensure the following:

## Backend Changes
- [ ] Run backend tests: `pytest tests/ -v`
- [ ] Check API docs still work: http://localhost:8000/docs
- [ ] Verify no breaking changes to existing endpoints

## Frontend Changes
- [ ] Run linter: `npm run lint` (in mobile-app/)
- [ ] Test in browser at http://localhost:5173
- [ ] Check mobile responsiveness
- [ ] Verify API integration works with backend

## Database Changes
- [ ] Update models in /app/models/
- [ ] Update schemas in /app/schemas/
- [ ] Run migrate_db.py if schema changed
- [ ] Test with existing data

## Before Committing
- [ ] Review all changed files
- [ ] Ensure no secrets/credentials in code
- [ ] Write clear commit message
- [ ] Reference ticket if applicable (TDR-XXX)

## API Changes
- [ ] Update request/response schemas
- [ ] Update API documentation (auto-generated)
- [ ] Test all affected endpoints
- [ ] Update frontend api.js if needed

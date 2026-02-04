# Suggested Commands

## Backend (FastAPI)

### Run Development Server
```bash
cd "/Users/benjaminnarh/AI-Powered Opportunity Matching Platform for Students and Graduates"
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

### Run Tests
```bash
pytest tests/ -v
pytest tests/ --cov=app  # with coverage
```

### Database Migration (manual)
```bash
python migrate_db.py
```

## Frontend (Mobile App)

### Install Dependencies
```bash
cd mobile-app
npm install
```

### Run Development Server
```bash
cd mobile-app
npm run dev  # Runs on http://localhost:5173
```

### Build Production
```bash
cd mobile-app
npm run build
```

### Lint
```bash
cd mobile-app
npm run lint
```

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Common Utilities (macOS/Darwin)
```bash
# Git operations
git status
git add .
git commit -m "message"
git push

# Process management
lsof -i :8000  # Find process on port
kill -9 <PID>  # Kill process

# Python virtual environment
source venv/bin/activate
deactivate
```

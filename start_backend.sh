#!/bin/bash
# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Install requirements if needed
pip install -r requirements.txt

# Run the app
uvicorn app.main:app --reload --port 8000

"""
Pytest Configuration and Shared Fixtures

This file is automatically loaded by pytest.
"""
import pytest
import os
import sys

# Add the app directory to the path so imports work
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))


@pytest.fixture(autouse=True)
def set_test_env():
    """Set environment variables for testing."""
    os.environ["ENVIRONMENT"] = "test"
    os.environ["JOOBLE_API_KEY"] = "test-jooble-key"
    os.environ["ADZUNA_APP_ID"] = "test-adzuna-id"
    os.environ["ADZUNA_APP_KEY"] = "test-adzuna-key"
    os.environ["DATABASE_URL"] = "sqlite:///./test.db"
    yield
    # Cleanup if needed


@pytest.fixture
def sample_jooble_response():
    """Sample Jooble API response for mocking."""
    return {
        "totalCount": 2,
        "jobs": [
            {
                "title": "Python Developer",
                "company": "Tech Startup",
                "location": "Remote",
                "snippet": "We are looking for a Python developer...",
                "salary": "80,000 - 120,000 USD",
                "type": "Full-time",
                "link": "https://jooble.org/job/123",
                "id": 123456,
                "updated": "2026-01-19T10:00:00"
            },
            {
                "title": "Senior Engineer",
                "company": "Big Corp",
                "location": "New York, NY",
                "snippet": "Senior position available...",
                "salary": "150,000 USD",
                "type": "Full-time",
                "link": "https://jooble.org/job/456",
                "id": 789012,
                "updated": "2026-01-19T11:00:00"
            }
        ]
    }


@pytest.fixture
def sample_adzuna_response():
    """Sample Adzuna API response for mocking."""
    return {
        "count": 2,
        "results": [
            {
                "id": "adzuna-001",
                "title": "Data Analyst",
                "description": "Analyze business data and create reports...",
                "redirect_url": "https://adzuna.com/job/001",
                "company": {"display_name": "Analytics Inc"},
                "location": {"display_name": "San Francisco, CA"},
                "salary_min": 90000,
                "salary_max": 130000,
                "contract_type": "permanent",
                "created": "2026-01-18T14:00:00Z"
            },
            {
                "id": "adzuna-002",
                "title": "ML Engineer",
                "description": "Build machine learning models...",
                "redirect_url": "https://adzuna.com/job/002",
                "company": {"display_name": "AI Company"},
                "location": {"display_name": "Remote"},
                "salary_min": 140000,
                "salary_max": 200000,
                "contract_type": "permanent",
                "created": "2026-01-19T09:00:00Z"
            }
        ]
    }

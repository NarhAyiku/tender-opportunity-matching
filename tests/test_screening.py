"""Tests for screening endpoints.

Covers status and completion flows using an in-memory SQLite database with
dependency overrides to avoid touching the real app.db.
"""
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import Base
from app.models.user import User
from app.api import screening
from app.security import require_user


@pytest.fixture
def test_client():
    """Provide TestClient with isolated in-memory DB and dummy user."""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create tables and seed a user
    Base.metadata.create_all(bind=engine)
    with TestingSessionLocal() as db:
        user = User(email="test@example.com", hashed_password="hashed", name="Test User")
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    def override_require_user():
        return SimpleNamespace(id=user_id)

    app.dependency_overrides[screening.get_db] = override_get_db
    app.dependency_overrides[require_user] = override_require_user

    client = TestClient(app)

    try:
        yield client, TestingSessionLocal, user_id
    finally:
        app.dependency_overrides.clear()
        Base.metadata.drop_all(bind=engine)


def test_status_incomplete_returns_missing_fields(test_client):
    client, _, _ = test_client

    response = client.get("/screening/status")

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is False
    assert set(data["missing"]) == {
        "age",
        "location",
        "preferred_countries",
        "consent_share_documents",
    }
    assert data["age"] is None
    assert data["location"] is None
    assert data["preferred_countries"] == []
    assert data["consent_share_documents"] is False


def test_complete_updates_user_and_marks_completed(test_client):
    client, SessionLocal, user_id = test_client

    payload = {
        "age": 22,
        "location": "Accra",
        "preferred_countries": ["US", "GH"],
        "consent_share_documents": True,
    }

    response = client.post("/screening/complete", json=payload)

    assert response.status_code == 200
    data = response.json()
    assert data["completed"] is True
    assert data["missing"] == []
    assert data["age"] == 22
    assert data["location"] == "Accra"
    assert data["preferred_countries"] == ["US", "GH"]
    assert data["consent_share_documents"] is True
    assert data["screening_completed_at"] is not None

    # Confirm persisted to DB
    with SessionLocal() as db:
        user = db.query(User).get(user_id)
        assert user.age == 22
        assert user.location == "Accra"
        assert user.preferred_countries == ["US", "GH"]
        assert user.consent_share_documents is True
        assert user.screening_completed is True


def test_complete_validates_input(test_client):
    client, _, _ = test_client

    # Age too low should fail validation (min 16)
    payload = {
        "age": 12,
        "location": "Accra",
        "preferred_countries": [],
        "consent_share_documents": True,
    }

    response = client.post("/screening/complete", json=payload)
    assert response.status_code == 422

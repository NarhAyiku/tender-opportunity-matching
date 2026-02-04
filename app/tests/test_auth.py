import os
import sys
import pytest
from fastapi.testclient import TestClient

# Ensure project root is on path (one level up from /app/tests)
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PARENT = os.path.abspath(os.path.join(ROOT_DIR, ".."))
for p in (ROOT_DIR, PARENT):
    if p not in sys.path:
        sys.path.insert(0, p)

from app.main import app
from app.database import Base, engine, SessionLocal
from app.models.user import User
from app.security import get_password_hash


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client():
    return TestClient(app)


def create_user(email="test@example.com", password="password123"):
    db = SessionLocal()
    user = User(email=email, hashed_password=get_password_hash(password), name="Test User")
    db.add(user)
    db.commit()
    db.refresh(user)
    db.close()
    return user


def test_signup_success(client):
    res = client.post("/auth/signup", json={
        "email": "new@example.com",
        "password": "password123",
        "name": "New User"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "new@example.com"


def test_login_success(client):
    create_user()
    res = client.post("/auth/login/json", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_login_wrong_password(client):
    create_user()
    res = client.post("/auth/login/json", json={
        "email": "test@example.com",
        "password": "wrongpass"
    })
    assert res.status_code == 401


def test_me_requires_token(client):
    res = client.get("/auth/me")
    assert res.status_code == 401


def test_me_with_token(client):
    create_user()
    login = client.post("/auth/login/json", json={
        "email": "test@example.com",
        "password": "password123"
    })
    token = login.json()["access_token"]
    res = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "test@example.com"

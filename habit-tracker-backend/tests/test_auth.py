from datetime import UTC, datetime, timedelta

from jose import jwt

from app.core.config import settings


def test_register_returns_201_with_user(client):
    response = client.post(
        "/auth/register",
        json={"email": "new@example.com", "password": "secret123"},
    )

    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "new@example.com"
    assert isinstance(body["id"], int)
    assert "created_at" in body
    assert "password" not in body
    assert "password_hash" not in body


def test_register_duplicate_email_returns_409(client):
    payload = {"email": "dup@example.com", "password": "secret123"}

    first = client.post("/auth/register", json=payload)
    assert first.status_code == 201

    second = client.post("/auth/register", json=payload)
    assert second.status_code == 409
    assert second.json()["detail"] == "Email already exists"


def test_login_with_wrong_password_returns_401(client):
    register = client.post(
        "/auth/register",
        json={"email": "user@example.com", "password": "correct-password"},
    )
    assert register.status_code == 201

    response = client.post(
        "/auth/login",
        json={"email": "user@example.com", "password": "wrong-password"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"


def test_expired_token_returns_401_on_protected_endpoint(client):
    expired_token = jwt.encode(
        {
            "sub": "1",
            "type": "access",
            "exp": datetime.now(UTC) - timedelta(minutes=1),
        },
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )

    response = client.get(
        "/habits",
        headers={"Authorization": f"Bearer {expired_token}"},
    )

    assert response.status_code == 401

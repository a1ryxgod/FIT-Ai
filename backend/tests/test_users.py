import pytest

pytestmark = pytest.mark.django_db


class TestRegistration:
    def test_register_creates_user_and_org(self, api_client):
        response = api_client.post("/api/auth/register/", {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepass123",
            "password2": "securepass123",
            "organization_name": "My Gym",
        })
        assert response.status_code == 201
        assert "tokens" in response.data
        assert "organization" in response.data
        assert "user" in response.data

    def test_register_password_mismatch(self, api_client):
        response = api_client.post("/api/auth/register/", {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "securepass123",
            "password2": "different",
            "organization_name": "My Gym",
        })
        assert response.status_code == 400

    def test_register_duplicate_username(self, api_client, user):
        response = api_client.post("/api/auth/register/", {
            "username": user.username,
            "email": "other@example.com",
            "password": "securepass123",
            "password2": "securepass123",
            "organization_name": "Gym",
        })
        assert response.status_code == 400

    def test_profile_requires_auth(self, api_client):
        response = api_client.get("/api/auth/profile/")
        assert response.status_code == 401

    def test_profile_returns_data(self, auth_client):
        response = auth_client.get("/api/auth/profile/")
        assert response.status_code == 200
        assert "username" in response.data

    def test_login(self, api_client, user):
        response = api_client.post("/api/auth/login/", {
            "username": user.username,
            "password": "testpass123",
        })
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data

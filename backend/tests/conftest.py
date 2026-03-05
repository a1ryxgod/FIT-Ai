import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken

from apps.organizations.services import create_organization

User = get_user_model()


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        username="testuser",
        email="test@example.com",
        password="testpass123",
    )


@pytest.fixture
def user2(db):
    return User.objects.create_user(
        username="testuser2",
        email="test2@example.com",
        password="testpass123",
    )


@pytest.fixture
def org(db, user):
    return create_organization(user, "Test Gym")


@pytest.fixture
def org2(db, user2):
    return create_organization(user2, "Other Gym")


def make_auth_client(user, org, role="owner"):
    client = APIClient()
    refresh = RefreshToken.for_user(user)
    refresh["org_id"] = str(org.id)
    refresh["role"] = role
    client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
    return client


@pytest.fixture
def auth_client(user, org):
    return make_auth_client(user, org)


@pytest.fixture
def auth_client2(user2, org2):
    return make_auth_client(user2, org2)

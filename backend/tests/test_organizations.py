import pytest
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.test import APIClient

from apps.organizations.models import Membership, Organization

pytestmark = pytest.mark.django_db


class TestOrganizationIsolation:
    def test_user_sees_only_own_orgs(self, auth_client, org, org2):
        response = auth_client.get("/api/orgs/")
        assert response.status_code == 200
        ids = [r["id"] for r in response.data["results"]]
        assert str(org.id) in ids
        assert str(org2.id) not in ids

    def test_create_org(self, auth_client):
        response = auth_client.post("/api/orgs/", {"name": "New Gym"})
        assert response.status_code == 201
        assert Organization.objects.filter(name="New Gym").exists()

    def test_switch_org(self, auth_client, org):
        response = auth_client.post(f"/api/orgs/{org.id}/switch/")
        assert response.status_code == 200
        assert "access" in response.data
        assert "refresh" in response.data
        assert response.data["org_id"] == str(org.id)
        assert response.data["role"] == "owner"

    def test_cannot_switch_to_unjoined_org(self, auth_client, org2):
        response = auth_client.post(f"/api/orgs/{org2.id}/switch/")
        assert response.status_code == 404

    def test_invite_user(self, auth_client, user2, org):
        response = auth_client.post(f"/api/orgs/{org.id}/invite/", {
            "username": user2.username,
            "role": "member",
        })
        assert response.status_code == 200
        assert Membership.objects.filter(user=user2, organization=org).exists()

    def test_invite_requires_admin(self, user2, org, user):
        Membership.objects.create(user=user2, organization=org, role=Membership.Role.MEMBER)
        client = APIClient()
        refresh = RefreshToken.for_user(user2)
        refresh["org_id"] = str(org.id)
        refresh["role"] = "member"
        client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = client.post(f"/api/orgs/{org.id}/invite/", {
            "username": user.username,
            "role": "member",
        })
        assert response.status_code == 403

    def test_unauthenticated_cannot_list_orgs(self, api_client):
        response = api_client.get("/api/orgs/")
        assert response.status_code == 401

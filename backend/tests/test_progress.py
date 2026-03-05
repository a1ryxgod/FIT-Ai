import pytest

from apps.progress.models import WeightLog

pytestmark = pytest.mark.django_db


class TestProgress:
    def test_log_weight(self, auth_client):
        response = auth_client.post("/api/weight/", {"weight": 75.5})
        assert response.status_code == 201
        assert response.data["weight"] == 75.5

    def test_weight_history(self, auth_client, user, org):
        WeightLog.objects.create(user=user, organization=org, weight=75.0)
        WeightLog.objects.create(user=user, organization=org, weight=74.5)
        response = auth_client.get("/api/weight/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 2

    def test_org_isolation(self, auth_client2, user, org):
        WeightLog.objects.create(user=user, organization=org, weight=75.0)
        response = auth_client2.get("/api/weight/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 0

    def test_requires_org_context(self, api_client, user):
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {refresh.access_token}")
        response = api_client.post("/api/weight/", {"weight": 75.0})
        assert response.status_code == 403

    def test_weight_ordering(self, auth_client, user, org):
        WeightLog.objects.create(user=user, organization=org, weight=80.0)
        WeightLog.objects.create(user=user, organization=org, weight=78.0)
        response = auth_client.get("/api/weight/")
        weights = [r["weight"] for r in response.data["results"]]
        assert weights == sorted(weights, reverse=True) or len(weights) <= 1

import pytest

from apps.nutrition.models import FoodLog, FoodProduct

pytestmark = pytest.mark.django_db


@pytest.fixture
def food_product(db):
    return FoodProduct.objects.create(
        name="Chicken Breast",
        calories=165.0,
        protein=31.0,
        fats=3.6,
        carbs=0.0,
    )


class TestNutrition:
    def test_log_food(self, auth_client, food_product):
        response = auth_client.post("/api/food/log/", {
            "product_id": str(food_product.id),
            "grams": 200.0,
        })
        assert response.status_code == 201

    def test_today_summary(self, auth_client, food_product, user, org):
        FoodLog.objects.create(user=user, organization=org, product=food_product, grams=100.0)
        response = auth_client.get("/api/food/today/")
        assert response.status_code == 200
        assert "totals" in response.data
        assert "logs" in response.data
        assert abs(response.data["totals"]["calories"] - 165.0) < 0.01
        assert abs(response.data["totals"]["protein"] - 31.0) < 0.01

    def test_today_org_isolation(self, auth_client2, food_product, user, org):
        FoodLog.objects.create(user=user, organization=org, product=food_product, grams=100.0)
        response = auth_client2.get("/api/food/today/")
        assert response.status_code == 200
        assert len(response.data["logs"]) == 0
        assert response.data["totals"]["calories"] == 0.0

    def test_list_products(self, auth_client, food_product):
        response = auth_client.get("/api/food/products/")
        assert response.status_code == 200
        assert len(response.data["results"]) >= 1

    def test_search_products(self, auth_client, food_product):
        response = auth_client.get("/api/food/products/?search=Chicken")
        assert response.status_code == 200
        assert any(p["name"] == "Chicken Breast" for p in response.data["results"])

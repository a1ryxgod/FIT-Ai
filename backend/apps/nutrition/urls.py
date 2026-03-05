from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("food/products", views.FoodProductViewSet, basename="food-products")

urlpatterns = [
    path("", include(router.urls)),
    path("food/log/", views.FoodLogCreateView.as_view(), name="food-log"),
    path("food/today/", views.TodayFoodView.as_view(), name="food-today"),
]

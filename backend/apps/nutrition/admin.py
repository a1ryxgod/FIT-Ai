from django.contrib import admin

from .models import FoodLog, FoodProduct


@admin.register(FoodProduct)
class FoodProductAdmin(admin.ModelAdmin):
    list_display = ["name", "calories", "protein", "fats", "carbs"]
    search_fields = ["name"]


@admin.register(FoodLog)
class FoodLogAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "product", "grams", "date"]
    list_filter = ["organization", "date"]

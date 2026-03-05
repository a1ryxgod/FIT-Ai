from datetime import date as date_type

from django.shortcuts import get_object_or_404

from .models import FoodLog, FoodProduct


def log_food(user, organization, product_id, grams, log_date=None):
    product = get_object_or_404(FoodProduct, pk=product_id)
    return FoodLog.objects.create(
        user=user,
        organization=organization,
        product=product,
        grams=grams,
        date=log_date or date_type.today(),
    )


def get_today_summary(user, organization, log_date=None):
    today = log_date or date_type.today()
    logs = FoodLog.objects.filter(
        user=user,
        organization=organization,
        date=today,
        is_deleted=False,
    ).select_related("product")

    totals = {"calories": 0.0, "protein": 0.0, "fats": 0.0, "carbs": 0.0}
    for log in logs:
        ratio = log.grams / 100.0
        totals["calories"] += log.product.calories * ratio
        totals["protein"] += log.product.protein * ratio
        totals["fats"] += log.product.fats * ratio
        totals["carbs"] += log.product.carbs * ratio

    return logs, totals

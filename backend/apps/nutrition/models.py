import uuid
from datetime import date

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.organizations.models import Organization


class FoodProduct(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    calories = models.FloatField(help_text="kcal per 100g")
    protein = models.FloatField(help_text="g per 100g")
    fats = models.FloatField(help_text="g per 100g")
    carbs = models.FloatField(help_text="g per 100g")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} ({self.calories} kcal/100g)"


class FoodLog(BaseModel):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="food_logs", db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="food_logs"
    )
    product = models.ForeignKey(FoodProduct, on_delete=models.CASCADE, related_name="logs")
    grams = models.FloatField(help_text="Amount in grams")
    date = models.DateField(default=date.today, db_index=True)

    class Meta:
        ordering = ["-date"]
        indexes = [models.Index(fields=["organization", "user", "date"])]

    def __str__(self):
        return f"{self.user} — {self.product.name} ({self.grams}g) on {self.date}"

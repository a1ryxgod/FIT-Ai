from datetime import date

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.organizations.models import Organization


class WeightLog(BaseModel):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="weight_logs", db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="weight_logs"
    )
    weight = models.FloatField(help_text="kg")
    date = models.DateField(default=date.today, db_index=True)

    class Meta:
        ordering = ["-date"]
        indexes = [models.Index(fields=["organization", "user", "date"])]

    def __str__(self):
        return f"{self.user}: {self.weight}kg on {self.date}"

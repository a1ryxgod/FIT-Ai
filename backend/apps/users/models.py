import uuid

from django.contrib.auth.models import AbstractUser
from django.db import models

from apps.core.models import BaseModel


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    class Meta(AbstractUser.Meta):
        swappable = "AUTH_USER_MODEL"


class Profile(BaseModel):
    class ActivityLevel(models.TextChoices):
        LOW = "low", "Low"
        MEDIUM = "medium", "Medium"
        HIGH = "high", "High"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    height = models.PositiveIntegerField(null=True, blank=True, help_text="cm")
    weight = models.FloatField(null=True, blank=True, help_text="kg")
    age = models.PositiveIntegerField(null=True, blank=True)
    activity_level = models.CharField(
        max_length=10,
        choices=ActivityLevel.choices,
        default=ActivityLevel.MEDIUM,
    )

    def __str__(self):
        return f"Profile({self.user.username})"

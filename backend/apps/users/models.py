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
        SEDENTARY = "sedentary", "Sedentary"
        LIGHTLY_ACTIVE = "lightly_active", "Lightly Active"
        MODERATELY_ACTIVE = "moderately_active", "Moderately Active"
        VERY_ACTIVE = "very_active", "Very Active"
        EXTRA_ACTIVE = "extra_active", "Extra Active"

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    height = models.PositiveIntegerField(null=True, blank=True, help_text="cm")
    weight = models.FloatField(null=True, blank=True, help_text="kg")
    age = models.PositiveIntegerField(null=True, blank=True)
    activity_level = models.CharField(
        max_length=20,
        choices=ActivityLevel.choices,
        default=ActivityLevel.MODERATELY_ACTIVE,
    )

    def __str__(self):
        return f"Profile({self.user.username})"

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.organizations.models import Organization


class AIChatMessage(BaseModel):
    class Role(models.TextChoices):
        USER = "user", "User"
        ASSISTANT = "assistant", "Assistant"

    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="ai_messages", db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="ai_messages"
    )
    role = models.CharField(max_length=10, choices=Role.choices, db_index=True)
    message = models.TextField()

    class Meta:
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["organization", "user", "created_at"]),
        ]

    def __str__(self):
        return f"[{self.role}] {self.user} — {self.message[:50]}"

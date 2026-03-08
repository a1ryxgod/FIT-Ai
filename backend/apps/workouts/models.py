import uuid
from datetime import date

from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.organizations.models import Organization


class WorkoutProgram(BaseModel):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="programs", db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="programs"
    )
    name = models.CharField(max_length=200)
    assigned_to = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_programs",
        help_text="User this program is assigned to (by trainer)",
    )

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["organization", "user"])]

    def __str__(self):
        return f"{self.name} ({self.organization})"


class Exercise(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    muscle_group = models.CharField(max_length=100)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return f"{self.name} [{self.muscle_group}]"


class ProgramExercise(BaseModel):
    program = models.ForeignKey(
        WorkoutProgram, on_delete=models.CASCADE, related_name="program_exercises"
    )
    exercise = models.ForeignKey(
        Exercise, on_delete=models.CASCADE, related_name="program_exercises"
    )
    order = models.PositiveIntegerField(default=0)
    target_sets = models.PositiveIntegerField(default=3)
    target_reps = models.PositiveIntegerField(default=10)
    target_weight = models.FloatField(default=0, help_text="kg")

    class Meta:
        ordering = ["order"]
        unique_together = ("program", "exercise")
        indexes = [models.Index(fields=["program", "order"])]

    def __str__(self):
        return f"{self.program.name} — {self.exercise.name} (#{self.order})"


class WorkoutSession(BaseModel):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="sessions", db_index=True
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="sessions"
    )
    program = models.ForeignKey(
        WorkoutProgram, on_delete=models.SET_NULL, null=True, blank=True, related_name="sessions"
    )
    date = models.DateField(default=date.today, db_index=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["organization", "user", "date"]),
            models.Index(fields=["organization", "user", "is_active"]),
        ]

    def __str__(self):
        return f"Session {self.id} — {self.user} ({self.date})"


class WorkoutSet(BaseModel):
    session = models.ForeignKey(WorkoutSession, on_delete=models.CASCADE, related_name="sets")
    exercise = models.ForeignKey(Exercise, on_delete=models.CASCADE, related_name="sets")
    reps = models.PositiveIntegerField()
    weight = models.FloatField(help_text="kg")

    class Meta:
        indexes = [models.Index(fields=["session", "exercise"])]

    def __str__(self):
        return f"{self.exercise.name}: {self.reps}x{self.weight}kg"

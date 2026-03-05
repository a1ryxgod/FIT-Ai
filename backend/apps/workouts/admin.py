from django.contrib import admin

from .models import Exercise, WorkoutProgram, WorkoutSession, WorkoutSet


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ["name", "muscle_group"]
    search_fields = ["name", "muscle_group"]


@admin.register(WorkoutProgram)
class WorkoutProgramAdmin(admin.ModelAdmin):
    list_display = ["name", "user", "organization", "created_at"]
    list_filter = ["organization"]


@admin.register(WorkoutSession)
class WorkoutSessionAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "organization", "date", "is_active"]
    list_filter = ["organization", "is_active"]


@admin.register(WorkoutSet)
class WorkoutSetAdmin(admin.ModelAdmin):
    list_display = ["session", "exercise", "reps", "weight"]

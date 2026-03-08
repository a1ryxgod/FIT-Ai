from django.contrib import admin

from .models import Exercise, ProgramExercise, WorkoutProgram, WorkoutSession, WorkoutSet


@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ["name", "muscle_group"]
    search_fields = ["name", "muscle_group"]


@admin.register(ProgramExercise)
class ProgramExerciseAdmin(admin.ModelAdmin):
    list_display = ["program", "exercise", "order", "target_sets", "target_reps", "target_weight"]
    list_filter = ["program"]


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

from rest_framework import serializers

from .models import Exercise, WorkoutProgram, WorkoutSession, WorkoutSet


class ExerciseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exercise
        fields = ["id", "name", "muscle_group"]


class WorkoutSetSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = WorkoutSet
        fields = ["id", "exercise", "exercise_id", "reps", "weight"]


class WorkoutSessionSerializer(serializers.ModelSerializer):
    sets = WorkoutSetSerializer(many=True, read_only=True)
    user_username = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = WorkoutSession
        fields = ["id", "program", "date", "is_active", "sets", "created_at", "user_username"]


class WorkoutProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkoutProgram
        fields = ["id", "name", "created_at"]


class StartSessionSerializer(serializers.Serializer):
    program_id = serializers.UUIDField(required=False, allow_null=True)


class AddSetSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    exercise_id = serializers.UUIDField()
    reps = serializers.IntegerField(min_value=1)
    weight = serializers.FloatField(min_value=0)

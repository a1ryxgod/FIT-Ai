from rest_framework import serializers

from .models import Exercise, ProgramExercise, WorkoutProgram, WorkoutSession, WorkoutSet


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


class ProgramExerciseSerializer(serializers.ModelSerializer):
    exercise = ExerciseSerializer(read_only=True)
    exercise_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = ProgramExercise
        fields = [
            "id", "exercise", "exercise_id", "order",
            "target_sets", "target_reps", "target_weight",
        ]


class WorkoutProgramSerializer(serializers.ModelSerializer):
    program_exercises = ProgramExerciseSerializer(many=True, read_only=True)
    exercise_count = serializers.SerializerMethodField()
    assigned_to_username = serializers.CharField(
        source="assigned_to.username", read_only=True, allow_null=True, default=None,
    )
    created_by = serializers.CharField(source="user.username", read_only=True)

    class Meta:
        model = WorkoutProgram
        fields = [
            "id", "name", "created_at", "program_exercises",
            "exercise_count", "assigned_to", "assigned_to_username", "created_by",
        ]
        read_only_fields = ["assigned_to"]

    def get_exercise_count(self, obj):
        return obj.program_exercises.count()


class StartSessionSerializer(serializers.Serializer):
    program_id = serializers.UUIDField(required=False, allow_null=True)


class AddSetSerializer(serializers.Serializer):
    session_id = serializers.UUIDField()
    exercise_id = serializers.UUIDField()
    reps = serializers.IntegerField(min_value=1)
    weight = serializers.FloatField(min_value=0)


class ReorderExercisesSerializer(serializers.Serializer):
    exercise_ids = serializers.ListField(child=serializers.UUIDField())


# --- Trainer serializers ---

class TrainerClientSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    username = serializers.CharField()
    email = serializers.EmailField()
    last_workout_date = serializers.DateField(allow_null=True)
    workouts_this_week = serializers.IntegerField()
    total_sessions = serializers.IntegerField()


class TrainerCreateProgramSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=200)
    assigned_to = serializers.UUIDField()


class AssignTrainerSerializer(serializers.Serializer):
    trainer_id = serializers.UUIDField()
    member_id = serializers.UUIDField()

from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsOrganizationMember

from . import services
from .models import Exercise, WorkoutProgram, WorkoutSession, WorkoutSet
from .serializers import (
    AddSetSerializer,
    ExerciseSerializer,
    StartSessionSerializer,
    WorkoutProgramSerializer,
    WorkoutSessionSerializer,
    WorkoutSetSerializer,
)


class WorkoutProgramViewSet(ModelViewSet):
    permission_classes = [IsOrganizationMember]
    serializer_class = WorkoutProgramSerializer

    def get_queryset(self):
        return WorkoutProgram.objects.filter(
            organization=self.request.organization,
            user=self.request.user,
            is_deleted=False,
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, organization=self.request.organization)


class ExerciseListView(ListAPIView):
    permission_classes = [IsOrganizationMember]
    serializer_class = ExerciseSerializer
    search_fields = ["name", "muscle_group"]
    queryset = Exercise.objects.all()
    pagination_class = None  # Повертаємо всі вправи без пагінації


class StartSessionView(APIView):
    permission_classes = [IsOrganizationMember]

    def post(self, request):
        serializer = StartSessionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        session = services.start_session(
            user=request.user,
            organization=request.organization,
            program_id=serializer.validated_data.get("program_id"),
        )
        return Response(WorkoutSessionSerializer(session).data, status=status.HTTP_201_CREATED)


class AddSetView(APIView):
    permission_classes = [IsOrganizationMember]

    def post(self, request):
        serializer = AddSetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workout_set = services.add_set(
            session_id=serializer.validated_data["session_id"],
            exercise_id=serializer.validated_data["exercise_id"],
            reps=serializer.validated_data["reps"],
            weight=serializer.validated_data["weight"],
            user=request.user,
            organization=request.organization,
        )
        return Response(WorkoutSetSerializer(workout_set).data, status=status.HTTP_201_CREATED)


class PersonalRecordsView(APIView):
    permission_classes = [IsOrganizationMember]

    def get(self, request):
        from django.db.models import Max

        best_per_exercise = (
            WorkoutSet.objects
            .filter(
                session__user=request.user,
                session__organization=request.organization,
                session__is_deleted=False,
            )
            .values("exercise__id", "exercise__name", "exercise__muscle_group")
            .annotate(best_weight=Max("weight"))
            .order_by("-best_weight")[:15]
        )

        result = []
        for row in best_per_exercise:
            best_set = (
                WorkoutSet.objects
                .filter(
                    session__user=request.user,
                    session__organization=request.organization,
                    session__is_deleted=False,
                    exercise__id=row["exercise__id"],
                    weight=row["best_weight"],
                )
                .select_related("session")
                .order_by("-session__date")
                .first()
            )
            if best_set:
                one_rm = round(best_set.weight * (1 + best_set.reps / 30), 1)
                result.append({
                    "exercise_id": str(row["exercise__id"]),
                    "exercise_name": row["exercise__name"],
                    "muscle_group": row["exercise__muscle_group"],
                    "best_weight": best_set.weight,
                    "best_reps": best_set.reps,
                    "estimated_1rm": one_rm,
                    "date": best_set.session.date,
                })

        return Response(result)


class WorkoutHistoryView(ListAPIView):
    permission_classes = [IsOrganizationMember]
    serializer_class = WorkoutSessionSerializer

    def get_queryset(self):
        is_admin = self.request.membership.role in ("owner", "admin")
        show_all = self.request.query_params.get("all") == "1"

        qs = WorkoutSession.objects.filter(
            organization=self.request.organization,
            is_deleted=False,
        ).prefetch_related("sets__exercise")

        if is_admin and show_all:
            return qs.select_related("user").order_by("-date")
        return qs.filter(user=self.request.user).order_by("-date")

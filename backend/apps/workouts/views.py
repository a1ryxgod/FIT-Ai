from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsOrganizationMember

from . import services
from .models import Exercise, WorkoutProgram, WorkoutSession
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


class WorkoutHistoryView(ListAPIView):
    permission_classes = [IsOrganizationMember]
    serializer_class = WorkoutSessionSerializer

    def get_queryset(self):
        return (
            WorkoutSession.objects.filter(
                organization=self.request.organization,
                user=self.request.user,
                is_deleted=False,
            )
            .prefetch_related("sets__exercise")
            .order_by("-date")
        )

from django.db.models import Max, Q, Subquery, OuterRef

from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet

from apps.core.permissions import IsOrganizationMember

from . import services
from .models import Exercise, ProgramExercise, WorkoutProgram, WorkoutSession, WorkoutSet
from .serializers import (
    AddSetSerializer,
    ExerciseSerializer,
    ProgramExerciseSerializer,
    ReorderExercisesSerializer,
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
            is_deleted=False,
        ).filter(
            Q(user=self.request.user) | Q(assigned_to=self.request.user)
        ).prefetch_related("program_exercises__exercise")

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

        # Trainer can view assigned client's sessions
        client_id = self.request.query_params.get("client_id")
        if role == "trainer" and client_id:
            from apps.organizations.models import Membership
            if Membership.objects.filter(
                organization=self.request.organization,
                user_id=client_id,
                trainer=self.request.user,
            ).exists():
                return qs.filter(user_id=client_id).order_by("-date")

        return qs.filter(user=self.request.user).order_by("-date")


# --- Program Exercise CRUD ---

class ProgramExerciseListCreateView(APIView):
    permission_classes = [IsOrganizationMember]

    def _get_program(self, request, program_id):
        return WorkoutProgram.objects.get(
            pk=program_id,
            organization=request.organization,
            is_deleted=False,
            user=request.user,
        )

    def get(self, request, program_id):
        try:
            program = WorkoutProgram.objects.get(
                pk=program_id,
                organization=request.organization,
                is_deleted=False,
            )
        except WorkoutProgram.DoesNotExist:
            return Response({"detail": "Program not found."}, status=status.HTTP_404_NOT_FOUND)

        # User can view if they own or are assigned
        if program.user != request.user and program.assigned_to != request.user:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        exercises = ProgramExercise.objects.filter(
            program=program, is_deleted=False
        ).select_related("exercise").order_by("order")
        return Response(ProgramExerciseSerializer(exercises, many=True).data)

    def post(self, request, program_id):
        try:
            program = self._get_program(request, program_id)
        except WorkoutProgram.DoesNotExist:
            return Response({"detail": "Program not found."}, status=status.HTTP_404_NOT_FOUND)

        serializer = ProgramExerciseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        max_order = ProgramExercise.objects.filter(
            program=program, is_deleted=False
        ).aggregate(m=Max("order"))["m"] or 0

        pe = ProgramExercise.objects.create(
            program=program,
            exercise_id=serializer.validated_data["exercise_id"],
            order=max_order + 1,
            target_sets=serializer.validated_data.get("target_sets", 3),
            target_reps=serializer.validated_data.get("target_reps", 10),
            target_weight=serializer.validated_data.get("target_weight", 0),
        )
        pe.exercise  # force load
        return Response(
            ProgramExerciseSerializer(ProgramExercise.objects.select_related("exercise").get(pk=pe.pk)).data,
            status=status.HTTP_201_CREATED,
        )


class ProgramExerciseDetailView(APIView):
    permission_classes = [IsOrganizationMember]

    def _get_pe(self, request, program_id, pk):
        return ProgramExercise.objects.select_related("exercise").get(
            pk=pk,
            program_id=program_id,
            program__user=request.user,
            program__organization=request.organization,
            is_deleted=False,
        )

    def patch(self, request, program_id, pk):
        try:
            pe = self._get_pe(request, program_id, pk)
        except ProgramExercise.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        for field in ("target_sets", "target_reps", "target_weight", "order"):
            if field in request.data:
                setattr(pe, field, request.data[field])
        pe.save()
        return Response(ProgramExerciseSerializer(pe).data)

    def delete(self, request, program_id, pk):
        try:
            pe = self._get_pe(request, program_id, pk)
        except ProgramExercise.DoesNotExist:
            return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

        pe.soft_delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ReorderProgramExercisesView(APIView):
    permission_classes = [IsOrganizationMember]

    def post(self, request, program_id):
        serializer = ReorderExercisesSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        try:
            program = WorkoutProgram.objects.get(
                pk=program_id, user=request.user,
                organization=request.organization, is_deleted=False,
            )
        except WorkoutProgram.DoesNotExist:
            return Response({"detail": "Program not found."}, status=status.HTTP_404_NOT_FOUND)

        ids = serializer.validated_data["exercise_ids"]
        for i, pe_id in enumerate(ids):
            ProgramExercise.objects.filter(pk=pe_id, program=program).update(order=i)

        return Response({"status": "ok"})


class LastPerformanceView(APIView):
    permission_classes = [IsOrganizationMember]

    def get(self, request):
        exercise_ids_raw = request.query_params.get("exercise_ids", "")
        if not exercise_ids_raw:
            return Response({})

        exercise_ids = [eid.strip() for eid in exercise_ids_raw.split(",") if eid.strip()]

        # For each exercise, find the latest set by this user
        result = {}
        for eid in exercise_ids:
            last_set = (
                WorkoutSet.objects
                .filter(
                    exercise_id=eid,
                    session__user=request.user,
                    session__organization=request.organization,
                    session__is_deleted=False,
                )
                .select_related("session")
                .order_by("-session__date", "-created_at")
                .first()
            )
            if last_set:
                result[str(eid)] = {
                    "weight": last_set.weight,
                    "reps": last_set.reps,
                    "date": str(last_set.session.date),
                }

        return Response(result)

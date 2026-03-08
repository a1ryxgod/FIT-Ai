from datetime import timedelta

from django.db.models import Count, Max, Q
from django.utils import timezone

from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin, IsTrainer
from apps.organizations.models import Membership

from .models import WorkoutProgram, WorkoutSession, WorkoutSet
from .serializers import (
    AssignTrainerSerializer,
    TrainerClientSerializer,
    TrainerCreateProgramSerializer,
    WorkoutSessionSerializer,
)


class TrainerClientsView(APIView):
    permission_classes = [IsTrainer]

    def get(self, request):
        org = request.organization
        week_start = timezone.now().date() - timedelta(days=timezone.now().weekday())

        memberships = Membership.objects.filter(
            organization=org,
            trainer=request.user,
            is_deleted=False,
        ).select_related("user")

        clients = []
        for m in memberships:
            user = m.user
            sessions_qs = WorkoutSession.objects.filter(
                user=user, organization=org, is_deleted=False,
            )
            last_date = sessions_qs.aggregate(d=Max("date"))["d"]
            week_count = sessions_qs.filter(date__gte=week_start).count()
            total = sessions_qs.count()

            clients.append({
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "last_workout_date": last_date,
                "workouts_this_week": week_count,
                "total_sessions": total,
            })

        return Response(TrainerClientSerializer(clients, many=True).data)


class TrainerClientSessionsView(ListAPIView):
    permission_classes = [IsTrainer]
    serializer_class = WorkoutSessionSerializer

    def get_queryset(self):
        client_id = self.kwargs["client_id"]
        org = self.request.organization

        # Verify trainer-client relationship (or admin/owner)
        role = self.request.membership.role
        if role not in ("owner", "admin"):
            if not Membership.objects.filter(
                organization=org, user_id=client_id, trainer=self.request.user,
            ).exists():
                return WorkoutSession.objects.none()

        return (
            WorkoutSession.objects
            .filter(user_id=client_id, organization=org, is_deleted=False)
            .prefetch_related("sets__exercise")
            .order_by("-date")
        )


class TrainerClientPRsView(APIView):
    permission_classes = [IsTrainer]

    def get(self, request, client_id):
        org = request.organization

        # Verify trainer-client relationship (or admin/owner)
        role = request.membership.role
        if role not in ("owner", "admin"):
            if not Membership.objects.filter(
                organization=org, user_id=client_id, trainer=request.user,
            ).exists():
                return Response([])

        best_per_exercise = (
            WorkoutSet.objects
            .filter(
                session__user_id=client_id,
                session__organization=org,
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
                    session__user_id=client_id,
                    session__organization=org,
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


class TrainerCreateProgramView(APIView):
    permission_classes = [IsTrainer]

    def post(self, request):
        serializer = TrainerCreateProgramSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        org = request.organization
        assigned_to_id = serializer.validated_data["assigned_to"]

        # Verify client belongs to this trainer (or user is admin/owner)
        role = request.membership.role
        if role not in ("owner", "admin"):
            if not Membership.objects.filter(
                organization=org, user_id=assigned_to_id, trainer=request.user,
            ).exists():
                return Response(
                    {"detail": "This user is not your client."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        program = WorkoutProgram.objects.create(
            organization=org,
            user=request.user,
            name=serializer.validated_data["name"],
            assigned_to_id=assigned_to_id,
        )

        from .serializers import WorkoutProgramSerializer
        return Response(
            WorkoutProgramSerializer(program).data,
            status=status.HTTP_201_CREATED,
        )


class TrainerAssignProgramView(APIView):
    permission_classes = [IsTrainer]

    def post(self, request, program_id):
        client_id = request.data.get("client_id")
        if not client_id:
            return Response(
                {"detail": "client_id is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        org = request.organization

        try:
            program = WorkoutProgram.objects.get(
                pk=program_id, user=request.user, organization=org, is_deleted=False,
            )
        except WorkoutProgram.DoesNotExist:
            return Response({"detail": "Program not found."}, status=status.HTTP_404_NOT_FOUND)

        # Verify client relationship
        role = request.membership.role
        if role not in ("owner", "admin"):
            if not Membership.objects.filter(
                organization=org, user_id=client_id, trainer=request.user,
            ).exists():
                return Response(
                    {"detail": "This user is not your client."},
                    status=status.HTTP_403_FORBIDDEN,
                )

        program.assigned_to_id = client_id
        program.save(update_fields=["assigned_to", "updated_at"])

        from .serializers import WorkoutProgramSerializer
        return Response(WorkoutProgramSerializer(program).data)


class AssignTrainerView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = AssignTrainerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        org = request.organization
        trainer_id = serializer.validated_data["trainer_id"]
        member_id = serializer.validated_data["member_id"]

        # Verify trainer exists in org with trainer/admin/owner role
        trainer_membership = Membership.objects.filter(
            organization=org, user_id=trainer_id,
            role__in=["owner", "admin", "trainer"],
        ).first()
        if not trainer_membership:
            return Response(
                {"detail": "Trainer not found in organization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Update member's trainer
        updated = Membership.objects.filter(
            organization=org, user_id=member_id,
        ).update(trainer_id=trainer_id)

        if not updated:
            return Response(
                {"detail": "Member not found in organization."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response({"status": "ok"})

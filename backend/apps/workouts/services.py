from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import WorkoutProgram, WorkoutSession, WorkoutSet


@transaction.atomic
def start_session(user, organization, program_id=None):
    WorkoutSession.objects.filter(
        user=user,
        organization=organization,
        is_active=True,
    ).update(is_active=False)

    program = None
    if program_id:
        program = get_object_or_404(
            WorkoutProgram.objects.filter(
                Q(user=user) | Q(assigned_to=user)
            ),
            pk=program_id,
            organization=organization,
        )

    return WorkoutSession.objects.create(
        user=user,
        organization=organization,
        program=program,
    )


@transaction.atomic
def add_set(session_id, exercise_id, reps, weight, user, organization):
    session = get_object_or_404(
        WorkoutSession, pk=session_id, user=user, organization=organization
    )
    return WorkoutSet.objects.create(
        session=session,
        exercise_id=exercise_id,
        reps=reps,
        weight=weight,
    )

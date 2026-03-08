from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views
from . import trainer_views

router = DefaultRouter()
router.register("programs", views.WorkoutProgramViewSet, basename="programs")

urlpatterns = [
    path("", include(router.urls)),
    path("workouts/start/", views.StartSessionView.as_view(), name="start-session"),
    path("workouts/add-set/", views.AddSetView.as_view(), name="add-set"),
    path("workouts/history/", views.WorkoutHistoryView.as_view(), name="workout-history"),
    path("workouts/prs/", views.PersonalRecordsView.as_view(), name="workout-prs"),
    path("workouts/last-performance/", views.LastPerformanceView.as_view(), name="last-performance"),
    path("exercises/", views.ExerciseListView.as_view(), name="exercise-list"),
    # Program exercises
    path("programs/<uuid:program_id>/exercises/", views.ProgramExerciseListCreateView.as_view(), name="program-exercises"),
    path("programs/<uuid:program_id>/exercises/<uuid:pk>/", views.ProgramExerciseDetailView.as_view(), name="program-exercise-detail"),
    path("programs/<uuid:program_id>/exercises/reorder/", views.ReorderProgramExercisesView.as_view(), name="program-exercises-reorder"),
    # Trainer
    path("trainer/clients/", trainer_views.TrainerClientsView.as_view(), name="trainer-clients"),
    path("trainer/clients/<uuid:client_id>/sessions/", trainer_views.TrainerClientSessionsView.as_view(), name="trainer-client-sessions"),
    path("trainer/clients/<uuid:client_id>/prs/", trainer_views.TrainerClientPRsView.as_view(), name="trainer-client-prs"),
    path("trainer/programs/", trainer_views.TrainerCreateProgramView.as_view(), name="trainer-create-program"),
    path("trainer/programs/<uuid:program_id>/assign/", trainer_views.TrainerAssignProgramView.as_view(), name="trainer-assign-program"),
    path("trainer/assign/", trainer_views.AssignTrainerView.as_view(), name="assign-trainer"),
]

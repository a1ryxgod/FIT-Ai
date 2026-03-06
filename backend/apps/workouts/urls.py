from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("programs", views.WorkoutProgramViewSet, basename="programs")

urlpatterns = [
    path("", include(router.urls)),
    path("workouts/start/", views.StartSessionView.as_view(), name="start-session"),
    path("workouts/add-set/", views.AddSetView.as_view(), name="add-set"),
    path("workouts/history/", views.WorkoutHistoryView.as_view(), name="workout-history"),
    path("workouts/prs/", views.PersonalRecordsView.as_view(), name="workout-prs"),
    path("exercises/", views.ExerciseListView.as_view(), name="exercise-list"),
]

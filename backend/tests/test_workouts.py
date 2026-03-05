import pytest

from apps.workouts.models import Exercise, WorkoutProgram, WorkoutSession

pytestmark = pytest.mark.django_db


@pytest.fixture
def exercise(db):
    return Exercise.objects.create(name="Bench Press", muscle_group="Chest")


class TestWorkoutIsolation:
    def test_user_sees_only_own_programs(self, auth_client, auth_client2, user, org, user2, org2):
        WorkoutProgram.objects.create(name="Program A", user=user, organization=org)
        WorkoutProgram.objects.create(name="Program B", user=user2, organization=org2)
        response = auth_client.get("/api/programs/")
        assert response.status_code == 200
        names = [r["name"] for r in response.data["results"]]
        assert "Program A" in names
        assert "Program B" not in names

    def test_create_program(self, auth_client):
        response = auth_client.post("/api/programs/", {"name": "My Program"})
        assert response.status_code == 201

    def test_start_session(self, auth_client):
        response = auth_client.post("/api/workouts/start/", {})
        assert response.status_code == 201
        assert response.data["is_active"] is True

    def test_start_session_deactivates_previous(self, auth_client, user, org):
        auth_client.post("/api/workouts/start/", {})
        auth_client.post("/api/workouts/start/", {})
        active_count = WorkoutSession.objects.filter(
            user=user, organization=org, is_active=True
        ).count()
        assert active_count == 1

    def test_add_set(self, auth_client, exercise):
        session_resp = auth_client.post("/api/workouts/start/", {})
        session_id = session_resp.data["id"]
        response = auth_client.post("/api/workouts/add-set/", {
            "session_id": session_id,
            "exercise_id": str(exercise.id),
            "reps": 10,
            "weight": 80.0,
        })
        assert response.status_code == 201

    def test_cannot_add_set_to_other_user_session(self, auth_client2, exercise, user, org):
        session = WorkoutSession.objects.create(user=user, organization=org)
        response = auth_client2.post("/api/workouts/add-set/", {
            "session_id": str(session.id),
            "exercise_id": str(exercise.id),
            "reps": 5,
            "weight": 50.0,
        })
        assert response.status_code in (403, 404)

    def test_workout_history(self, auth_client, user, org):
        WorkoutSession.objects.create(user=user, organization=org)
        WorkoutSession.objects.create(user=user, organization=org)
        response = auth_client.get("/api/workouts/history/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 2

    def test_history_org_isolation(self, auth_client2, user, org):
        WorkoutSession.objects.create(user=user, organization=org)
        response = auth_client2.get("/api/workouts/history/")
        assert response.status_code == 200
        assert len(response.data["results"]) == 0

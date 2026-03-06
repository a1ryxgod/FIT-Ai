from django.urls import path

from . import views

urlpatterns = [
    path("ai/chat/", views.AIChatView.as_view(), name="ai-chat"),
    path("ai/analyze-workouts/", views.AIWorkoutAnalyzeView.as_view(), name="ai-analyze-workouts"),
    path("ai/history/", views.AIChatHistoryView.as_view(), name="ai-history"),
]

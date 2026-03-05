from django.urls import path

from . import views

urlpatterns = [
    path("weight/", views.WeightLogView.as_view(), name="weight-log"),
]

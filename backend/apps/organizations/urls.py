from django.urls import path

from . import views

urlpatterns = [
    path("orgs/", views.OrganizationListCreateView.as_view(), name="org-list"),
    path("orgs/<uuid:pk>/invite/", views.InviteUserView.as_view(), name="org-invite"),
    path("orgs/<uuid:pk>/switch/", views.SwitchOrganizationView.as_view(), name="org-switch"),
]

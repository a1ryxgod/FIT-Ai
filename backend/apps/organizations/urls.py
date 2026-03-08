from django.urls import path

from . import views

urlpatterns = [
    path("orgs/", views.OrganizationListCreateView.as_view(), name="org-list"),
    path("orgs/join/", views.JoinOrganizationView.as_view(), name="org-join"),
    path("orgs/<uuid:pk>/members/", views.OrgMembersView.as_view(), name="org-members"),
    path("orgs/<uuid:pk>/invite/", views.InviteUserView.as_view(), name="org-invite"),
    path("orgs/<uuid:pk>/switch/", views.SwitchOrganizationView.as_view(), name="org-switch"),
    path("orgs/<uuid:pk>/regenerate-code/", views.RegenerateJoinCodeView.as_view(), name="org-regenerate-code"),
]

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.permissions import IsAdmin, IsOrganizationMember

from . import services
from .models import Membership, Organization
from .serializers import InviteSerializer, MembershipSerializer, OrganizationSerializer


class OrganizationListCreateView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrganizationSerializer

    def get_queryset(self):
        return services.get_user_organizations(self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org = services.create_organization(
            user=request.user,
            name=serializer.validated_data["name"],
        )
        return Response(OrganizationSerializer(org).data, status=status.HTTP_201_CREATED)


class InviteUserView(APIView):
    permission_classes = [IsAuthenticated, IsOrganizationMember, IsAdmin]

    def post(self, request, pk):
        org = get_object_or_404(Organization, pk=pk, is_active=True, is_deleted=False)
        serializer = InviteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["username"]
        role = serializer.validated_data["role"]
        membership = services.invite_user(org, user, role)
        return Response(MembershipSerializer(membership).data, status=status.HTTP_200_OK)


class SwitchOrganizationView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        org = get_object_or_404(Organization, pk=pk, is_active=True, is_deleted=False)
        membership = get_object_or_404(Membership, user=request.user, organization=org)
        refresh = RefreshToken.for_user(request.user)
        refresh["org_id"] = str(org.id)
        refresh["role"] = membership.role
        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "org_id": str(org.id),
            "role": membership.role,
        })

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView, ListCreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.permissions import IsAdmin, IsOrganizationMember

from . import services
from .models import Membership, Organization
from .models import generate_join_code
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


class OrgMembersView(ListAPIView):
    permission_classes = [IsOrganizationMember, IsAdmin]
    serializer_class = MembershipSerializer

    def get_queryset(self):
        org = get_object_or_404(Organization, pk=self.kwargs["pk"], is_active=True, is_deleted=False)
        return Membership.objects.filter(
            organization=org,
            is_deleted=False,
        ).select_related("user").order_by("role", "created_at")


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


class JoinOrganizationView(APIView):
    """POST /api/orgs/join/ — join org with a join_code, become member."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        join_code = request.data.get("join_code", "").strip().upper()
        if not join_code:
            return Response({"detail": "join_code is required."}, status=status.HTTP_400_BAD_REQUEST)

        org = Organization.objects.filter(
            join_code=join_code, is_active=True, is_deleted=False,
        ).first()
        if not org:
            return Response({"detail": "Невірний код. Перевірте та спробуйте знову."}, status=status.HTTP_404_NOT_FOUND)

        membership, created = Membership.objects.get_or_create(
            user=request.user,
            organization=org,
            defaults={"role": Membership.Role.MEMBER},
        )

        refresh = RefreshToken.for_user(request.user)
        refresh["org_id"] = str(org.id)
        refresh["role"] = membership.role

        return Response({
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "organization": OrganizationSerializer(org).data,
            "role": membership.role,
            "created": created,
        }, status=status.HTTP_200_OK)


class RegenerateJoinCodeView(APIView):
    """POST /api/orgs/<pk>/regenerate-code/ — admin regenerates the join code."""
    permission_classes = [IsAuthenticated, IsOrganizationMember, IsAdmin]

    def post(self, request, pk):
        org = get_object_or_404(Organization, pk=pk, is_active=True, is_deleted=False)
        org.join_code = generate_join_code()
        org.save(update_fields=["join_code"])
        return Response({"join_code": org.join_code})

from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from . import services
from .models import Profile
from .serializers import ProfileSerializer, RegisterSerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        org_name = data.get("organization_name", "").strip()

        if org_name:
            user, org = services.register_user(
                username=data["username"],
                email=data["email"],
                password=data["password"],
                organization_name=org_name,
            )
            refresh = RefreshToken.for_user(user)
            refresh["org_id"] = str(org.id)
            refresh["role"] = "owner"
            org_data = {"id": str(org.id), "name": org.name, "slug": org.slug, "join_code": org.join_code}
        else:
            user = services.register_user_only(
                username=data["username"],
                email=data["email"],
                password=data["password"],
            )
            refresh = RefreshToken.for_user(user)
            refresh["org_id"] = None
            refresh["role"] = None
            org_data = None

        return Response(
            {
                "user": {
                    "id": str(user.id),
                    "username": user.username,
                    "email": user.email,
                },
                "organization": org_data,
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
            },
            status=status.HTTP_201_CREATED,
        )


class ProfileView(RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        profile, _ = Profile.objects.get_or_create(user=self.request.user)
        return profile

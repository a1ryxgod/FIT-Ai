from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from apps.organizations.models import Membership

from .models import Profile

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        membership = (
            Membership.objects.filter(
                user=user,
                organization__is_active=True,
                organization__is_deleted=False,
            )
            .select_related("organization")
            .order_by("-organization__created_at")
            .first()
        )
        if membership:
            token["org_id"] = str(membership.organization.id)
            token["role"] = membership.role
        else:
            token["org_id"] = None
            token["role"] = None
        return token


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    organization_name = serializers.CharField(max_length=200)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already taken.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = Profile
        fields = ["id", "username", "email", "height", "weight", "age", "activity_level", "calorie_goal", "protein_goal", "carbs_goal", "fat_goal", "updated_at"]
        read_only_fields = ["id", "username", "email", "updated_at"]

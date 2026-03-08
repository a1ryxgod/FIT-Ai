from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Membership, Organization

User = get_user_model()


class OrganizationSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source="owner.username", read_only=True)

    class Meta:
        model = Organization
        fields = ["id", "name", "slug", "owner_username", "is_active", "join_code", "created_at"]
        read_only_fields = ["id", "slug", "owner_username", "join_code", "created_at"]


class MembershipSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    user_id = serializers.UUIDField(source="user.id", read_only=True)
    trainer_id = serializers.UUIDField(source="trainer.id", read_only=True, allow_null=True, default=None)
    trainer_username = serializers.CharField(source="trainer.username", read_only=True, allow_null=True, default=None)

    class Meta:
        model = Membership
        fields = ["id", "user_id", "username", "email", "role", "trainer_id", "trainer_username", "created_at"]
        read_only_fields = ["id", "user_id", "username", "email", "trainer_id", "trainer_username", "created_at"]


class InviteSerializer(serializers.Serializer):
    username = serializers.CharField()
    role = serializers.ChoiceField(choices=Membership.Role.choices, default=Membership.Role.MEMBER)

    def validate_username(self, value):
        try:
            return User.objects.get(username=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found.")

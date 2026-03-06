from rest_framework import serializers

from .models import AIChatMessage


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=1000, min_length=1)


class AIChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIChatMessage
        fields = ["id", "role", "message", "created_at"]
        read_only_fields = ["id", "role", "created_at"]

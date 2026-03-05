from rest_framework import serializers

from .models import WeightLog


class WeightLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeightLog
        fields = ["id", "weight", "date", "created_at"]
        read_only_fields = ["id", "created_at"]

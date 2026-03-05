from rest_framework import serializers

from .models import FoodLog, FoodProduct


class FoodProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodProduct
        fields = ["id", "name", "calories", "protein", "fats", "carbs"]


class FoodLogSerializer(serializers.ModelSerializer):
    product = FoodProductSerializer(read_only=True)
    product_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = FoodLog
        fields = ["id", "product", "product_id", "grams", "date", "created_at"]
        read_only_fields = ["id", "created_at"]


class LogFoodSerializer(serializers.Serializer):
    product_id = serializers.UUIDField()
    grams = serializers.FloatField(min_value=0.1)
    date = serializers.DateField(required=False)


class NutritionTotalsSerializer(serializers.Serializer):
    calories = serializers.FloatField()
    protein = serializers.FloatField()
    fats = serializers.FloatField()
    carbs = serializers.FloatField()


class TodaySummarySerializer(serializers.Serializer):
    logs = FoodLogSerializer(many=True)
    totals = NutritionTotalsSerializer()

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.core.permissions import IsOrganizationMember

from . import services
from .models import FoodProduct
from .serializers import (
    FoodLogSerializer,
    FoodProductSerializer,
    LogFoodSerializer,
    TodaySummarySerializer,
)


class FoodProductViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsOrganizationMember]
    serializer_class = FoodProductSerializer
    search_fields = ["name"]
    queryset = FoodProduct.objects.all()


class FoodLogCreateView(APIView):
    permission_classes = [IsOrganizationMember]

    def post(self, request):
        serializer = LogFoodSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = services.log_food(
            user=request.user,
            organization=request.organization,
            product_id=serializer.validated_data["product_id"],
            grams=serializer.validated_data["grams"],
            log_date=serializer.validated_data.get("date"),
        )
        return Response(FoodLogSerializer(log).data, status=status.HTTP_201_CREATED)


class TodayFoodView(APIView):
    permission_classes = [IsOrganizationMember]

    def get(self, request):
        logs, totals = services.get_today_summary(
            user=request.user,
            organization=request.organization,
        )
        data = TodaySummarySerializer({"logs": logs, "totals": totals}).data
        return Response(data)

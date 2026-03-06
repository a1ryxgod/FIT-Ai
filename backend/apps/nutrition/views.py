from rest_framework import status
from rest_framework.filters import SearchFilter
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ReadOnlyModelViewSet

from apps.core.pagination import StandardPagination
from apps.core.permissions import IsOrganizationMember

from . import services
from .models import FoodLog, FoodProduct
from .serializers import (
    FoodLogSerializer,
    FoodProductSerializer,
    LogFoodSerializer,
    TodaySummarySerializer,
)


class FoodProductViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsOrganizationMember]
    serializer_class = FoodProductSerializer
    filter_backends = [SearchFilter]
    search_fields = ["name", "brand"]
    queryset = FoodProduct.objects.all()


class FoodHistoryView(ListAPIView):
    permission_classes = [IsOrganizationMember]
    serializer_class = FoodLogSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return FoodLog.objects.filter(
            organization=self.request.organization,
            user=self.request.user,
            is_deleted=False,
        ).select_related("product").order_by("-date", "-created_at")


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

from rest_framework import status
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response

from apps.core.permissions import IsOrganizationMember

from . import services
from .models import WeightLog
from .serializers import WeightLogSerializer


class WeightLogView(ListCreateAPIView):
    permission_classes = [IsOrganizationMember]
    serializer_class = WeightLogSerializer

    def get_queryset(self):
        return WeightLog.objects.filter(
            organization=self.request.organization,
            user=self.request.user,
            is_deleted=False,
        ).order_by("-date")

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        log = services.log_weight(
            user=request.user,
            organization=request.organization,
            weight=serializer.validated_data["weight"],
            log_date=serializer.validated_data.get("date"),
        )
        return Response(WeightLogSerializer(log).data, status=status.HTTP_201_CREATED)

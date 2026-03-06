from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.pagination import StandardPagination
from apps.core.permissions import IsOrganizationMember

from . import services
from .models import AIChatMessage
from .serializers import AIChatMessageSerializer, ChatRequestSerializer


class AIChatView(APIView):
    permission_classes = [IsOrganizationMember]

    def post(self, request):
        serializer = ChatRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reply = services.chat(
            user=request.user,
            organization=request.organization,
            user_message=serializer.validated_data["message"],
        )
        return Response({"reply": reply})


class AIWorkoutAnalyzeView(APIView):
    permission_classes = [IsOrganizationMember]

    def post(self, request):
        reply = services.analyze_workouts(
            user=request.user,
            organization=request.organization,
        )
        return Response({"reply": reply})


class AIChatHistoryView(ListAPIView):
    permission_classes = [IsOrganizationMember]
    serializer_class = AIChatMessageSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return AIChatMessage.objects.filter(
            user=self.request.user,
            organization=self.request.organization,
            is_deleted=False,
        )

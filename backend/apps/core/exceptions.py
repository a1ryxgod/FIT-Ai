import logging

from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


def custom_exception_handler(exc, context):
    if isinstance(exc, DjangoValidationError):
        exc = ValidationError(detail=exc.messages)

    response = exception_handler(exc, context)

    if response is None:
        logger.exception("Unhandled exception", exc_info=exc)
        return Response(
            {"error": "Internal server error", "details": str(exc)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    error_msg = str(getattr(exc, "default_detail", exc))
    response.data = {"error": error_msg, "details": response.data}
    return response

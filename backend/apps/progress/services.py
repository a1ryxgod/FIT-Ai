from datetime import date as date_type

from .models import WeightLog


def log_weight(user, organization, weight, log_date=None):
    return WeightLog.objects.create(
        user=user,
        organization=organization,
        weight=weight,
        date=log_date or date_type.today(),
    )

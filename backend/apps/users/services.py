from django.contrib.auth import get_user_model
from django.db import transaction

from apps.organizations.services import create_organization

from .models import Profile

User = get_user_model()


@transaction.atomic
def register_user(username: str, email: str, password: str, organization_name: str):
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )
    Profile.objects.create(user=user)
    org = create_organization(user=user, name=organization_name)
    return user, org

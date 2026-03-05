from django.db import transaction

from .models import Membership, Organization


@transaction.atomic
def create_organization(user, name: str) -> Organization:
    org = Organization.objects.create(name=name, owner=user)
    Membership.objects.create(
        user=user,
        organization=org,
        role=Membership.Role.OWNER,
    )
    return org


@transaction.atomic
def invite_user(organization: Organization, user, role: str) -> Membership:
    membership, created = Membership.objects.get_or_create(
        user=user,
        organization=organization,
        defaults={"role": role},
    )
    if not created:
        membership.role = role
        membership.save(update_fields=["role", "updated_at"])
    return membership


def get_user_organizations(user):
    return Organization.objects.filter(
        memberships__user=user,
        is_active=True,
        is_deleted=False,
    ).select_related("owner")

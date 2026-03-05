from rest_framework.permissions import BasePermission


class IsOrganizationMember(BasePermission):
    message = "You are not a member of the active organization."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.organization is not None
            and request.membership is not None
        )


class IsOwner(BasePermission):
    message = "Only organization owners can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.membership and request.membership.role == "owner"
        )


class IsAdmin(BasePermission):
    message = "Only admins or owners can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.membership and request.membership.role in ("owner", "admin")
        )


class IsTrainer(BasePermission):
    message = "Only trainers, admins, or owners can perform this action."

    def has_permission(self, request, view):
        return bool(
            request.membership
            and request.membership.role in ("owner", "admin", "trainer")
        )


class IsObjectOwner(BasePermission):
    message = "You do not own this object."

    def has_object_permission(self, request, view, obj):
        return obj.user == request.user

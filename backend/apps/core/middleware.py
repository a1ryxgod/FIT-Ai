from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken


class OrganizationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.organization = None
        request.membership = None

        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        if auth_header.startswith("Bearer "):
            token_str = auth_header[7:]
            try:
                token = AccessToken(token_str)
                org_id = token.get("org_id")
                user_id = token.get("user_id")
                if org_id and user_id:
                    from apps.organizations.models import Membership

                    try:
                        membership = Membership.objects.select_related(
                            "organization", "user"
                        ).get(
                            user_id=user_id,
                            organization_id=org_id,
                            organization__is_active=True,
                            organization__is_deleted=False,
                        )
                        request.organization = membership.organization
                        request.membership = membership
                    except Membership.DoesNotExist:
                        pass
            except (TokenError, Exception):
                pass

        return self.get_response(request)

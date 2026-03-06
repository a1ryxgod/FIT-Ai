from django.contrib import admin

from .models import AIChatMessage


@admin.register(AIChatMessage)
class AIChatMessageAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "role", "message_preview", "created_at"]
    list_filter = ["role", "organization"]
    search_fields = ["user__username", "message"]
    readonly_fields = ["id", "created_at", "updated_at"]

    def message_preview(self, obj):
        return obj.message[:80] + "..." if len(obj.message) > 80 else obj.message

    message_preview.short_description = "Message"

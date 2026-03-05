from django.contrib import admin

from .models import WeightLog


@admin.register(WeightLog)
class WeightLogAdmin(admin.ModelAdmin):
    list_display = ["user", "organization", "weight", "date"]
    list_filter = ["organization", "date"]
    search_fields = ["user__username"]

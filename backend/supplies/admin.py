from django.contrib import admin
from .models import Supply

# Register your models here.
class SupplyAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit',)
    search_fields = ('name',)
    list_filter = ('unit',)
    ordering = ('name',)
admin.site.register(Supply, SupplyAdmin)


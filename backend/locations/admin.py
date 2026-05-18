from django.contrib import admin
from .models import Location

# Register your models here.
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'address', 'created_at', 'updated_at')
    search_fields = ('name', 'address')
    list_filter = ('name', 'address')
    ordering = ('name', 'address')

admin.site.register(Location, LocationAdmin)



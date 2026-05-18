from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from locations.views import LocationViewSet
from machines.views import MachineViewSet

# Crear un router centralizado
router = DefaultRouter() # -> Crea un router centralizado para registrar todas las vistas de la API
router.register(r'locations', LocationViewSet, 'locations')
router.register(r'machines', MachineViewSet, 'machines')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

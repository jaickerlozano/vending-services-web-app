from django.shortcuts import render
from rest_framework import viewsets
from .models import Machine
from .serializers import MachineSerializer

# Create your views here.
class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer
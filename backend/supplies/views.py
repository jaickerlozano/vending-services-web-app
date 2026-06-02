from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Supply, MachineSupplyInventory
from .serializers import SupplySerializer, MachineSupplyInventorySerializer

# Create your views here.
class SupplyViewSet(viewsets.ModelViewSet):
    queryset = Supply.objects.all()
    serializer_class = SupplySerializer

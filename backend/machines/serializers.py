from rest_framework import serializers
from .models import Machine

class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = ['id', 'type', 'name', 'model', 'location', 'status', 'created_at', 'updated_at']
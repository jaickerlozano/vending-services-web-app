from rest_framework import serializers
from .models import Supply, MachineSupplyInventory

class SupplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Supply
        fields = [
            'id', 'name', 'unit', 'cost_per_unit'
        ]


class MachineSupplyInventorySerializer(serializers.ModelSerializer):
    supply = SupplySerializer(read_only=True)
    supply_id = serializers.PrimaryKeyRelatedField(
        queryset=Supply.objects.all(), source='supply', write_only=True
    )

    class Meta:
        model = MachineSupplyInventory
        fields = [
            'id', 'machine', 'supply', 'supply_id', 'current_stock'
        ]


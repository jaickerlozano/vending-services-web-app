from decimal import Decimal

from django.db import IntegrityError
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Supply, MachineSupplyInventory
from machines.models import Machine
from locations.models import Location


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def create_location(**kwargs):
    defaults = {"name": "Test Location", "address": "123 Test St"}
    defaults.update(kwargs)
    return Location.objects.create(**defaults)


def create_machine(location=None, **kwargs):
    if location is None:
        location = create_location()
    defaults = {
        "name": "Machine A",
        "location": location,
    }
    defaults.update(kwargs)
    return Machine.objects.create(**defaults)


def create_supply(**kwargs):
    defaults = {
        "name": "Paper Cups",
        "unit": "pieces",
        "cost": Decimal("0.05"),
    }
    defaults.update(kwargs)
    return Supply.objects.create(**defaults)


def create_inventory(machine=None, supply=None, **kwargs):
    if machine is None:
        machine = create_machine()
    if supply is None:
        supply = create_supply()
    defaults = {"current_stock": 100}
    defaults.update(kwargs)
    return MachineSupplyInventory.objects.create(
        machine=machine, supply=supply, **defaults
    )


# ---------------------------------------------------------------------------
# 1. Supply model tests
# ---------------------------------------------------------------------------
class TestSupplyModel(TestCase):
    def test_create_supply(self):
        supply = create_supply(name="Cups", unit="pieces", cost=Decimal("0.10"))
        self.assertEqual(supply.name, "Cups")
        self.assertEqual(supply.unit, "pieces")
        self.assertEqual(supply.cost, Decimal("0.10"))

    def test_supply_str(self):
        supply = create_supply(name="Sugar", unit="grams")
        self.assertEqual(str(supply), "Sugar (Unit: grams)")

    def test_supply_ordering(self):
        supply_b = create_supply(name="B-Supply")
        supply_a = create_supply(name="A-Supply")
        supplies = list(Supply.objects.all())
        self.assertLess(
            supplies.index(supply_a),
            supplies.index(supply_b),
        )

    def test_supply_required_fields(self):
        """name, unit, and cost are all required."""
        with self.assertRaises(Exception):
            Supply.objects.create()


# ---------------------------------------------------------------------------
# 2. MachineSupplyInventory model tests
# ---------------------------------------------------------------------------
class TestMachineSupplyInventoryModel(TestCase):
    def setUp(self):
        self.machine = create_machine(name="Coffee-01")
        self.supply = create_supply(name="Filters", unit="pieces")

    def test_create_inventory(self):
        inv = create_inventory(
            machine=self.machine, supply=self.supply, current_stock=50
        )
        self.assertEqual(inv.machine, self.machine)
        self.assertEqual(inv.supply, self.supply)
        self.assertEqual(inv.current_stock, 50)

    def test_inventory_str(self):
        inv = create_inventory(
            machine=self.machine, supply=self.supply, current_stock=30
        )
        expected = "Coffee-01 - Filters (Quantity: 30)"
        self.assertEqual(str(inv), expected)

    def test_unique_together(self):
        create_inventory(machine=self.machine, supply=self.supply)
        with self.assertRaises(IntegrityError):
            MachineSupplyInventory.objects.create(
                machine=self.machine, supply=self.supply, current_stock=200
            )

    def test_inventory_machine_cascade(self):
        inv = create_inventory(machine=self.machine, supply=self.supply)
        inv_id = inv.id
        self.machine.delete()
        with self.assertRaises(MachineSupplyInventory.DoesNotExist):
            MachineSupplyInventory.objects.get(id=inv_id)

    def test_inventory_supply_cascade(self):
        inv = create_inventory(machine=self.machine, supply=self.supply)
        inv_id = inv.id
        self.supply.delete()
        with self.assertRaises(MachineSupplyInventory.DoesNotExist):
            MachineSupplyInventory.objects.get(id=inv_id)

    def test_machine_related_name_access(self):
        """machine.supply_inventory should return related inventories."""
        inv = create_inventory(machine=self.machine, supply=self.supply)
        inventories = list(self.machine.supply_inventory.all())
        self.assertIn(inv, inventories)

    def test_supply_related_name_access(self):
        """supply.machine_inventory should return related inventories."""
        inv = create_inventory(machine=self.machine, supply=self.supply)
        inventories = list(self.supply.machine_inventory.all())
        self.assertIn(inv, inventories)


# ---------------------------------------------------------------------------
# 3. Supply serializer tests
# ---------------------------------------------------------------------------
class TestSupplySerializer(TestCase):
    def test_valid_serialization(self):
        supply = create_supply(name="Stirrers", unit="pieces", cost=Decimal("0.02"))
        from .serializers import SupplySerializer

        serializer = SupplySerializer(supply)
        self.assertEqual(serializer.data["name"], "Stirrers")
        self.assertEqual(serializer.data["unit"], "pieces")
        self.assertEqual(Decimal(serializer.data["cost"]), Decimal("0.02"))

    def test_valid_deserialization(self):
        from .serializers import SupplySerializer

        payload = {"name": "Lids", "unit": "pieces", "cost": "0.03"}
        serializer = SupplySerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        supply = serializer.save()
        self.assertEqual(supply.name, "Lids")
        self.assertEqual(supply.cost, Decimal("0.03"))

    def test_missing_required_field(self):
        from .serializers import SupplySerializer

        payload = {"name": "Incomplete"}
        serializer = SupplySerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("unit", serializer.errors)
        self.assertIn("cost", serializer.errors)

    def test_fields_count(self):
        supply = create_supply()
        from .serializers import SupplySerializer

        serializer = SupplySerializer(supply)
        expected_fields = {"id", "name", "unit", "cost"}
        self.assertEqual(set(serializer.data.keys()), expected_fields)


# ---------------------------------------------------------------------------
# 4. MachineSupplyInventory serializer tests
# ---------------------------------------------------------------------------
class TestMachineSupplyInventorySerializer(TestCase):
    def setUp(self):
        self.machine = create_machine(name="M-01")
        self.supply = create_supply(name="Napkins", unit="pieces")

    def test_serialization_includes_nested_supply(self):
        inv = create_inventory(machine=self.machine, supply=self.supply)
        from .serializers import MachineSupplyInventorySerializer

        serializer = MachineSupplyInventorySerializer(inv)
        self.assertIn("supply", serializer.data)
        self.assertIsInstance(serializer.data["supply"], dict)
        self.assertEqual(serializer.data["supply"]["name"], "Napkins")

    def test_deserialization_with_supply_id(self):
        from .serializers import MachineSupplyInventorySerializer

        payload = {
            "machine": self.machine.id,
            "supply_id": self.supply.id,
            "current_stock": 75,
        }
        serializer = MachineSupplyInventorySerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        inv = serializer.save()
        self.assertEqual(inv.machine, self.machine)
        self.assertEqual(inv.supply, self.supply)
        self.assertEqual(inv.current_stock, 75)

    def test_invalid_supply_id(self):
        from .serializers import MachineSupplyInventorySerializer

        payload = {
            "machine": self.machine.id,
            "supply_id": 99999,
            "current_stock": 10,
        }
        serializer = MachineSupplyInventorySerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("supply_id", serializer.errors)

    def test_write_only_supply_id_not_in_output(self):
        inv = create_inventory(machine=self.machine, supply=self.supply)
        from .serializers import MachineSupplyInventorySerializer

        serializer = MachineSupplyInventorySerializer(inv)
        self.assertNotIn("supply_id", serializer.data)


# ---------------------------------------------------------------------------
# 5. API tests
# ---------------------------------------------------------------------------
class TestSupplyAPI(APITestCase):
    def setUp(self):
        self.supply = create_supply(name="API Cups", unit="pieces")
        self.list_url = reverse("supplies-list")

    def test_list_supplies(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_supply(self):
        payload = {"name": "API Lids", "unit": "pieces", "cost": "0.04"}
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "API Lids")
        self.assertTrue(Supply.objects.filter(name="API Lids").exists())

    def test_retrieve_supply(self):
        url = reverse("supplies-detail", kwargs={"pk": self.supply.pk})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "API Cups")

from django.core.exceptions import ValidationError
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Machine
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
        "name": "Coffee Machine 1",
        "model": "CM-100",
        "location": location,
        "type": "coffee",
        "status": "online",
    }
    defaults.update(kwargs)
    return Machine.objects.create(**defaults)


# ---------------------------------------------------------------------------
# 1. Model tests
# ---------------------------------------------------------------------------
class TestMachineModel(TestCase):
    def setUp(self):
        self.location = create_location(name="Office", address="456 Corporate Blvd")

    def test_create_machine(self):
        machine = create_machine(location=self.location)
        self.assertEqual(machine.name, "Coffee Machine 1")
        self.assertEqual(machine.model, "CM-100")
        self.assertEqual(machine.location, self.location)
        self.assertEqual(machine.type, "coffee")
        self.assertEqual(machine.status, "online")
        self.assertIsNotNone(machine.created_at)
        self.assertIsNotNone(machine.updated_at)

    def test_machine_str(self):
        machine = create_machine(location=self.location, name="Snack Box")
        self.assertEqual(str(machine), "Snack Box")

    def test_machine_default_type(self):
        machine = Machine.objects.create(name="Default Type", location=self.location)
        self.assertEqual(machine.type, "coffee")

    def test_machine_default_status(self):
        machine = Machine.objects.create(name="Default Status", location=self.location)
        self.assertEqual(machine.status, "online")

    def test_machine_invalid_type_raises_error(self):
        machine = Machine(
            name="Bad Type",
            type="submarine",
            location=self.location,
        )
        with self.assertRaises(ValidationError):
            machine.full_clean()

    def test_machine_invalid_status_raises_error(self):
        machine = Machine(
            name="Bad Status",
            status="exploded",
            location=self.location,
        )
        with self.assertRaises(ValidationError):
            machine.full_clean()

    def test_machine_name_required(self):
        """Name is required — full_clean should reject blank name."""
        machine = Machine(location=self.location)
        with self.assertRaises(ValidationError):
            machine.full_clean()

    def test_machine_location_cascade(self):
        machine = create_machine(location=self.location)
        machine_id = machine.id
        self.location.delete()
        with self.assertRaises(Machine.DoesNotExist):
            Machine.objects.get(id=machine_id)

    def test_location_related_name_access(self):
        """location.machines should return related machines."""
        m1 = create_machine(location=self.location, name="M1")
        m2 = create_machine(location=self.location, name="M2")
        machines = list(self.location.machines.all())
        self.assertIn(m1, machines)
        self.assertIn(m2, machines)
        self.assertEqual(len(machines), 2)


# ---------------------------------------------------------------------------
# 2. Serializer tests
# ---------------------------------------------------------------------------
class TestMachineSerializer(TestCase):
    def setUp(self):
        self.location = create_location(name="Warehouse")

    def test_valid_serialization(self):
        machine = create_machine(location=self.location)
        from .serializers import MachineSerializer

        serializer = MachineSerializer(machine)
        data = serializer.data
        self.assertEqual(data["name"], "Coffee Machine 1")
        self.assertEqual(data["type"], "coffee")
        self.assertEqual(data["status"], "online")
        self.assertEqual(data["location"], self.location.id)

    def test_valid_deserialization(self):
        from .serializers import MachineSerializer

        payload = {
            "name": "New Machine",
            "location": self.location.id,
            "type": "snack",
            "status": "maintenance",
        }
        serializer = MachineSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        machine = serializer.save()
        self.assertEqual(machine.name, "New Machine")
        self.assertEqual(machine.type, "snack")
        self.assertEqual(machine.status, "maintenance")
        self.assertEqual(machine.location, self.location)

    def test_missing_required_field_name(self):
        from .serializers import MachineSerializer

        payload = {"location": self.location.id}
        serializer = MachineSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)

    def test_invalid_type_choice(self):
        from .serializers import MachineSerializer

        payload = {
            "name": "Bad Type",
            "location": self.location.id,
            "type": "spaceship",
        }
        serializer = MachineSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("type", serializer.errors)

    def test_invalid_status_choice(self):
        from .serializers import MachineSerializer

        payload = {
            "name": "Bad Status",
            "location": self.location.id,
            "status": "haunted",
        }
        serializer = MachineSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("status", serializer.errors)

    def test_fields_count(self):
        from .serializers import MachineSerializer

        machine = create_machine(location=self.location)
        serializer = MachineSerializer(machine)
        expected_fields = {
            "id",
            "type",
            "name",
            "model",
            "location",
            "status",
            "created_at",
            "updated_at",
        }
        self.assertEqual(set(serializer.data.keys()), expected_fields)


# ---------------------------------------------------------------------------
# 3. API tests
# ---------------------------------------------------------------------------
class TestMachineAPI(APITestCase):
    def setUp(self):
        self.location = create_location(name="HQ")
        self.machine = create_machine(
            location=self.location,
            name="API Machine",
            type="vending",
            status="offline",
        )
        self.list_url = reverse("machines-list")
        self.detail_url = reverse("machines-detail", kwargs={"pk": self.machine.pk})

    def test_list_machines(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_list_empty(self):
        Machine.objects.all().delete()
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0)

    def test_create_machine(self):
        payload = {
            "name": "Created Machine",
            "type": "snack",
            "status": "maintenance",
            "location": self.location.id,
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Created Machine")
        self.assertTrue(Machine.objects.filter(name="Created Machine").exists())

    def test_create_machine_missing_name(self):
        payload = {"location": self.location.id}
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("name", response.data)

    def test_create_machine_invalid_location(self):
        payload = {
            "name": "Ghost Machine",
            "location": 99999,
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_machine(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "API Machine")

    def test_retrieve_nonexistent_machine(self):
        url = reverse("machines-detail", kwargs={"pk": 99999})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_machine(self):
        payload = {
            "name": "Updated Machine",
            "type": "other",
            "status": "maintenance",
            "location": self.location.id,
        }
        response = self.client.put(self.detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.machine.refresh_from_db()
        self.assertEqual(self.machine.name, "Updated Machine")
        self.assertEqual(self.machine.type, "other")

    def test_delete_machine(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Machine.objects.filter(id=self.machine.pk).exists())

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Location


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def create_location(**kwargs):
    defaults = {"name": "Test Location", "address": "123 Test St"}
    defaults.update(kwargs)
    return Location.objects.create(**defaults)


# ---------------------------------------------------------------------------
# 1. Model tests
# ---------------------------------------------------------------------------
class TestLocationModel(TestCase):
    def test_create_location(self):
        location = create_location(name="Office", address="456 Corp Ave")
        self.assertEqual(location.name, "Office")
        self.assertEqual(location.address, "456 Corp Ave")
        self.assertIsNotNone(location.created_at)
        self.assertIsNotNone(location.updated_at)

    def test_location_str(self):
        location = create_location(name="Warehouse")
        self.assertEqual(str(location), "Warehouse")

    def test_location_address_optional(self):
        location = create_location(name="No Address Location", address=None)
        self.assertIsNone(location.address)
        # blank should also work
        location2 = Location.objects.create(name="Blank Address", address="")
        self.assertEqual(location2.address, "")

    def test_location_timestamps(self):
        location = create_location(name="Timestamp Test")
        self.assertIsNotNone(location.created_at)
        self.assertIsNotNone(location.updated_at)
        # created_at and updated_at should be set on creation
        delta = (location.updated_at - location.created_at).total_seconds()
        self.assertTrue(delta < 1)

    def test_location_machine_relationship(self):
        """A location can have multiple machines."""
        from machines.models import Machine

        location = create_location(name="Multi-Machine Location")
        m1 = Machine.objects.create(name="M1", location=location)
        m2 = Machine.objects.create(name="M2", location=location)
        machines = list(location.machines.all())
        self.assertIn(m1, machines)
        self.assertIn(m2, machines)
        self.assertEqual(len(machines), 2)


# ---------------------------------------------------------------------------
# 2. Serializer tests
# ---------------------------------------------------------------------------
class TestLocationSerializer(TestCase):
    def test_valid_serialization(self):
        location = create_location(name="HQ", address="100 Main St")
        from .serializers import LocationSerializer

        serializer = LocationSerializer(location)
        self.assertEqual(serializer.data["name"], "HQ")
        self.assertEqual(serializer.data["address"], "100 Main St")
        self.assertIn("id", serializer.data)

    def test_valid_deserialization(self):
        from .serializers import LocationSerializer

        payload = {"name": "Branch Office", "address": "200 Side St"}
        serializer = LocationSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        location = serializer.save()
        self.assertEqual(location.name, "Branch Office")
        self.assertEqual(location.address, "200 Side St")

    def test_missing_required_field_name(self):
        from .serializers import LocationSerializer

        payload = {"address": "No Name Location"}
        serializer = LocationSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)


# ---------------------------------------------------------------------------
# 3. API tests
# ---------------------------------------------------------------------------
class TestLocationAPI(APITestCase):
    def setUp(self):
        self.location = create_location(name="API Location", address="789 API Ave")
        self.list_url = reverse("locations-list")

    def test_list_locations(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_location(self):
        payload = {"name": "New Location", "address": "1000 New St"}
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "New Location")
        self.assertTrue(Location.objects.filter(name="New Location").exists())

    def test_create_location_missing_name(self):
        payload = {"address": "Missing Name Address"}
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

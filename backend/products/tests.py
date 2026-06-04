from decimal import Decimal

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Product


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def create_product(**kwargs):
    defaults = {
        "name": "Espresso",
        "type": "cafe",
        "type_machine": "coffee",
        "supplier": "Local Roasters",
        "cost": Decimal("0.50"),
        "price": Decimal("1.00"),
    }
    defaults.update(kwargs)
    return Product.objects.create(**defaults)


# ---------------------------------------------------------------------------
# 1. Model tests
# ---------------------------------------------------------------------------
class TestProductModel(TestCase):
    def test_create_product(self):
        product = create_product()
        self.assertEqual(product.name, "Espresso")
        self.assertEqual(product.type, "cafe")
        self.assertEqual(product.type_machine, "coffee")
        self.assertEqual(product.supplier, "Local Roasters")
        self.assertEqual(product.cost, Decimal("0.50"))
        self.assertEqual(product.price, Decimal("1.00"))
        self.assertIsNotNone(product.created_at)
        self.assertIsNotNone(product.updated_at)

    def test_product_default_type(self):
        product = Product.objects.create(
            name="No Type Product",
            cost=Decimal("0.20"),
            price=Decimal("0.50"),
        )
        self.assertEqual(product.type, "cafe")

    def test_product_default_type_machine(self):
        product = Product.objects.create(
            name="No Machine Type",
            cost=Decimal("0.20"),
            price=Decimal("0.50"),
        )
        self.assertEqual(product.type_machine, "coffee")

    def test_product_str(self):
        product = create_product(name="Latte")
        self.assertEqual(str(product), "Latte")

    def test_product_margin(self):
        product = create_product(cost=Decimal("0.30"), price=Decimal("1.00"))
        self.assertEqual(product.margin, Decimal("0.70"))

    def test_product_margin_percentage(self):
        product = create_product(cost=Decimal("0.25"), price=Decimal("1.00"))
        # margin=0.75, percentage = (0.75 / 1.00) * 100 = 75.0
        self.assertEqual(product.margin_percentage, 75.0)

    def test_product_margin_percentage_zero_price(self):
        product = create_product(cost=Decimal("0.50"), price=Decimal("0.00"))
        self.assertEqual(product.margin_percentage, 0)

    def test_product_required_fields(self):
        """cost and price are required (no null=True)."""
        with self.assertRaises(Exception):
            Product.objects.create(name="Missing Cost")


# ---------------------------------------------------------------------------
# 2. Serializer tests
# ---------------------------------------------------------------------------
class TestProductSerializer(TestCase):
    def test_serialization_includes_margin(self):
        product = create_product(cost=Decimal("0.30"), price=Decimal("1.00"))
        from .serializers import ProductSerializer

        serializer = ProductSerializer(product)
        self.assertIn("margin", serializer.data)
        self.assertEqual(serializer.data["margin"], 0.70)

    def test_serialization_includes_margin_percentage(self):
        product = create_product(cost=Decimal("0.25"), price=Decimal("1.00"))
        from .serializers import ProductSerializer

        serializer = ProductSerializer(product)
        self.assertIn("margin_percentage", serializer.data)
        self.assertEqual(serializer.data["margin_percentage"], 75.0)

    def test_valid_deserialization(self):
        from .serializers import ProductSerializer

        payload = {
            "name": "Cappuccino",
            "type": "cafe",
            "type_machine": "coffee",
            "cost": "0.40",
            "price": "1.20",
        }
        serializer = ProductSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        product = serializer.save()
        self.assertEqual(product.name, "Cappuccino")
        self.assertEqual(product.cost, Decimal("0.40"))
        self.assertEqual(product.price, Decimal("1.20"))

    def test_missing_required_field_cost(self):
        from .serializers import ProductSerializer

        payload = {"name": "No Cost", "price": "1.00"}
        serializer = ProductSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("cost", serializer.errors)

    def test_missing_required_field_price(self):
        from .serializers import ProductSerializer

        payload = {"name": "No Price", "cost": "0.50"}
        serializer = ProductSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

    def test_fields_count(self):
        product = create_product()
        from .serializers import ProductSerializer

        serializer = ProductSerializer(product)
        expected_fields = {
            "id",
            "name",
            "type",
            "type_machine",
            "supplier",
            "cost",
            "price",
            "margin",
            "margin_percentage",
            "created_at",
            "updated_at",
        }
        self.assertEqual(set(serializer.data.keys()), expected_fields)


# ---------------------------------------------------------------------------
# 3. API tests
# ---------------------------------------------------------------------------
class TestProductAPI(APITestCase):
    def setUp(self):
        self.product = create_product(name="API Espresso")
        self.list_url = reverse("products-list")
        self.detail_url = reverse("products-detail", kwargs={"pk": self.product.pk})

    def test_list_products(self):
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)

    def test_create_product(self):
        payload = {
            "name": "Mocha",
            "type": "cafe",
            "type_machine": "coffee",
            "cost": "0.60",
            "price": "1.50",
        }
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["name"], "Mocha")
        self.assertIn("margin", response.data)
        self.assertIn("margin_percentage", response.data)

    def test_create_product_invalid_data(self):
        """POST without cost should return 400."""
        payload = {"name": "Bad Product", "price": "1.00"}
        response = self.client.post(self.list_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_retrieve_product(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "API Espresso")

    def test_update_product(self):
        payload = {
            "name": "Updated Espresso",
            "type": "bebidas",
            "type_machine": "vending",
            "cost": "0.55",
            "price": "1.10",
        }
        response = self.client.put(self.detail_url, payload, format="json")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.product.refresh_from_db()
        self.assertEqual(self.product.name, "Updated Espresso")
        self.assertEqual(self.product.type, "bebidas")

    def test_delete_product(self):
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Product.objects.filter(id=self.product.pk).exists())

    def test_options_endpoint(self):
        url = reverse("products-options")
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("types", response.data)
        self.assertIn("machines", response.data)
        self.assertIsInstance(response.data["types"], list)
        self.assertIsInstance(response.data["machines"], list)

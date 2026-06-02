from django.db import models

# Create your models here.
class Supply(models.Model):
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=50)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.name} (Unit: {self.unit})"

    class Meta:
        verbose_name = 'Supply'
        verbose_name_plural = 'Supplies'
        ordering = ['name']


class MachineSupplyInventory(models.Model):
    machine = models.ForeignKey('machines.Machine', on_delete=models.CASCADE, related_name='supply_inventory')
    supply = models.ForeignKey(Supply, on_delete=models.CASCADE, related_name='machine_inventory')
    current_stock = models.IntegerField()

    def __str__(self):
        return f"{self.machine.name} - {self.supply.name} (Quantity: {self.current_stock})"

    class Meta:
        verbose_name = 'Machine Supply Inventory'
        verbose_name_plural = 'Machine Supply Inventories'
        unique_together = ('machine', 'supply')
from django.db import models

# Create your models here.
class Product(models.Model):
    TYPE = (
        ('bebidas', 'Bebidas'),
        ('cafe', 'Café'),
        ('lacteos', 'Lácteos'),
        ('golosinas', 'Golosinas'),
        ('snacks', 'Snacks'),
        ('bolleria', 'Bollería'),
        ('no_comestibles', 'No comestibles'),
        ('otros', 'Otros'),
    )
    TYPE_MACHINE = (
        ('vending', 'Vending Machine'),
        ('coffee', 'Coffee Machine'),
        ('snack', 'Snack Machine'),
        ('other', 'Other'),
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, choices=TYPE, default='cafe')
    type_machine = models.CharField(max_length=20, choices=TYPE_MACHINE, default='coffee')
    supplier = models.CharField(max_length=100, blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
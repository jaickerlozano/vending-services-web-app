from django.db import models

# Create your models here.
class Machine(models.Model):
    # permite elegir entre tipos prefefinidos de máquinas, con un valor por defecto
    TYPE = (
        ('vending', 'Vending Machine'),
        ('coffee', 'Coffee Machine'),
        ('snack', 'Snack Machine'),
        ('other', 'Other'),
    )

    STATUS = (
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('maintenance', 'Maintenance'),
        ('other', 'Other'),
    )
    type = models.CharField(max_length=20, choices=TYPE, default='coffee')
    name = models.CharField(max_length=100)
    # serie_number = models.CharField(max_length=100, unique=True, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    location = models.ForeignKey('locations.Location', on_delete=models.CASCADE, related_name='machines')
    status = models.CharField(max_length=20, choices=STATUS, default='online')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
from django.db import models
from invoice.models import Contract, Invoice, Client, Provider
from receipt.models import Receipt

class Search(models.Model):
    contract_id = models.IntegerField()
    contract_no = models.CharField(max_length=10)
    contract_date = models.DateField()
    client_id = models.IntegerField()
    client_name = models.CharField(max_length=100)
    client_email = models.CharField(max_length=100)
    client_phone = models.CharField(max_length=30)
    invoice = models.CharField(max_length=1000)
    
    class Meta:
        db_table = "inv_data_vw"
        managed = False

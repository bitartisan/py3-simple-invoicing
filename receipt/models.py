from django.db import models
from invoice.models import Invoice

class Receipt(models.Model):
    receipt_id = models.AutoField(primary_key=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    receipt_no = models.CharField(max_length=10)
    receipt_date = models.CharField(max_length=15)
    receipt_amount = models.CharField(max_length=6)
    receipt_amount_str = models.CharField(max_length=255)
    
    class Meta:
        db_table = "inv_receipt"
        ordering = ('receipt_id',)
    
    def __str__(self):
        return self.receipt_no

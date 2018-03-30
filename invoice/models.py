from django.db import models


class Client(models.Model):
    client_id = models.AutoField(primary_key=True)
    client_name = models.CharField(max_length=100)
    client_phone = models.CharField(max_length=30)
    client_email = models.CharField(max_length=100)
    client_address = models.CharField(max_length=500)
    client_orc = models.CharField(max_length=50, null=True, blank=True)
    client_cui = models.CharField(max_length=50, null=True, blank=True)
    client_bank = models.CharField(max_length=50, null=True, blank=True)
    client_account = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = "inv_client"
        ordering = ('client_name',)

    def __str__(self):
        return self.client_name


class Provider(models.Model):
    provider_id = models.AutoField(primary_key=True)
    provider_name = models.CharField(max_length=100)
    provider_phone = models.CharField(max_length=30)
    provider_email = models.CharField(max_length=100)
    provider_address = models.CharField(max_length=500)
    provider_orc = models.CharField(max_length=50, null=True, blank=True)
    provider_cui = models.CharField(max_length=50, null=True, blank=True)
    provider_bank = models.CharField(max_length=50, null=True, blank=True)
    provider_account = models.CharField(max_length=50, null=True, blank=True)

    class Meta:
        db_table = "inv_provider"
        ordering = ('provider_name',)

    def __str__(self):
        return self.provider_name


class Contract(models.Model):
    contract_id = models.AutoField(primary_key=True)
    client = models.ForeignKey(Client, on_delete=models.CASCADE)
    provider = models.ForeignKey(Provider, on_delete=models.CASCADE)
    contract_no = models.CharField(max_length=10)
    contract_date = models.DateField('From')
    status = models.CharField(max_length=10, choices=(
        ('disabled', 'Disabled'),
        ('enabled', 'Enabled')
    ), default='enabled')

    class Meta:
        db_table = "inv_contract"
        ordering = ('contract_date',)

    def __str__(self):
        return self.contract_no


class ContractService(models.Model):
    service_id = models.AutoField(primary_key=True)
    service_name = models.CharField(max_length=500)

    class Meta:
        db_table = "inv_service"

    def __str__(self):
        return self.service_name


class Invoice(models.Model):
    invoice_id = models.AutoField(primary_key=True)
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE)
    invoice_no = models.CharField(max_length=10)
    invoice_date = models.CharField(max_length=15)

    class Meta:
        db_table = "inv_invoice"
        ordering = ('invoice_date',)

    def __str__(self):
        return self.invoice_no


class InvoiceLine(models.Model):
    invoice_line_id = models.AutoField(primary_key=True)
    invoice = models.ForeignKey(Invoice, on_delete=models.CASCADE)
    service = models.ForeignKey(ContractService, on_delete=models.CASCADE)
    qty = models.IntegerField()
    price = models.FloatField()

    class Meta:
        db_table = "inv_invoice_line"
        ordering = ('invoice_line_id',)

    def __str__(self):
        return self.invoice_line_id

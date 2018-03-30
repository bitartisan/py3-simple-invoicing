from django import forms
from .models import Client, Provider, Contract, ContractService, Invoice

class InvoiceForm(forms.Form):
    provider_id = forms.CharField(
        widget=forms.HiddenInput(attrs = {'id': 'provider_id', 'value': 1})
    )
    
    client_id = forms.ModelChoiceField(
        queryset=Client.objects.all().order_by('client_name'), 
        empty_label="--Select Client--",
        widget=forms.Select(attrs={'id': 'client_id', 'class': 'form-control form-control-sm'})
    )
    
    invoice_no = forms.CharField(
        max_length=10,
        widget=forms.TextInput(attrs = {'id': 'invoice_no', 'class': 'form-control form-control-sm'})
    )
    
    invoice_date = forms.CharField(
        max_length=10,
        widget=forms.TextInput(attrs = {'id': 'invoice_date', 'class': 'form-control form-control-sm datepicker'})
    )
    
    invoice_id = forms.ChoiceField(
        required=False, 
        choices=[('','--Select Factura--')], 
        widget=forms.Select(attrs={'id': 'invoice_id', 'class': 'form-control form-control-sm'})
    )
    
    contract_id = forms.ChoiceField(
        choices=[('','--Select Contract--')], 
        widget=forms.Select(attrs={'id': 'contract_id', 'class': 'form-control'})
    )
    
    service_id__0 = forms.ModelChoiceField(
        queryset=ContractService.objects.all().order_by('service_name'),
        widget=forms.Select(attrs={'id': False, 'class': 'form-control form-control-sm'})
    )
    
    qty__0 = forms.CharField(
        max_length=1,
        widget=forms.TextInput(attrs = {'value': 1, 'id': False, 'class': 'qty form-control form-control-sm'})
    )
    
    price__0 = forms.CharField(
        max_length=6,
        widget=forms.TextInput(attrs = {'id': False, 'class': 'price form-control form-control-sm'})
    )
    
    total__0 = forms.CharField(
        max_length=6, 
        widget=forms.TextInput(attrs={'id': False, 'readonly': True, 'class': 'total form-control form-control-sm'})
    )

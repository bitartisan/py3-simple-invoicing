from django import forms
from .models import Receipt

class ReceiptForm(forms.Form):
    receipt_id = forms.ChoiceField(
        required=False, 
        choices=[('','--Select Chitanța--')], 
        widget=forms.Select(attrs={'id': 'receipt_id', 'class': 'form-control form-control-sm', 'data-toggleempty': 'true'})
    )
    
    receipt_no = forms.CharField(
        max_length=10,
        widget=forms.TextInput(attrs = {'id': 'receipt_no', 'class': 'form-control form-control-sm'})
    )
    
    receipt_date = forms.CharField(
        max_length=15,
        widget=forms.TextInput(attrs = {'id': 'receipt_date', 'class': 'form-control form-control-sm datepicker'})
    )
    
    receipt_amount = forms.CharField(
        max_length=10,
        widget=forms.TextInput(attrs = {'id': 'receipt_amount', 'class': 'form-control form-control-sm'})
    )
    
    receipt_amount_str = forms.CharField(
        max_length=225,
        widget=forms.TextInput(attrs = {'id': 'receipt_amount_str', 'class': 'form-control form-control-sm'})
    )
    

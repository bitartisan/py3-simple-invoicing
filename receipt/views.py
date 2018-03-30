import json
#from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.html import escape
from django.db import IntegrityError, transaction
from utils.helper import Helper
from .models import Receipt
from invoice.models import Invoice
from .forms import ReceiptForm

@csrf_protect
def AjaxReceipt(request):
    
    obj = {}
    data = []
    invoice_id = request.POST.get('invoice_id', False)
    post_action = request.POST.get('action', False)
    
    if invoice_id and post_action == 'get-receipts':
        receipt_data = Receipt.objects.filter(invoice_id=invoice_id).order_by('-receipt_id').values()
        
        for row in receipt_data:
            data.append({
                'value': row['receipt_id'],
                'text': 'Chitanța #' + row['receipt_no'] + ' / ' + row['receipt_date']
            })
                
    elif invoice_id and post_action == 'get-receipt-data':
        
        try:
            receipt_id = request.POST.get('receipt_id', False)
            invoice_data = Invoice.objects.filter(invoice_id=invoice_id).values()
            receipt_data = Receipt.objects.filter(receipt_id=receipt_id).values()
            
            data = {
                'invoice': invoice_data[0],
                'receipt': receipt_data[0]
            }
            
        except Exception as e:
            data = {}
        
    return JsonResponse(data, safe=False)
    
    
@csrf_protect
def AjaxDeleteReceipt(request):
    
    return_data = {}
    receipt_id = request.POST.get('receipt_id', False)
    
    if (receipt_id):
        try:
            Receipt.objects.filter(pk=receipt_id).delete()
            message = "Receipt successfully deleted"
            success = True
        except Exception as e:
            message = "Receipt cannot be deleted: " + str(e)
            success = False
    
        return_data = {
            'receipt_id': receipt_id,
            'success': success,
            'message': message
        }
    
    return JsonResponse(return_data, safe=False)

import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.html import escape
from django.db import IntegrityError, transaction
from .models import Contract, Client, Provider, Invoice, InvoiceLine
from .forms import InvoiceForm
from receipt.models import Receipt
from receipt.forms import ReceiptForm
from utils.render2pdf import render_to_pdf


def Index(request):
    if not request.user.is_authenticated:
        return render(request, 'access-denied.html')

    data = {}
    client = Client.objects.all()
    provider = Provider.objects.filter(provider_id=1)
    last_invoice = ""

    try:
        last_invoice = Invoice.objects.latest('invoice_id')
        last_invoice_text = '#' + last_invoice.invoice_no + '/' \
                            + last_invoice.invoice_date
    except Exception as e:
        last_invoice_text = "None yet"

    if last_invoice is not None:
        data = {
            'client': client,
            'provider': provider,
            'last_invoice': last_invoice_text
        }

    invoice_form = InvoiceForm()
    receipt_form = ReceiptForm()

    return render(
        request, 'index.html', {
            'return_data': data,
            'invoice_form': invoice_form,
            'receipt_form': receipt_form
        })


@csrf_protect
def AjaxClient(request):

    data = []
    client_id = request.POST.get('client_id', False)
    post_action = request.POST.get('action', False)

    if client_id and post_action == 'render-client-info':
        client_data = Client.objects.filter(client_id=client_id)
        data = list(
            client_data.values('client_address', 'client_orc', 'client_cui',
                               'client_bank', 'client_account'))

    return JsonResponse(data, safe=False)


@csrf_protect
def AjaxInvoice(request):

    data = []
    client_id = request.POST.get('client_id', False)
    invoice_id = request.POST.get('invoice_id', False)
    post_action = request.POST.get('action', False)

    # get client available invoices
    if client_id and post_action == 'get-client-invoices':
        contract_id_list = list(
            Contract.objects.filter(client_id=client_id,
                                    status='enabled').values_list(
                                        'contract_id', flat=True))
        invoice_data = Invoice.objects.filter(
            contract_id__in=contract_id_list).order_by('-invoice_id')

        for row in invoice_data:
            invoice_obj = Invoice.objects.select_related('contract').get(
                pk=row.invoice_id)
            contract_obj = invoice_obj.contract
            obj = {
                'value':
                row.invoice_id,
                'text':
                'Factura #' + row.invoice_no + ' / ' + row.invoice_date +
                ', Ctr #' + str(contract_obj.contract_no) + ' / ' +
                str(contract_obj.contract_date)
            }

            data.append(obj)

    # get invoice lines data
    elif invoice_id and post_action == 'get-invoice-lines':
        try:
            invoice_data = Invoice.objects.get(invoice_id=invoice_id)
        except Exception as e:
            return

        invoice_line_data = InvoiceLine.objects.filter(
            invoice_id=invoice_id).order_by('invoice_line_id')

        l = []
        data = {}
        for row in invoice_line_data:
            invoice_line = InvoiceLine.objects.select_related('service').get(
                pk=row.invoice_line_id)
            service_obj = invoice_line.service
            l.append(
                dict({
                    'invoice_line_id': row.invoice_line_id,
                    'qty': row.qty,
                    'price': row.price,
                    'value': (row.qty * row.price),
                    'service_id': service_obj.service_id,
                    'service_name': service_obj.service_name,
                }))

        data['inv'] = dict({
            'invoice_no': invoice_data.invoice_no,
            'invoice_date': invoice_data.invoice_date,
            'contract_id': invoice_data.contract_id
        })

        data['invline'] = l

    # get assigned / enabled contracts
    elif client_id and post_action == 'get-client-contracts':
        contract_data = Contract.objects.filter(
            client_id=client_id, status='enabled').order_by('-contract_date')

        for row in contract_data:
            obj = {
                'value':
                row.contract_id,
                'text':
                '#' + row.contract_no + ' / ' +
                str(row.contract_date.strftime('%d-%b-%Y'))
            }

            data.append(obj)

    return JsonResponse(data, safe=False)


@csrf_protect
def AjaxSaveInvoice(request):

    d = {}
    inv = {}
    invline = {}
    invoice_id = ''
    receipt = {}
    receipt_id = ''
    return_data = []
    form_data = json.loads(request.POST.get('form'))

    # collect data
    for row in form_data:
        field = row.split('__')
        if len(field) == 2:
            idx = int(field[1])
            key = str(field[0])

            if idx not in invline:
                invline[idx] = []
            invline[idx].append([key, escape(form_data[row])])

        elif row in [
                'invoice_id', 'invoice_no', 'invoice_date', 'contract_id'
        ]:
            inv.update({row: escape(form_data[row])})

        elif row in [
                'receipt_id', 'receipt_no', 'receipt_date', 'receipt_amount',
                'receipt_amount_str'
        ]:
            receipt.update({row: escape(form_data[row])})

    try:
        with transaction.atomic():
            # invoice model
            if inv['invoice_id']:
                action = 'update'
                invoice_obj = Invoice.objects.get(pk=inv['invoice_id'])
                invoice_obj.invoice_no = inv['invoice_no']
                invoice_obj.invoice_date = inv['invoice_date']
                invoice_obj.contract_id = inv['contract_id']
                invoice_obj.save()
            else:
                action = 'save'
                del inv['invoice_id']
                invoice_obj = Invoice.objects.create(**inv)
            invoice_id = invoice_obj.pk

            InvoiceLine.objects.filter(invoice_id=invoice_id).delete()
            for line in invline:
                l = {}
                for row in invline[line]:
                    if not row[0] == "total":
                        l[row[0]] = row[1]

                l['invoice_id'] = invoice_id
                InvoiceLine.objects.create(**l)

            if len(receipt.keys()) > 0:
                # receipt model
                receipt['invoice_id'] = invoice_id

                if receipt['receipt_id']:
                    # update
                    receipt_obj = Receipt.objects.get(pk=receipt['receipt_id'])
                    receipt_obj.invoice_id = receipt['invoice_id']
                    receipt_obj.receipt_no = receipt['receipt_no']
                    receipt_obj.receipt_date = receipt['receipt_date']
                    receipt_obj.receipt_amount = receipt['receipt_amount']
                    receipt_obj.receipt_amount_str = receipt[
                        'receipt_amount_str']
                    receipt_obj.save()
                else:
                    # add
                    del receipt['receipt_id']
                    receipt_obj = Receipt.objects.create(**receipt)
                receipt_id = receipt_obj.pk

            message = "Invoice successfully " + action + "d"
            success = True
    except IntegrityError as err:
        message = err
        success = False

    d.update({
        'invoice_id': invoice_id,
        'receipt_id': receipt_id,
        'success': success,
        'message': message,
        'action': action
    })

    return_data.append(d)

    return JsonResponse(return_data, safe=False)


@csrf_protect
def AjaxDeleteInvoice(request):

    return_data = {}
    invoice_id = request.POST.get('invoice_id', False)

    if (invoice_id):
        try:
            Receipt.objects.filter(invoice_id=invoice_id).delete()
            InvoiceLine.objects.filter(invoice_id=invoice_id).delete()
            Invoice.objects.get(pk=invoice_id).delete()
            message = "Invoice successfully deleted"
            success = True
        except Exception as e:
            message = "Invoice cannot be deleted: " + str(e)
            success = False

        return_data = {
            'invoice_id': invoice_id,
            'success': success,
            'message': message
        }

    return JsonResponse(return_data, safe=False)


@csrf_protect
def AjaxUpdateLastInvoice(request):

    last_invoice = ""

    try:
        last_invoice = Invoice.objects.latest('invoice_id')
        last_invoice_text = '#' + last_invoice.invoice_no + '/' \
                            + last_invoice.invoice_date
    except Exception as e:
        last_invoice_text = "None yet"

    return_data = {'last_invoice': last_invoice_text}

    return JsonResponse(return_data, safe=False)


@csrf_protect
def downloadInvoice(request, invoice_id, receipt_id=''):

    if not request.user.is_authenticated:
        return render(request, 'access-denied.html')

    if invoice_id:
        try:
            invoice_object = Invoice.objects.select_related('contract').get(
                pk=invoice_id)
            contract_object = invoice_object.contract
            client_data = Client.objects.filter(
                pk=contract_object.client_id).values()
            provider_data = Provider.objects.filter(
                pk=contract_object.provider_id).values()

            receipt = {}
            if receipt_id:
                receipt_object = Receipt.objects.get(pk=receipt_id)
                receipt = {
                    'receipt_no': receipt_object.receipt_no,
                    'receipt_date': receipt_object.receipt_date,
                    'receipt_amount': receipt_object.receipt_amount,
                    'receipt_amount_str': receipt_object.receipt_amount_str
                }

            # prepare client data
            client = client_data[0]

            # prepare provider data
            provider = provider_data[0]

            # invoice data
            invoice = {
                'invoice_no': invoice_object.invoice_no,
                'invoice_date': invoice_object.invoice_date,
                'contract_id': {
                    'contract_no': contract_object.contract_no,
                    'contract_date': contract_object.contract_date
                }
            }

            # invoice lines
            lines = []
            invoice_line_data = InvoiceLine.objects.filter(
                invoice_id=invoice_id).order_by('invoice_line_id')
            total = 0
            for row in invoice_line_data:
                invoice_line = InvoiceLine.objects.select_related(
                    'service').get(pk=row.invoice_line_id)
                service_obj = invoice_line.service
                value = row.qty * row.price
                total = total + value
                lines.append(
                    dict({
                        'qty': row.qty,
                        'price': row.price,
                        'value': value,
                        'service_name': service_obj.service_name,
                    }))

            data = {
                'client': client,
                'provider': provider,
                'invoice': invoice,
                'invoice_lines': lines,
                'total_value': total,
                'receipt': receipt
            }

            response = render_to_pdf('download.html', data)

            return response

        except Exception as e:
            data = {'exception': e}

    return render(request, 'download.html', {'data': data})
    
    
    

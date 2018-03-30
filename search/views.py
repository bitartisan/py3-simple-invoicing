from django.db.models import Q
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.html import escape
from .models import Search
from utils.helper import Helper

@csrf_protect
def AjaxSearch(request):

    raw = []
    search = request.POST.get('search_str', False)
    if search:
        raw = list(Search.objects.filter(Q(client_name__icontains=search) | Q(contract_date__icontains=search))
                    .order_by('-client_id', '-contract_id').values())
        
    return JsonResponse(BuildData(raw), safe=False)
    
def BuildData(raw_data):
    
    data = {}
    client = ''
    
    for row in raw_data:
        client = row['client_name']
        if not client in data:
            i = 0
            ctr = []
            data[client] = {}
        
        ctr.insert(i, {
            'contract': {
                'client_id': row['client_id'],
                'contract_id': row['contract_id'],
                'contract_details': '#' + row['contract_no'] + '/' + row['contract_date'].strftime('%d-%b-%Y')
            },
            'invoices': row['invoice'].split(',')
        })
        
        data[client] = ctr
        i += 1
    
    return data
    
    
    
    

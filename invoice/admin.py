from django.contrib import admin
from .models import Contract, Client, Provider, ContractService, Invoice

class ContractAdmin(admin.ModelAdmin):
    def style_link(self, obj):
        return 'https://google.com/'
        #url = reverse('admin:myapp_style_change', obj.style_id)
        #return format_html("<a href='{}'>{}</a>", url, obj.style_id)
    
    style_link.admin_order_field = 'style'
    style_link.short_description = 'style'
    
    list_display = ('contract_no', 'style_link', 'contract_date', 'client', 'provider', 'status')
    list_display_links = ('contract_no',)
    search_fields = ('contract_no', 'client', 'provider')
    list_per_page = 25
    
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('invoice_no', 'invoice_date')
    list_display_links = ('invoice_no',)
    search_fields = ('invoice_no', 'invoice_date')
    list_per_page = 25

admin.site.site_header = 'Invoicing'
admin.site.register(Invoice, InvoiceAdmin)
admin.site.register(Contract, ContractAdmin)
admin.site.register(Client)
admin.site.register(Provider)
admin.site.register(ContractService)
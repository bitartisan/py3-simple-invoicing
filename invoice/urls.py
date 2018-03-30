from django.urls import path
from . import views

urlpatterns = [
    path('', views.Index, name='invoice-index'),
    path('download/<int:invoice_id>/', views.downloadInvoice, name='invoice-download'),
    path('download/<int:invoice_id>/<int:receipt_id>/', views.downloadInvoice, name='invoice-download'),
    path('ajaxInv/client/', views.AjaxClient, name='invoice-ajax-client'),
    path('ajaxInv/invoice/', views.AjaxInvoice, name='invoice-ajax-get-invoice'),
    path('ajaxInv/save-invoice/', views.AjaxSaveInvoice, name='invoice-ajax-save-invoice'),
    path('ajaxInv/delete-invoice/', views.AjaxDeleteInvoice, name='invoice-ajax-delete-invoice'),
    path('ajaxInv/update-last-invoice/', views.AjaxUpdateLastInvoice, name='invoice-ajax-update-last-invoice'),
    path('ajaxRec/', views.AjaxUpdateLastInvoice, name='invoice-ajax-update-last-invoice'),
]

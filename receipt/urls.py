from django.urls import path
from . import views

urlpatterns = [
    path('ajaxRec/', views.AjaxReceipt, name='receipt-ajax-get-receipt'),
    path('ajaxRec/delete-receipt/', views.AjaxDeleteReceipt, name='receipt-ajax-delete-receipt'),
]

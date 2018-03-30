from django.urls import path
from . import views

urlpatterns = [
    path('', views.AjaxSearch, name='app-ajax-search')
]

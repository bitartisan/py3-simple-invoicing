from django.urls import include, path
from django.contrib import admin

urlpatterns = [
    path('', include('invoice.urls')),
    path('receipt/', include('receipt.urls')),
    path('search/', include('search.urls')),
    path('admin/', admin.site.urls),
]

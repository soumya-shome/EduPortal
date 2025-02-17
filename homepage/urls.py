from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('register/', views.register, name='register'),
    path('api/', views.my_api, name='my_api'),  # API endpoint
    path('login-validation/', views.login_verification),  # View to verify
    path('api-data/', views.api_data, name='api_data'),  # View to call the API
]
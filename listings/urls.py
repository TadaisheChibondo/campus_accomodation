from django.urls import path
from .views import PropertyListCreateView, PropertyDetailView, CreateReviewView, RegisterView, PropertyImageCreateView

urlpatterns = [
    path('properties/', PropertyListCreateView.as_view(), name='property-list'),
    path('properties/<int:pk>/', PropertyDetailView.as_view(), name='property-detail'),
    path('properties/<int:pk>/review/', CreateReviewView.as_view(), name='create-review'),
    
    # This is where the register link lives now:
    path('register/', RegisterView.as_view(), name='register'), 
    path('upload-image/', PropertyImageCreateView.as_view(), name='upload-image'),
]
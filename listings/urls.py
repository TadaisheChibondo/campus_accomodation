from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    PropertyViewSet, 
    BookingViewSet,  # <--- Make sure this matches the class name in views.py!
    RegisterView, 
    CreateReviewView,
    PropertyImageCreateView
)

# 1. The Router handles all the standard "CRUD" URLs automatically
router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    # Router URLs (Properties & Bookings)
    path('', include(router.urls)),

    # 2. Authentication URLs (CRITICAL for Login.jsx)
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),

    # 3. Custom Action URLs
    # Since PropertyViewSet handles standard stuff, we only keep custom overrides if needed.
    # If CreateReviewView is a separate view (not inside the ViewSet), keep this:
    path('properties/<int:pk>/review/', CreateReviewView.as_view(), name='create-review'),
    
    # Image Upload
    path('upload-image/', PropertyImageCreateView.as_view(), name='upload-image'),
]
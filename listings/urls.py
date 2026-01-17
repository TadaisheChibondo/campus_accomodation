from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    PropertyViewSet, 
    BookingViewSet,
    RegisterView, 
    CreateReviewView,
    PropertyImageCreateView,
    UserInfoView # <--- Verified Import
)

# 1. The Router handles all the standard "CRUD" URLs automatically
router = DefaultRouter()
router.register(r'properties', PropertyViewSet)
router.register(r'bookings', BookingViewSet, basename='booking')

urlpatterns = [
    # Router URLs (Properties & Bookings)
    path('', include(router.urls)),

    # 2. Authentication URLs
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),

    # 3. Custom Action URLs
    # Reviews
    path('properties/<int:pk>/review/', CreateReviewView.as_view(), name='create-review'),
    
    # Image Upload
    path('upload-image/', PropertyImageCreateView.as_view(), name='upload-image'),

    # 4. User Info (The Fix for the 404 Error)
    path('user-info/', UserInfoView.as_view(), name='user-info'),
]
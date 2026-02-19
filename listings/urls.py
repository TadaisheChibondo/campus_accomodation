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
    UserInfoView,
    RequestPasswordResetView,   # <--- ADD THIS
    PasswordResetConfirmView,
    RoomCreateView,
    RoomDetailView,
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

    # 4. User Info (FIXED: Changed dash to slash to match frontend!)
    path('user/info/', UserInfoView.as_view(), name='user-info'),
    # Password Reset
    path('password-reset/', RequestPasswordResetView.as_view(), name='password_reset'),
    path('password-reset-confirm/<uidb64>/<token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('rooms/', RoomCreateView.as_view(), name='create-room'),
    path('rooms/<int:pk>/', RoomDetailView.as_view(), name='room-detail'),
]
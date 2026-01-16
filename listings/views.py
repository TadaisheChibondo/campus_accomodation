from django.shortcuts import render
from rest_framework import viewsets, generics, permissions
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User

# Import Models
from .models import Property, PropertyImage, Review, Booking

# Import Serializers
from .serializers import (
    PropertySerializer, 
    PropertyImageSerializer, 
    BookingSerializer, 
    UserSerializer, 
    ReviewSerializer
)

# ---------------------------------------------------------
# 1. PROPERTY VIEWSET (Handles List, Detail, Create, Update, Delete)
# ---------------------------------------------------------
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    # ReadOnly: Guests can see houses. Authenticated: Landlords can add/edit.
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Auto-set the 'landlord' to the current user
        serializer.save(landlord=self.request.user)

# ---------------------------------------------------------
# 2. BOOKING VIEWSET (The Missing Piece!)
# ---------------------------------------------------------
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated] # Must be logged in to book

    def get_queryset(self):
        # Users should only see their OWN bookings
        return Booking.objects.filter(student=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        # Auto-set the 'student' to the current user
        serializer.save(student=self.request.user)

# ---------------------------------------------------------
# 3. SPECIALIZED VIEWS (Registration, Reviews, Images)
# ---------------------------------------------------------

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class PropertyImageCreateView(generics.CreateAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    parser_classes = (MultiPartParser, FormParser) # For handling file uploads

class CreateReviewView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Link review to property ID from URL and current user
        property_id = self.kwargs['pk']
        property_instance = Property.objects.get(pk=property_id)
        serializer.save(user=self.request.user, property=property_instance)
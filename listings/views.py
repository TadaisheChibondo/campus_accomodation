from django.shortcuts import render
from rest_framework import viewsets, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.db.models import Q # <--- NEEDED FOR COMPLEX QUERIES
from rest_framework.views import APIView


from .models import Property, PropertyImage, Review, Booking
from .serializers import (
    PropertySerializer, 
    PropertyImageSerializer, 
    BookingSerializer, 
    UserSerializer, 
    ReviewSerializer
)

# 1. PROPERTY VIEWSET
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)

    # NEW ACTION: Get only MY properties
    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        properties = self.queryset.filter(landlord=request.user)
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

# 2. BOOKING VIEWSET
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        # Allow access if you are the STUDENT (who booked) OR the LANDLORD (who owns it)
        return Booking.objects.filter(
            Q(student=user) | Q(property__landlord=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(student=self.request.user)

    # NEW ACTION: Get bookings for MY properties (Incoming Requests)
    @action(detail=False, methods=['get'])
    def manage(self, request):
        bookings = Booking.objects.filter(property__landlord=request.user).order_by('-created_at')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)

# 3. SPECIALIZED VIEWS (Keep these as is)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]

class PropertyImageCreateView(generics.CreateAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    parser_classes = (MultiPartParser, FormParser)

class CreateReviewView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        property_id = self.kwargs['pk']
        property_instance = Property.objects.get(pk=property_id)
        serializer.save(user=self.request.user, property=property_instance)


class UserInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        # safely get role, default to student if profile missing
        role = getattr(user, 'profile', None) and user.profile.role or 'student'
        return Response({
            "username": user.username,
            "role": role
        })
    
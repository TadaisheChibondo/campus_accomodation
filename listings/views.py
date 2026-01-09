from django.shortcuts import render
from rest_framework import generics
from .models import Property, PropertyImage
from .serializers import PropertySerializer, PropertyImageSerializer
from .serializers import UserSerializer
from django.contrib.auth.models import User
from .models import Review
from .serializers import ReviewSerializer
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser, FormParser

# Create your views here.
# listings/views.py



# This view handles:
# 1. GET requests (List all houses)
# 2. POST requests (Add a new house - we'll restrict this to landlords later)
class PropertyListCreateView(generics.ListCreateAPIView):
    queryset = Property.objects.filter(is_available=True) # Only show available houses
    serializer_class = PropertySerializer

# This view handles:
# 1. GET specific house (Retrieve)
# 2. PUT/PATCH (Update)
# 3. DELETE (Remove)
class PropertyDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer

# listings/views.py


class CreateReviewView(generics.CreateAPIView):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly] # Only logged-in users can review

    def perform_create(self, serializer):
        # Automatically find the property ID from the URL and link it
        property_id = self.kwargs['pk']
        property_instance = Property.objects.get(pk=property_id)
        
        # Link the review to the current user and the specific property
        serializer.save(user=self.request.user, property=property_instance)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny] # Anyone can register

class PropertyImageCreateView(generics.CreateAPIView):
    queryset = PropertyImage.objects.all()
    serializer_class = PropertyImageSerializer
    parser_classes = (MultiPartParser, FormParser) # Allows handling file uploads
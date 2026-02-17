from django.shortcuts import render
from rest_framework import viewsets, generics, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.db.models import Q 
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings

from .models import Property, PropertyImage, Review, Booking, Report, Profile
from .serializers import (
    PropertySerializer, 
    PropertyImageSerializer, 
    BookingSerializer, 
    UserSerializer, 
    ReviewSerializer,
    ProfileSerializer,
)

# 1. PROPERTY VIEWSET
# 1. PROPERTY VIEWSET
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    # --- THIS WAS THE MISSING PIECE! ---
    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)

    def perform_update(self, serializer):
        # Only allow the landlord to edit/toggle availability
        if self.get_object().landlord == self.request.user:
            serializer.save()
        else:
            raise PermissionDenied("You can only edit your own properties.")

    def perform_destroy(self, instance):
        # Only allow the landlord to delete
        if instance.landlord == self.request.user:
            instance.delete()
        else:
            raise PermissionDenied("You can only delete your own properties.")

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        properties = self.queryset.filter(landlord=request.user)
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

    # --- FAVORITE TOGGLE ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        property = self.get_object()
        user = request.user
        
        if user in property.favorited_by.all():
            property.favorited_by.remove(user)
            return Response({"status": "removed from favorites", "is_favorited": False})
        else:
            property.favorited_by.add(user)
            return Response({"status": "added to favorites", "is_favorited": True})

    # --- GET FAVORITES ---
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def favorites(self, request):
        favorited_properties = Property.objects.filter(favorited_by=request.user)
        serializer = self.get_serializer(favorited_properties, many=True)
        return Response(serializer.data)

    # --- SUBMIT A REPORT ---
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def report(self, request, pk=None):
        property_instance = self.get_object()
        reason = request.data.get('reason')
        description = request.data.get('description', '')

        if not reason:
            return Response({"error": "Please select a reason for reporting."}, status=400)

        Report.objects.create(
            reporter=request.user,
            property=property_instance,
            reason=reason,
            description=description
        )
        return Response({"status": "Report submitted successfully to the admins."})
# 2. BOOKING VIEWSET
class BookingViewSet(viewsets.ModelViewSet):
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Booking.objects.filter(
            Q(student=user) | Q(property__landlord=user)
        ).distinct().order_by('-created_at')

    def perform_create(self, serializer):
        # Save the booking
        booking = serializer.save(student=self.request.user)
        
        # --- SEND EMAIL TO LANDLORD ---
        landlord_email = booking.property.landlord.email
        if landlord_email:
            send_mail(
                subject=f"New Booking Request: {booking.property.title}",
                message=f"Hello {booking.property.landlord.username},\n\nGood news! {self.request.user.username} has just requested to book '{booking.property.title}'.\n\nPlease log in to your CampusAcc Landlord Dashboard to review their profile and accept or reject the request.\n\nBest,\nThe CampusAcc Team",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[landlord_email],
                fail_silently=True,
            )

    # --- NEW: SEND EMAIL WHEN LANDLORD ACCEPTS/REJECTS ---
    def perform_update(self, serializer):
        booking = serializer.save()
        
        # Check if the status was just updated
        if 'status' in self.request.data:
            student_email = booking.student.email
            if student_email:
                status_word = booking.status.upper()
                send_mail(
                    subject=f"Booking Update: Your request was {status_word}",
                    message=f"Hello {booking.student.username},\n\nYour booking request for '{booking.property.title}' has been {booking.status} by the landlord.\n\nLog in to CampusAcc to view your requests.\n\nBest,\nThe CampusAcc Team",
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[student_email],
                    fail_silently=True,
                )

    @action(detail=False, methods=['get'])
    def manage(self, request):
        bookings = Booking.objects.filter(property__landlord=request.user).order_by('-created_at')
        serializer = self.get_serializer(bookings, many=True)
        return Response(serializer.data)
    
# 3. SPECIALIZED VIEWS
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

# 4. USER INFO VIEW (Cleaned up!)
class UserInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) # Allows uploading profile pictures

    def get(self, request):
        try:
            profile = request.user.profile
            # The serializer automatically pulls the email, phone, bio, etc.
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            print(f"Error fetching profile for {request.user.username}: {e}")
            # Fallback if profile fails
            return Response({
                "username": request.user.username, 
                "role": "student",
                "email": request.user.email
            })

    def patch(self, request):
        profile = request.user.profile
        serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    
# --- PASSWORD RESET VIEWS ---
class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny] # Anyone can request a reset

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        
        if user:
            # Generate secure token and encode the user's ID
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # Create the link to your React frontend
            reset_url = f"http://localhost:5173/reset-password/{uid}/{token}"
            
            # Send the email
            send_mail(
                subject="Reset Your CampusAcc Password",
                message=f"Hello {user.username},\n\nSomeone requested a password reset for your CampusAcc account.\n\nClick the link below to set a new password:\n{reset_url}\n\nIf you did not request this, please ignore this email.\n\nBest,\nThe CampusAcc Team",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=True,
            )
            
        # We always return success even if the email doesn't exist to prevent hackers from guessing emails
        return Response({"message": "If an account with that email exists, a reset link has been sent."})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        try:
            # Decode the user ID and find the user
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        # Check if the user exists and the token is valid/not expired
        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset successfully."})
        else:
            return Response({"error": "Invalid or expired reset link."}, status=400)
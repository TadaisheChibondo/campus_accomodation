from django.utils import timezone
from twilio.rest import Client
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

# --- NEW: Twilio specific imports ---
from django.http import HttpResponse
from twilio.twiml.messaging_response import MessagingResponse

from .models import Property, PropertyImage, Review, Booking, Report, Profile, Room
from .serializers import (
    PropertySerializer, 
    PropertyImageSerializer, 
    BookingSerializer, 
    UserSerializer, 
    ReviewSerializer,
    ProfileSerializer,
    RoomSerializer,
)

# 1. PROPERTY VIEWSET
class PropertyViewSet(viewsets.ModelViewSet):
    queryset = Property.objects.all()
    serializer_class = PropertySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(landlord=self.request.user)

    def perform_update(self, serializer):
        if self.get_object().landlord == self.request.user:
            serializer.save()
        else:
            raise PermissionDenied("You can only edit your own properties.")

    def perform_destroy(self, instance):
        if instance.landlord == self.request.user:
            instance.delete()
        else:
            raise PermissionDenied("You can only delete your own properties.")

    @action(detail=False, methods=['get'])
    def my_listings(self, request):
        properties = self.queryset.filter(landlord=request.user)
        serializer = self.get_serializer(properties, many=True)
        return Response(serializer.data)

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

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def favorites(self, request):
        favorited_properties = Property.objects.filter(favorited_by=request.user)
        serializer = self.get_serializer(favorited_properties, many=True)
        return Response(serializer.data)

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
        booking = serializer.save(student=self.request.user)
        landlord_email = booking.property.landlord.email
        if landlord_email:
            send_mail(
                subject=f"New Booking Request: {booking.property.title}",
                message=f"Hello {booking.property.landlord.username},\n\nGood news! {self.request.user.username} has just requested to book '{booking.property.title}'.\n\nPlease log in to your CampusAcc Landlord Dashboard to review their profile and accept or reject the request.\n\nBest,\nThe CampusAcc Team",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[landlord_email],
                fail_silently=True,
            )

    def perform_update(self, serializer):
        booking = serializer.save()
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

# 4. USER INFO VIEW
class UserInfoView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser) 

    def get(self, request):
        try:
            profile = request.user.profile
            serializer = ProfileSerializer(profile, context={'request': request})
            return Response(serializer.data)
        except Exception as e:
            print(f"Error fetching profile for {request.user.username}: {e}")
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
    
class RequestPasswordResetView(APIView):
    permission_classes = [permissions.AllowAny] 

    def post(self, request):
        email = request.data.get('email')
        user = User.objects.filter(email=email).first()
        
        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = f"http://localhost:5173/reset-password/{uid}/{token}"
            
            send_mail(
                subject="Reset Your CampusAcc Password",
                message=f"Hello {user.username},\n\nSomeone requested a password reset for your CampusAcc account.\n\nClick the link below to set a new password:\n{reset_url}\n\nIf you did not request this, please ignore this email.\n\nBest,\nThe CampusAcc Team",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[user.email],
                fail_silently=True,
            )
            
        return Response({"message": "If an account with that email exists, a reset link has been sent."})

class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            user.set_password(new_password)
            user.save()
            return Response({"message": "Password has been reset successfully."})
        else:
            return Response({"error": "Invalid or expired reset link."}, status=400)
        
class RoomCreateView(generics.CreateAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]

class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
    from rest_framework.permissions import IsAuthenticated
    permission_classes = [IsAuthenticated]


# 5. WHATSAPP BOT WEBHOOK
class WhatsAppWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        incoming_msg = request.data.get('Body', '').strip().lower()
        sender_phone = request.data.get('From', '')

        response = MessagingResponse()
        msg = response.message()

        # 1. THE STUDENT DISCOVERY COMMANDS
        if 'hello' in incoming_msg or 'hi' in incoming_msg:
            msg.body("Welcome to CampusAcc! 🎓\n\nLet's find your room. Reply with your maximum monthly budget (e.g., 150).")
        
        elif incoming_msg.isdigit():
            budget = int(incoming_msg)
            
            total_matches = Property.objects.filter(price_per_month__lte=budget, is_available=True).count()
            top_rooms = Property.objects.filter(price_per_month__lte=budget, is_available=True).order_by('price_per_month')[:5]
            
            if total_matches == 0:
                msg.body(f"Sorry, I couldn't find any available rooms under ${budget} right now. 😔 Try replying with a slightly higher budget!")
            else:
                response_text = f"I found {total_matches} available rooms under ${budget}! 🎉\n\nHere are the top picks:\n\n"
                
                for prop in top_rooms[:3]:
                    response_text += f"🏡 *{prop.title}*\n💰 ${prop.price_per_month}/month\n"
                    if prop.address: response_text += f"📍 {prop.address}\n"
                    
                    perks = []
                    if prop.has_wifi: perks.append("Wi-Fi")
                    if prop.has_solar: perks.append("Solar")
                    if prop.has_borehole: perks.append("Borehole")
                    if perks: response_text += f"✨ {', '.join(perks)}\n"
                        
                    response_text += f"👉 Reply 'BOOK {prop.id}' to request.\n\n"
                
                if total_matches > 3:
                    response_text += "*More options:*\n"
                    for prop in top_rooms[3:5]:
                        response_text += f"▪️ {prop.title} - ${prop.price_per_month}/mo\n"
                
                if total_matches > 5:
                    remaining = total_matches - 5
                    response_text += f"\n🌐 +{remaining} more listings found! View full galleries and chat with landlords here:\nhttps://studenthousing.co.zw/rooms"
                else:
                    response_text += "\n🌐 View full galleries and chat with landlords here:\nhttps://studenthousing.co.zw/rooms"
                
                msg.body(response_text)  
       
        elif incoming_msg.startswith('book '):
            parts = incoming_msg.split()
            if len(parts) >= 2 and parts[1].isdigit():
                prop_id = int(parts[1])
                try:
                    prop = Property.objects.get(id=prop_id)
                    clean_phone = sender_phone.replace('whatsapp:', '')
                    profile = Profile.objects.filter(phone_number=clean_phone).first()
                    
                    if profile:
                        user = profile.user
                    else:
                        user = User.objects.create_user(username=clean_phone, password='BotGeneratedPassword123!')
                        user.profile.phone_number = clean_phone
                        user.profile.save()
                    
                    if Booking.objects.filter(student=user).exists():
                        msg.body("You've already used your free WhatsApp booking request! 🚀\n\nTo apply for more rooms and chat with landlords, log in to your dashboard here:\nhttps://studenthousing.co.zw/login")
                    else:
                        Booking.objects.create(
                            property=prop,
                            student=user,
                            move_in_date=timezone.now().date(),
                            message="This request was generated automatically via the CampusAcc WhatsApp Discovery Bot."
                        )
                        
                        landlord_phone = prop.landlord.profile.phone_number
                        if landlord_phone:
                            if not landlord_phone.startswith('+'): landlord_phone = '+' + landlord_phone
                            try:
                                # SECURE IMPLEMENTATION: Pull credentials from settings
                                client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
                                client.messages.create(
                                    from_=settings.TWILIO_SANDBOX_NUMBER,
                                    to=f'whatsapp:{landlord_phone}',
                                    body=f"🚨 *New CampusAcc Booking!* 🚨\n\nA student ({clean_phone}) just requested to book '{prop.title}'.\n\nLog in to your dashboard to review and accept the request:\nhttps://studenthousing.co.zw/login"
                                )
                            except Exception as e:
                                print(f"Failed to send WhatsApp to landlord: {e}")

                        msg.body(f"✅ Success! Your booking request for '{prop.title}' has been sent directly to the landlord.\n\nThey will contact you right here on WhatsApp soon!")
                except Property.DoesNotExist:
                    msg.body("Oops! I couldn't find a property with that exact ID. 😔 Please check the number and try again.")
            else:
                msg.body("To book a room, reply with 'BOOK' followed by the ID number (e.g., BOOK 5).")

        # --- NEW: THE LANDLORD DASHBOARD COMMAND ---
        elif incoming_msg in ['update', 'manage']:
            clean_phone = sender_phone.replace('whatsapp:', '')
            profile = Profile.objects.filter(phone_number=clean_phone).first()
            
            # Security Check: Are they a registered landlord?
            if profile and profile.role == 'landlord':
                properties = Property.objects.filter(landlord=profile.user)
                
                if properties.exists():
                    response_text = "🛠️ *Landlord Dashboard*\n\nHere are your properties:\n\n"
                    for prop in properties:
                        status = "✅ AVAILABLE" if prop.is_available else "❌ FULL"
                        response_text += f"▪️ *{prop.title}*\n"
                        response_text += f"   Status: {status}\n"
                        response_text += f"   👉 Reply 'TOGGLE {prop.id}' to change.\n\n"
                    msg.body(response_text)
                else:
                    msg.body("You don't have any properties listed yet! Log in to the website to add your first room.")
            else:
                msg.body("Only registered landlords can use the 'update' command. If you are a student looking for a room, try saying 'Hi' or replying with your budget!")

        # --- NEW: THE LANDLORD TOGGLE COMMAND ---
        elif incoming_msg.startswith('toggle '):
            parts = incoming_msg.split()
            if len(parts) >= 2 and parts[1].isdigit():
                prop_id = int(parts[1])
                clean_phone = sender_phone.replace('whatsapp:', '')
                profile = Profile.objects.filter(phone_number=clean_phone).first()
                
                if profile and profile.role == 'landlord':
                    try:
                        # Double Security: Ensure this property actually belongs to THIS landlord
                        prop = Property.objects.get(id=prop_id, landlord=profile.user)
                        
                        # Flip the boolean switch
                        prop.is_available = not prop.is_available
                        prop.save()
                        
                        new_status = "✅ AVAILABLE" if prop.is_available else "❌ FULL"
                        msg.body(f"Success! 🔄\n\n*{prop.title}* is now marked as {new_status}.")
                        
                    except Property.DoesNotExist:
                        msg.body("Oops! I couldn't find a property with that ID that belongs to you. Please check the list and try again.")
                else:
                    msg.body("Only registered landlords can toggle property statuses.")
            else:
                msg.body("To change a property status, reply with 'TOGGLE' followed by the ID number (e.g., TOGGLE 5).")

        # 3. The Fallback (If they say something random)
        else:
            msg.body("I didn't quite catch that. Try saying 'Hi' to search for housing, or 'UPDATE' if you are a landlord!")

        return HttpResponse(str(response), content_type='application/xml')
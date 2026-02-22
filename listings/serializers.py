from rest_framework import serializers
# --- IMPORT ROOM HERE ---
from .models import Property, PropertyImage, Review, Booking, Profile, Room
from django.contrib.auth.models import User
import math

UNI_LAT = -20.165
UNI_LNG = 28.642

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False) 
    
    # Catch all the extra profile data from the frontend
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    program = serializers.CharField(write_only=True, required=False, allow_blank=True)
    year_of_study = serializers.CharField(write_only=True, required=False, allow_blank=True)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role', 'phone_number', 'program', 'year_of_study', 'company_name', 'bio'] 

    def create(self, validated_data):
        # 1. "Pop" (extract and remove) the profile data
        role = validated_data.pop('role', 'student')
        phone_number = validated_data.pop('phone_number', '')
        program = validated_data.pop('program', '')
        year_of_study = validated_data.pop('year_of_study', '')
        company_name = validated_data.pop('company_name', '')
        bio = validated_data.pop('bio', '')

        user = None

        # 2. THE UPGRADE BRIDGE: Check if a shadow account exists from WhatsApp
        if phone_number:
            # Ensure the format matches how the bot saved it
            clean_phone = phone_number.replace('whatsapp:', '').strip()
            
            # The bot uses the phone number as the username
            shadow_user = User.objects.filter(username=clean_phone).first()

            if shadow_user:
                # 💥 UPGRADE THE ACCOUNT 💥
                # We overwrite the phone number username with their actual chosen username
                shadow_user.username = validated_data['username']
                shadow_user.email = validated_data.get('email', '')
                shadow_user.set_password(validated_data['password'])
                shadow_user.save()
                
                user = shadow_user
        
        # 3. NORMAL REGISTRATION: If no shadow account exists, create normally
        if not user:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data['password']
            )
        
        # 4. Fill in the newly created (or upgraded) Profile with the data we popped earlier
        user.profile.role = role
        user.profile.phone_number = phone_number
        
        if role == 'student':
            user.profile.program = program
            user.profile.year_of_study = year_of_study
        elif role == 'landlord':
            user.profile.company_name = company_name
            user.profile.bio = bio
            
        user.profile.save()

        return user
class PropertyImageSerializer(serializers.ModelSerializer):
    # --- NEW: Fetch the text label of the room ---
    room_label = serializers.ReadOnlyField(source='room.label') 

    class Meta:
        model = PropertyImage
        # --- FIXED: Add 'room_label' to the fields array ---
        fields = ['id', 'image', 'property', 'room', 'room_label']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') 

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Profile
        fields = ['username', 'email', 'role', 'profile_picture', 'phone_number', 'program', 'year_of_study', 'bio', 'company_name']


# --- NEW: ROOM SERIALIZER ---
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'property', 'label', 'capacity', 'is_available']


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    landlord_name = serializers.CharField(source='landlord.username', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True) 
    distance = serializers.SerializerMethodField()
    
    landlord_profile_picture = serializers.ImageField(source='landlord.profile.profile_picture', read_only=True)
    landlord_phone = serializers.CharField(source='landlord.profile.phone_number', read_only=True)
    landlord_bio = serializers.CharField(source='landlord.profile.bio', read_only=True)
    landlord_company = serializers.CharField(source='landlord.profile.company_name', read_only=True)

    is_favorited = serializers.SerializerMethodField()
    
    # --- NEW: NEST THE ROOMS INSIDE THE PROPERTY ---
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'landlord_name', 'title', 'description', 'price_per_month', 
            'address', 'latitude', 'longitude', 'is_available', 'images', 
            'reviews', 'created_at', 'distance', 'gender_preference', 
            'landlord_profile_picture', 'landlord_phone', 'landlord_bio', 'landlord_company',
            'is_favorited', 'rooms', # <--- ADDED 'rooms'
            'has_wifi', 'has_borehole', 'has_solar', 
            'curfew', 'visitors_allowed', 'deposit_amount',
        ]
        read_only_fields = ['landlord', 'created_at']

    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(id=request.user.id).exists()
        return False

    def get_distance(self, obj):
        if not obj.latitude or not obj.longitude:
            return None
        
        try:
            lat1, lon1 = math.radians(UNI_LAT), math.radians(UNI_LNG)
            lat2, lon2 = math.radians(float(obj.latitude)), math.radians(float(obj.longitude))

            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
            c = 2 * math.asin(math.sqrt(a))
            
            km = 6371 * c
            return round(km, 1) 
        except (ValueError, TypeError):
            return None

class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    property_title = serializers.ReadOnlyField(source='property.title')
    
    # --- NEW: EXPOSE THE ROOM LABEL FOR THE DASHBOARDS ---
    room_label = serializers.ReadOnlyField(source='room.label')
    
    student_program = serializers.ReadOnlyField(source='student.profile.program')
    student_year = serializers.ReadOnlyField(source='student.profile.year_of_study')
    student_phone = serializers.ReadOnlyField(source='student.profile.phone_number')

    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'property_title', 'room', 'room_label', 'student', 'student_name', 
            'student_program', 'student_year', 'student_phone', 
            'move_in_date', 'message', 'status', 'created_at'
        ]
        read_only_fields = ['student', 'created_at']
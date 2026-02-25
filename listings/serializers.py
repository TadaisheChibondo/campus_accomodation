from rest_framework import serializers
from .models import Property, PropertyImage, Review, Booking, Profile, Room
from django.contrib.auth.models import User
import math

UNI_LAT = -20.165
UNI_LNG = 28.642

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False) 
    
    # --- NEW: Expose first_name and last_name for registration ---
    first_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    last_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    
    bio = serializers.CharField(write_only=True, required=False, allow_blank=True)
    phone_number = serializers.CharField(write_only=True, required=False, allow_blank=True)
    program = serializers.CharField(write_only=True, required=False, allow_blank=True)
    year_of_study = serializers.CharField(write_only=True, required=False, allow_blank=True)
    company_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name', 'role', 'phone_number', 'program', 'year_of_study', 'company_name', 'bio'] 

    def validate_username(self, value):
        if ' ' in value:
            raise serializers.ValidationError("Usernames cannot contain spaces. Use a single word for login.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        phone_number = validated_data.pop('phone_number', '')
        program = validated_data.pop('program', '')
        year_of_study = validated_data.pop('year_of_study', '')
        company_name = validated_data.pop('company_name', '')
        bio = validated_data.pop('bio', '')
        
        # Extract the real names
        first_name = validated_data.pop('first_name', '')
        last_name = validated_data.pop('last_name', '')

        if phone_number:
            phone_number = phone_number.strip()
            if phone_number.startswith('07'):
                phone_number = '+263' + phone_number[1:]
            elif phone_number.startswith('7'):
                phone_number = '+263' + phone_number

        user = None

        if phone_number:
            clean_phone = phone_number.replace('whatsapp:', '').strip()
            shadow_user = User.objects.filter(username=clean_phone).first()

            if shadow_user:
                shadow_user.username = validated_data['username']
                shadow_user.email = validated_data.get('email', '')
                shadow_user.set_password(validated_data['password'])
                # Upgrade the shadow account with their real name!
                shadow_user.first_name = first_name
                shadow_user.last_name = last_name
                shadow_user.save()
                
                user = shadow_user
        
        if not user:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data.get('email', ''),
                password=validated_data['password'],
                first_name=first_name, 
                last_name=last_name
            )
        
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
    room_label = serializers.ReadOnlyField(source='room.label') 

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'property', 'room', 'room_label']


class ReviewSerializer(serializers.ModelSerializer):
    # --- NEW: Show Full Name instead of username ---
    user = serializers.SerializerMethodField() 

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']
        
    def get_user(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')
    
    # --- NEW: Add full_name field to profile ---
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['username', 'email', 'full_name', 'role', 'profile_picture', 'phone_number', 'program', 'year_of_study', 'bio', 'company_name']

    def get_full_name(self, obj):
        name = f"{obj.user.first_name} {obj.user.last_name}".strip()
        return name if name else obj.user.username


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'property', 'label', 'capacity', 'is_available']


class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True) 
    distance = serializers.SerializerMethodField()
    
    # --- NEW: Return Full Name for the Landlord ---
    landlord_name = serializers.SerializerMethodField()
    
    landlord_profile_picture = serializers.ImageField(source='landlord.profile.profile_picture', read_only=True)
    landlord_phone = serializers.CharField(source='landlord.profile.phone_number', read_only=True)
    landlord_bio = serializers.CharField(source='landlord.profile.bio', read_only=True)
    landlord_company = serializers.CharField(source='landlord.profile.company_name', read_only=True)

    is_favorited = serializers.SerializerMethodField()
    rooms = RoomSerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'landlord_name', 'title', 'description', 'price_per_month', 
            'address', 'latitude', 'longitude', 'is_available', 'images', 
            'reviews', 'created_at', 'distance', 'gender_preference', 
            'landlord_profile_picture', 'landlord_phone', 'landlord_bio', 'landlord_company',
            'is_favorited', 'rooms',
            'has_wifi', 'has_borehole', 'has_solar', 
            'curfew', 'visitors_allowed', 'deposit_amount',
        ]
        read_only_fields = ['landlord', 'created_at']

    def get_landlord_name(self, obj):
        name = f"{obj.landlord.first_name} {obj.landlord.last_name}".strip()
        return name if name else obj.landlord.username

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
    # --- NEW: Return Full Name for the Student ---
    student_name = serializers.SerializerMethodField()
    
    property_title = serializers.ReadOnlyField(source='property.title')
    room_label = serializers.ReadOnlyField(source='room.label')
    student_program = serializers.ReadOnlyField(source='student.profile.program')
    student_year = serializers.ReadOnlyField(source='student.profile.year_of_study')
    student_phone = serializers.ReadOnlyField(source='student.profile.phone_number')
    landlord_phone = serializers.ReadOnlyField(source='property.landlord.profile.phone_number')

    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'property_title', 'room', 'room_label', 'student', 'student_name', 
            'student_program', 'student_year', 'student_phone', 'landlord_phone',
            'move_in_date', 'message', 'status', 'created_at'
        ]
        read_only_fields = ['student', 'created_at']

    def get_student_name(self, obj):
        name = f"{obj.student.first_name} {obj.student.last_name}".strip()
        return name if name else obj.student.username
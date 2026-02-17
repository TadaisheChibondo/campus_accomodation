from rest_framework import serializers
from .models import Property, PropertyImage, Review, Booking, Profile
from django.contrib.auth.models import User
import math

# --- CONSTANTS: Coordinates of the University ---
UNI_LAT = -17.784
UNI_LNG = 31.053

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False) # Accept 'role' from frontend

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role'] # Add role here

    def create(self, validated_data):
        # Extract role from data (default to student if missing)
        role = validated_data.pop('role', 'student')
        
        # Create User
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )

        # Update the Profile with the correct role
        user.profile.role = role
        user.profile.save()
        
        return user
    
class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'property']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') # Show username, don't ask for ID

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    email = serializers.ReadOnlyField(source='user.email')

    class Meta:
        model = Profile
        # --- ADDED: bio and company_name ---
        fields = ['username', 'email', 'role', 'profile_picture', 'phone_number', 'program', 'year_of_study', 'bio', 'company_name']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    landlord_name = serializers.CharField(source='landlord.username', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True) 
    distance = serializers.SerializerMethodField()
    
    landlord_profile_picture = serializers.ImageField(source='landlord.profile.profile_picture', read_only=True)
    landlord_phone = serializers.CharField(source='landlord.profile.phone_number', read_only=True)
    landlord_bio = serializers.CharField(source='landlord.profile.bio', read_only=True)
    landlord_company = serializers.CharField(source='landlord.profile.company_name', read_only=True)

    # --- NEW: IS FAVORITED FIELD ---
    is_favorited = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'landlord_name', 'title', 'description', 'price_per_month', 
            'address', 'latitude', 'longitude', 'is_available', 'images', 
            'reviews', 'created_at', 'distance', 'gender_preference', 
            'landlord_profile_picture', 'landlord_phone', 'landlord_bio', 'landlord_company',
            'is_favorited' # <--- ADDED TO FIELDS LIST
        ]
        read_only_fields = ['landlord', 'created_at']

    # --- NEW: MATH LOGIC TO CHECK IF LOGGED IN USER LIKED IT ---
    def get_is_favorited(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.favorited_by.filter(id=request.user.id).exists()
        return False

    # (Keep your get_distance logic right below here as normal)
    # THE MATH LOGIC FOR DISTANCE
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
    
    student_program = serializers.ReadOnlyField(source='student.profile.program')
    student_year = serializers.ReadOnlyField(source='student.profile.year_of_study')
    student_phone = serializers.ReadOnlyField(source='student.profile.phone_number')

    class Meta:
        model = Booking
        fields = [
            'id', 'property', 'property_title', 'student', 'student_name', 
            'student_program', 'student_year', 'student_phone', 
            'move_in_date', 'message', 'status', 'created_at'
        ]
        read_only_fields = ['student', 'created_at']
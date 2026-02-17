from rest_framework import serializers
from .models import Property, PropertyImage, Review, Booking
from django.contrib.auth.models import User
from .models import Profile
import math

# --- CONSTANTS: Coordinates of the University ---
# (Change these to your real campus location!)
UNI_LAT = -17.784
UNI_LNG = 31.053

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'student')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        user.profile.role = role
        user.profile.save()
        return user
    
class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'property']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') 

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    landlord_name = serializers.CharField(source='landlord.username', read_only=True)
    reviews = ReviewSerializer(many=True, read_only=True)
    
    # 1. NEW FIELD HERE
    distance = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'landlord_name', 'title', 'description', 'price_per_month', 
            'address', 'latitude', 'longitude', 'is_available', 'images', 
            'reviews', 'created_at', 'distance' # <--- 2. ADD 'distance' TO FIELDS
        ]
        read_only_fields = ['landlord', 'created_at']

    # 3. THE MATH LOGIC
    def get_distance(self, obj):
        if not obj.latitude or not obj.longitude:
            return None
        
        try:
            # Convert latitude and longitude from degrees to radians
            lat1, lon1 = math.radians(UNI_LAT), math.radians(UNI_LNG)
            lat2, lon2 = math.radians(float(obj.latitude)), math.radians(float(obj.longitude))

            # Haversine formula
            dlon = lon2 - lon1
            dlat = lat2 - lat1
            a = math.sin(dlat / 2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon / 2)**2
            c = 2 * math.asin(math.sqrt(a))
            
            # Radius of earth in kilometers is 6371
            km = 6371 * c
            return round(km, 1) # Returns format like "1.5"
        except (ValueError, TypeError):
            return None

class BookingSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    property_title = serializers.ReadOnlyField(source='property.title')
     

    class Meta:
        model = Booking
        fields = ['id', 'property', 'property_title', 'student', 'student_name', 'move_in_date', 'message', 'status', 'created_at']
        read_only_fields = ['student', 'created_at']
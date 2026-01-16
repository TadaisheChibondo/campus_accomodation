from rest_framework import serializers
from .models import Property, PropertyImage, Review, Booking
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email']

    def create(self, validated_data):
        # This securely hashes the password (never store plain text passwords!)
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user
    
class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'property']

# listings/serializers.py

# 1. Add this NEW serializer at the top (before PropertySerializer)
class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.ReadOnlyField(source='user.username') # Show username, don't ask for ID

    class Meta:
        model = Review
        fields = ['id', 'user', 'rating', 'comment', 'created_at']

# 2. UPDATE the existing PropertySerializer to include the reviews
class PropertySerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    landlord_name = serializers.CharField(source='landlord.username', read_only=True)
    
    # Add this line to show reviews inside the house data
    reviews = ReviewSerializer(many=True, read_only=True) 

    class Meta:
        model = Property
        fields = [
            'id', 'landlord_name', 'title', 'description', 'price_per_month', 
            'address', 'latitude', 'longitude', 'is_available', 'images', 
            'reviews', 'created_at' # <--- Don't forget to add 'reviews' here!
        ]
 

class BookingSerializer(serializers.ModelSerializer):
    # Read-only fields so the frontend doesn't need to send them (and can't fake them)
    student_name = serializers.ReadOnlyField(source='student.username')
    property_title = serializers.ReadOnlyField(source='property.title')
    status = serializers.ReadOnlyField() 

    class Meta:
        model = Booking
        fields = ['id', 'property', 'property_title', 'student', 'student_name', 'move_in_date', 'message', 'status', 'created_at']
        read_only_fields = ['student', 'created_at'] # Auto-filled by backend
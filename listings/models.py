from django.db import models
from django.contrib.auth.models import User # Using Django's built-in user for now

# Create your models here.

class Property(models.Model):
    # Link to the Landlord (If landlord is deleted, delete their houses too)
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    
    # Basic Details
    title = models.CharField(max_length=200, help_text="e.g., 'Modern 2-Bed Cottage near Main Gate'")
    description = models.TextField(help_text="Include amenities like Wi-Fi, Solar, Water tank")
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2)
    address = models.CharField(max_length=255)
    
    # The 'Killer Feature' Data: GPS Coordinates
    # We use FloatField for simple storage. 
    # Later, the frontend sends these numbers from the map pin.
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    
    # Status
    is_available = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} - ${self.price_per_month}"

# We need a separate model for Images so a house can have MULTIPLE pictures
class PropertyImage(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='property_photos/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.property.title}"

# listings/models.py (Add this to the bottom)

from django.core.validators import MinValueValidator, MaxValueValidator

class Review(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE) # The student writing the review
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)]) # 1 to 5 stars
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.rating} stars for {self.property.title}"
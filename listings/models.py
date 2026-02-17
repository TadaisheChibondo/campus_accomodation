from django.db import models
from django.contrib.auth.models import User # Using Django's built-in user for now
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.validators import MinValueValidator, MaxValueValidator

# Create your models here.

class Property(models.Model):
    landlord = models.ForeignKey(User, on_delete=models.CASCADE, related_name='properties')
    title = models.CharField(max_length=200, help_text="e.g., 'Modern 2-Bed Cottage near Main Gate'")
    description = models.TextField(help_text="Include amenities like Wi-Fi, Solar, Water tank")
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2)
    address = models.CharField(max_length=255)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    gender_preference = models.CharField(max_length=10, choices=[('Mixed', 'Mixed (Gents & Ladies)'), ('Gents', 'Gents Only'), ('Ladies', 'Ladies Only')], default='Mixed')
    is_available = models.BooleanField(default=True)
    
    # --- NEW: FAVORITES RELATIONSHIP ---
    favorited_by = models.ManyToManyField(User, related_name='favorite_properties', blank=True)
    
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

# class Review(models.Model):
#     property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
#     user = models.ForeignKey(User, on_delete=models.CASCADE) # The student writing the review
#     rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)]) # 1 to 5 stars
#     comment = models.TextField()
#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"{self.rating} stars for {self.property.title}"
    
class Review(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    # --- ADD THIS CLASS META ---
    class Meta:
        # This ensures one user can only review a specific property ONCE
        unique_together = ('user', 'property')

    def __str__(self):
        return f"{self.user.username} - {self.property.title}"

# ... your existing Property model is here ...

class Booking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('rejected', 'Rejected'),
    ]

    property = models.ForeignKey('Property', on_delete=models.CASCADE, related_name='bookings')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='my_bookings')
    move_in_date = models.DateField()
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.username} -> {self.property.title} ({self.status})"
    

# ... (Your existing Property model) ...

# 1. NEW MODEL: Stores the Role
# 1. NEW MODEL: Stores the Role and Profile Data
# 1. NEW MODEL: Stores the Role and Profile Data
class Profile(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('landlord', 'Landlord'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    
    # --- SHARED FIELDS ---
    profile_picture = models.ImageField(upload_to='profile_pics/', blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    # --- STUDENT ONLY FIELDS ---
    program = models.CharField(max_length=100, blank=True, help_text="e.g. Computer Science")
    year_of_study = models.CharField(max_length=20, blank=True, help_text="e.g. Year 2")

    # --- NEW: LANDLORD ONLY FIELDS ---
    bio = models.TextField(blank=True, help_text="Tell students about yourself or your property rules.")
    company_name = models.CharField(max_length=100, blank=True, help_text="Optional: If you operate as a business.")

    def __str__(self):
        return f"{self.user.username} - {self.role}"
    
# 2. SIGNAL: Automatically create a Profile when a User registers
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()

# --- NEW: REPORTING SYSTEM ---
class Report(models.Model):
    REASON_CHOICES = [
        ('fake', 'Fake Listing / Scam'),
        ('unavailable', 'Property is already taken'),
        ('inappropriate', 'Inappropriate Content or Rules'),
        ('other', 'Other Issue'),
    ]
    reporter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports_made')
    property = models.ForeignKey(Property, on_delete=models.CASCADE, related_name='reports')
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True, help_text="Additional details provided by the student.")
    created_at = models.DateTimeField(auto_now_add=True)
    is_resolved = models.BooleanField(default=False, help_text="Mark as true once the admin has handled this.")

    def __str__(self):
        return f"Report by {self.reporter.username} on {self.property.title}"
    
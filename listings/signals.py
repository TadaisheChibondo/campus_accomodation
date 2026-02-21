from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.models import User 
from .models import Profile

# 1. This triggers when a new User is created
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        # --- FIXED: Use get_or_create instead of create ---
        Profile.objects.get_or_create(user=instance)

# 2. This triggers when an existing User is saved
@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
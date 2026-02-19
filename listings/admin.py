from django.contrib import admin
from .models import Property, PropertyImage, Review, Booking, Profile, Report, Room 

# This tells Django to show these tables in the Admin Dashboard
admin.site.register(Property)
admin.site.register(PropertyImage)
admin.site.register(Review)
admin.site.register(Booking)
admin.site.register(Profile)
admin.site.register(Report)
admin.site.register(Room)
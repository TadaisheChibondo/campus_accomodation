from django.contrib import admin
from .models import Property, PropertyImage

# This class allows you to upload multiple images directly inside the Property page
class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1

class PropertyAdmin(admin.ModelAdmin):
    list_display = ('title', 'price_per_month', 'is_available', 'landlord')
    inlines = [PropertyImageInline] # Connects the images to the property

admin.site.register(Property, PropertyAdmin)
admin.site.register(PropertyImage)
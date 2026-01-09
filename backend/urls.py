"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import HttpResponse
from django.contrib.auth.models import User


def emergency_reset(request):
    try:
        # checks if user exists, if not, it creates one
        admin_user, created = User.objects.get_or_create(username='admin')
        
        # Force the user to be an admin with a specific password
        admin_user.set_password('campus123')
        admin_user.email = 'admin@campus.com'
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        
        if created:
            return HttpResponse("Success! Created NEW superuser 'admin' with password 'campus123'")
        else:
            return HttpResponse("Success! Reset password for EXISTING 'admin' to 'campus123'")
            
    except Exception as e:
        return HttpResponse(f"Error: {str(e)}")
 


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('listings.urls')),
    path('api/', include('listings.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'), # LOGIN
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('emergency-reset/', emergency_reset),

]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)


# In backend/urls.py
   

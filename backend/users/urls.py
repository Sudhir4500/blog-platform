from django.urls import path
from .views import RegisterView, LoginView, UserProfileView, UserDetailView, UserUpdateView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('auth/me/', UserProfileView.as_view(), name='profile'),
    path('users/<int:id>/', UserDetailView.as_view(), name='user_detail'),
    path('users/<uuid:uuid>/', UserDetailView.as_view(), name='user_detail'),
    path('users/<uuid:uuid>/update/', UserUpdateView.as_view(), name='user_update'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh')
    
]
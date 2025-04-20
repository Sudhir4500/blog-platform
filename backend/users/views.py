from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import User
from .serializers import UserSerializer, RegisterSerializer, UpdateUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import logging

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            logger.info(f"User registered: {user.email}")
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')  # Changed from 'email'
        password = request.data.get('password')
        if not username or not password:
            logger.warning(f"Login attempt with missing credentials: username={username}")
            return Response({'error': 'Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)
        user = authenticate(request, username=username, password=password)  # Changed to 'username'
        if user:
            refresh = RefreshToken.for_user(user)
            logger.info(f"Successful login for user: {username}")
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        logger.warning(f"Failed login attempt for username: {username}")
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uuid):  # Changed 'uuid' to 'id'
        try:
            user = User.objects.get(id=uuid)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UserUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, uuid):
        return self.update_profile(request, uuid)

    def post(self, request, uuid):  # Add POST support
        return self.update_profile(request, uuid)

    def update_profile(self, request, uuid):
        if str(request.user.id) != str(uuid):
            return Response({'error': 'You can only update your own profile'}, status=status.HTTP_403_FORBIDDEN)
        user = request.user
        serializer = UpdateUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import User
from .serializers import UserSerializer, RegisterSerializer, UpdateUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
import logging
from django.db.models import Q

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
                'user': UserSerializer(user, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('username')
        password = request.data.get('password')

        if not identifier or not password:
            logger.warning(f"Login attempt with missing credentials: identifier={identifier}")
            return Response({'error': 'Email/Username and password are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            if '@' in identifier:
                user = User.objects.get(email__iexact=identifier)
            else:
                user = User.objects.get(username__iexact=identifier)
        except User.DoesNotExist:
            logger.warning(f"Failed login attempt - user not found: {identifier}")
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        user = authenticate(request, username=user.username, password=password)
        if user:
            refresh = RefreshToken.for_user(user)
            logger.info(f"Successful login for user: {identifier}")
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user, context={'request': request}).data
            }, status=status.HTTP_200_OK)

        logger.warning(f"Failed login attempt for identifier: {identifier}")
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

class UserProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, uuid):
        try:
            user = User.objects.get(id=uuid)
            serializer = UserSerializer(user, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UserUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, uuid):
        return self.update_profile(request, uuid)

    def post(self, request, uuid):
        return self.update_profile(request, uuid)

    def update_profile(self, request, uuid):
        if str(request.user.id) != str(uuid):
            return Response({'error': 'You can only update your own profile'}, status=status.HTTP_403_FORBIDDEN)
        user = request.user
        serializer = UpdateUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(user, context={'request': request}).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class FollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, uuid):
        try:
            user_to_follow = User.objects.get(id=uuid)
            if user_to_follow == request.user:
                return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
            if request.user.following.filter(id=uuid).exists():
                return Response({'error': 'You are already following this user'}, status=status.HTTP_400_BAD_REQUEST)
            request.user.following.add(user_to_follow)
            logger.info(f"User {request.user.username} followed user {user_to_follow.username}")
            serializer = UserSerializer(user_to_follow, context={'request': request})
            return Response({
                'message': 'Followed successfully',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

class UnfollowUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, uuid):
        try:
            user_to_unfollow = User.objects.get(id=uuid)
            if not request.user.following.filter(id=uuid).exists():
                return Response({'error': 'You are not following this user'}, status=status.HTTP_400_BAD_REQUEST)
            request.user.following.remove(user_to_unfollow)
            logger.info(f"User {request.user.username} unfollowed user {user_to_unfollow.username}")
            serializer = UserSerializer(user_to_unfollow, context={'request': request})
            return Response({
                'message': 'Unfollowed successfully',
                'user': serializer.data
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        

class UserSearchView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = request.query_params.get('query', '')
        if not query:
            logger.warning("User search attempted with empty query")
            return Response({'error': 'Search query is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Search users by username or email (case-insensitive)
            users = User.objects.filter(
                Q(username__icontains=query) | Q(email__icontains=query)
            )
            serializer = UserSerializer(users, many=True, context={'request': request})
            logger.info(f"User search for query '{query}' returned {len(users)} results")
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"User search error: {str(e)}")
            return Response({'error': 'An error occurred while searching'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
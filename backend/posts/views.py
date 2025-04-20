import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .models import Post, PostImage, Tag
from .serializers import PostSerializer
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()


class PostListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tag = request.query_params.get('tag')
        if tag:
            posts = Post.objects.filter(tags__name=tag.lower())
        else:
            posts = Post.objects.all()
        serializer = PostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        logger.debug(f"Request data: {request.data}")
        logger.debug(f"Request files: {request.FILES}")
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            post = serializer.save()
            # Handle image uploads
            images = request.FILES.getlist('images[]', [])  # Try 'images[]' first
            if not images:
                images = request.FILES.getlist('images', [])  # Fallback to 'images'
            logger.debug(f"Processing {len(images)} images")
            logger.debug(f"Received images: {images}")

            for image in images:
                try:
                    post_image = PostImage.objects.create(post=post, image=image)
                    logger.debug(f"Saved image: {image.name}, Cloudinary URL: {post_image.image.url}")
                except Exception as e:
                    logger.error(f"Failed to save image {image.name}: {str(e)}")
            return Response(PostSerializer(post).data, status=status.HTTP_201_CREATED)
        logger.error(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostDetailView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, id):
        try:
            post = Post.objects.get(id=id)
            serializer = PostSerializer(post)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

class PostUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, id):
        try:
            post = Post.objects.get(id=id)
            if post.user != request.user:
                return Response({'error': 'You can only update your own posts'}, status=status.HTTP_403_FORBIDDEN)
            serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})
            if serializer.is_valid():
                post = serializer.save()
                # Handle image uploads (optional: replace or add)
                images = request.FILES.getlist('images', [])
                if images:
                    post.images.all().delete()  # Optional: Clear existing images
                    for image in images:
                        PostImage.objects.create(post=post, image=image)
                return Response(PostSerializer(post).data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

class UserPostsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, user_id):
        try:
            posts = Post.objects.filter(user__id=user_id)
            serializer = PostSerializer(posts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        

class PostDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, id):
        try:
            post = Post.objects.get(id=id)
            if post.user != request.user:
                logger.warning(f"User {request.user.username} attempted to delete post {id} owned by another user")
                return Response({'error': 'You can only delete your own posts'}, status=status.HTTP_403_FORBIDDEN)
            post.delete()
            logger.info(f"Post {id} deleted by user {request.user.username}")
            return Response({'message': 'Post deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            logger.error(f"Post {id} not found for deletion")
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.contenttypes.models import ContentType
from posts.models import Post
from comments.models import Comment
from .models import Like
from .serializers import LikeSerializer

logger = logging.getLogger(__name__)

class PostLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            content_type = ContentType.objects.get_for_model(Post)
            # Check if already liked
            like = Like.objects.filter(
                user=request.user,
                content_type=content_type,
                object_id=post_id
            ).first()
            if like:
                # Unlike: Delete the like
                like.delete()
                return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
            # Like: Create a new like
            serializer = LikeSerializer(
                data={},
                context={
                    'request': request,
                    'content_type': content_type,
                    'object_id': post_id
                }
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

class CommentLikeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, comment_id):
        try:
            comment = Comment.objects.get(id=comment_id)
            content_type = ContentType.objects.get_for_model(Comment)
            # Check if already liked
            like = Like.objects.filter(
                user=request.user,
                content_type=content_type,
                object_id=comment_id
            ).first()
            if like:
                # Unlike: Delete the like
                like.delete()
                return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
            # Like: Create a new like
            serializer = LikeSerializer(
                data={},
                context={
                    'request': request,
                    'content_type': content_type,
                    'object_id': comment_id
                }
            )
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)

class PostLikesListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, post_id):
        try:
            Post.objects.get(id=post_id)
            content_type = ContentType.objects.get_for_model(Post)
            likes = Like.objects.filter(content_type=content_type, object_id=post_id)
            serializer = LikeSerializer(likes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

class CommentLikesListView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, comment_id):
        try:
            Comment.objects.get(id=comment_id)
            content_type = ContentType.objects.get_for_model(Comment)
            likes = Like.objects.filter(content_type=content_type, object_id=comment_id)
            serializer = LikeSerializer(likes, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Comment.DoesNotExist:
            return Response({'error': 'Comment not found'}, status=status.HTTP_404_NOT_FOUND)
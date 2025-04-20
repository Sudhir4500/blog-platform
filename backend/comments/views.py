import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from posts.models import Post
from .models import Comment
from .serializers import CommentSerializer

logger = logging.getLogger(__name__)

class CommentListCreateView(APIView):
    def get(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            # Get top-level comments (no parent)
            comments = Comment.objects.filter(post=post, parent__isnull=True).order_by('created_at')
            serializer = CommentSerializer(comments, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

    def post(self, request, post_id):
        try:
            post = Post.objects.get(id=post_id)
            serializer = CommentSerializer(
                data=request.data,
                context={'request': request, 'post': post}
            )
            if serializer.is_valid():
                comment = serializer.save()
                return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)
            logger.error(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)
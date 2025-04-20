from django.urls import path
from .views import PostLikeView, CommentLikeView, PostLikesListView, CommentLikesListView

urlpatterns = [
    path('posts/<uuid:post_id>/like/', PostLikeView.as_view(), name='post_like'),
    path('comments/<uuid:comment_id>/like/', CommentLikeView.as_view(), name='comment_like'),
    path('posts/<uuid:post_id>/likes/', PostLikesListView.as_view(), name='post_likes_list'),
    path('comments/<uuid:comment_id>/likes/', CommentLikesListView.as_view(), name='comment_likes_list'),
]
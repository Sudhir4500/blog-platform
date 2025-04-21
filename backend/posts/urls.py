from django.urls import path
from .views import FollowingPostsView, PostListCreateView, PostDetailView, PostUpdateView, UserPostsView, PostDeleteView

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post_list_create'),
    path('posts/<uuid:id>/', PostDetailView.as_view(), name='post_detail'),
    path('posts/<uuid:id>/update/', PostUpdateView.as_view(), name='post_update'),
    path('posts/user/<uuid:user_id>/', UserPostsView.as_view(), name='user_posts'),
    path('posts/<uuid:id>/delete/', PostDeleteView.as_view(), name='post_delete'),
    path('posts/following/', FollowingPostsView.as_view(), name='following-posts'),

]
from django.urls import path
from .views import PostListCreateView, PostDetailView, PostUpdateView, UserPostsView

urlpatterns = [
    path('posts/', PostListCreateView.as_view(), name='post_list_create'),
    path('posts/<uuid:id>/', PostDetailView.as_view(), name='post_detail'),
    path('posts/<uuid:id>/update/', PostUpdateView.as_view(), name='post_update'),
    path('posts/user/<uuid:user_id>/', UserPostsView.as_view(), name='user_posts'),
    
]
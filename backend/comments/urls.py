from django.urls import path
from .views import CommentListCreateView

urlpatterns = [
    path('posts/<uuid:post_id>/comments/', CommentListCreateView.as_view(), name='comment_list_create'),
]
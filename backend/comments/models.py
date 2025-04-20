import uuid
from django.db import models
from django.contrib.auth import get_user_model
from posts.models import Post
from mptt.models import MPTTModel, TreeForeignKey

User = get_user_model()

class Comment(MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField(max_length=1000)
    parent = TreeForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='children'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class MPTTMeta:
        order_insertion_by = ['created_at']

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment by {self.user.username} on {self.post.title}"

    def save(self, *args, **kwargs):
        # Enforce max depth of 3 levels
        max_depth = 3
        if self.parent and self.parent.get_level() >= max_depth - 1:
            raise ValueError("Comments cannot be nested more than 3 levels deep.")
        super().save(*args, **kwargs)
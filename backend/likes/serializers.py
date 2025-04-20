from rest_framework import serializers
from .models import Like
from users.serializers import UserSerializer

class LikeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Like
        fields = ['id', 'user', 'content_type', 'object_id', 'created_at']
        read_only_fields = ['user', 'content_type', 'object_id', 'created_at']

    def create(self, validated_data):
        # Content type and object_id are set in the view
        user = self.context['request'].user
        content_type = self.context['content_type']
        object_id = self.context['object_id']
        like, created = Like.objects.get_or_create(
            user=user,
            content_type=content_type,
            object_id=object_id
        )
        return like
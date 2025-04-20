from rest_framework import serializers
from .models import Comment
from users.serializers import UserSerializer
# from mptt.templatetags.mptt_tags import recurse_tree

class CommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    children = serializers.SerializerMethodField()
    parent_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Comment
        fields = ['id', 'post', 'user', 'text', 'parent_id', 'created_at', 'children']
        read_only_fields = ['post', 'user', 'created_at']

    def get_children(self, obj):
        # Recursively serialize child comments
        descendants = obj.get_children().order_by('created_at')
        return CommentSerializer(descendants, many=True).data

    def validate_parent_id(self, value):
        if value:
            try:
                parent = Comment.objects.get(id=value, post=self.context['post'])
                # Check depth
                max_depth = 3
                if parent.get_level() >= max_depth - 1:
                    raise serializers.ValidationError("Cannot nest comments more than 3 levels deep.")
            except Comment.DoesNotExist:
                raise serializers.ValidationError("Parent comment does not exist or does not belong to this post.")
        return value

    def create(self, validated_data):
        parent_id = validated_data.pop('parent_id', None)
        post = self.context['post']
        user = self.context['request'].user
        parent = None
        if parent_id:
            parent = Comment.objects.get(id=parent_id, post=post)
        comment = Comment.objects.create(
            post=post,
            user=user,
            parent=parent,
            **validated_data
        )
        return comment
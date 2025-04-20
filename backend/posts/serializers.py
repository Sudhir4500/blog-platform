from rest_framework import serializers
from .models import Post, PostImage, Tag
from users.serializers import UserSerializer
import cloudinary.uploader
import cloudinary.utils

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['name']

class PostImageSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = PostImage
        fields = ['image']

    def get_image(self, obj):
        if obj.image:
            return obj.image.url  # ✅ This gives you the direct image URL
        return None
    



class PostSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    images = PostImageSerializer(many=True, read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    tag_names = serializers.ListField(
        child=serializers.CharField(), write_only=True, required=False
    )

    class Meta:
        model = Post
        fields = ['id', 'title', 'content', 'user', 'created_at', 'updated_at', 'images', 'tags', 'tag_names']

    def create(self, validated_data):
        tag_names = validated_data.pop('tag_names', [])
        user = self.context['request'].user
        post = Post.objects.create(user=user, **validated_data)
        for name in tag_names:
            tag, _ = Tag.objects.get_or_create(name=name.lower())
            post.tags.add(tag)
        return post

    def update(self, instance, validated_data):
        tag_names = validated_data.pop('tag_names', None)
        instance.title = validated_data.get('title', instance.title)
        instance.content = validated_data.get('content', instance.content)
        instance.save()

        if tag_names is not None:
            instance.tags.clear()
            for name in tag_names:
                tag, _ = Tag.objects.get_or_create(name=name.lower())
                instance.tags.add(tag)

        return instance
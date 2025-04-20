from rest_framework import serializers
from .models import User
from cloudinary.utils import cloudinary_url
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'avatar']

    def get_avatar(self, obj):
        if obj.avatar:
            url, options = cloudinary_url(obj.avatar.public_id)
            return url
        return None

# users/serializers.py
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

class UpdateUserSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = ['username', 'bio', 'avatar']

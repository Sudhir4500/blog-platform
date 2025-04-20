# users/models.py
import uuid
from django.contrib.auth.models import AbstractUser
from django.db import models
from cloudinary.models import CloudinaryField
class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    bio = models.TextField(max_length=500, blank=True)
    avatar = CloudinaryField('image', blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)
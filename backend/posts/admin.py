from django.contrib import admin
from .models import Post,Tag,PostImage

# Register your models here.
class PostAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'user', 'created_at', 'updated_at')
    search_fields = ('title', 'content')
    list_filter = ('created_at', 'updated_at')
    ordering = ('-created_at',)

admin.site.register(Post, PostAdmin)
admin.site.register(Tag)
admin.site.register(PostImage)
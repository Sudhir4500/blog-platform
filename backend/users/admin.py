from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_active', 'is_staff', 'follower_count', 'following_count')
    list_filter = ('is_staff', 'is_active')
    ordering = ('email',)
    search_fields = ('email', 'username')
    
    # Include only followers in fieldsets, as following is a related_name
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('bio', 'avatar')}),
        ('Followers', {'fields': ('followers',)}),  # Removed 'following'
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login',)}),
    )

    # Use filter_horizontal for a better UI to manage ManyToManyField
    filter_horizontal = ('followers',)

    # Custom methods to display counts in the list view
    def follower_count(self, obj):
        return obj.followers.count()
    follower_count.short_description = 'Followers'

    def following_count(self, obj):
        return obj.following.count()
    following_count.short_description = 'Following'

admin.site.register(User, UserAdmin)
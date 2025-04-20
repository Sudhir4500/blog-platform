from django.contrib import admin
from . models  import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
# Register your models here.

class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'is_active', 'is_staff')
    list_filter = ('is_staff', 'is_active')
    ordering = ('email',)
    search_fields = ('email', 'username')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'password')}),
        ('Personal info', {'fields': ('bio', 'avatar')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Important dates', {'fields': ('last_login',)}),
    )
    # add_fieldsets = (
    #     (None, {
    #         'classes': ('wide',),
    #         'fields': ('username', 'email', 'password1', 'password2'),
    #     }),
    # )

admin.site.register(User, UserAdmin)
# admin.site.register(User)

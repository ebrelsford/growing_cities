from django.contrib import admin

from .models import Button


class ButtonAdmin(admin.ModelAdmin):
    list_display = ('name', 'text', 'url',)

admin.site.register(Button, ButtonAdmin)

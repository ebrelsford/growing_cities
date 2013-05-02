from django.contrib import admin

from moderation.admin import ModerationAdmin

from .models import Story

class StoryAdmin(ModerationAdmin):
    list_display = ('title', 'image', 'video_url', 'featured', 'order',)
    list_editable = ('featured', 'order',)
    list_filter = ('featured',)

admin.site.register(Story, StoryAdmin)

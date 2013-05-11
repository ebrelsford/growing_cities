from django.contrib import admin

from growing_cities.moderators import SiteModerationAdmin
from .models import Story


class StoryAdmin(SiteModerationAdmin):
    list_display = ('title', 'image', 'video_url', 'featured', 'order',)
    list_editable = ('featured', 'order',)
    list_filter = ('featured',)

admin.site.register(Story, StoryAdmin)

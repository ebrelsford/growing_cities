from django.contrib import admin

from .models import Video


class VideoAdmin(admin.ModelAdmin):
    list_display = ('name', 'external_site', 'added',)
    list_filter = ('external_site', 'added',)
    search_fields = ('name', 'description',)


admin.site.register(Video, VideoAdmin)

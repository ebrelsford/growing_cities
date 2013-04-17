from django.contrib import admin
from django.contrib.contenttypes import generic

from moderation.admin import ModerationAdmin

from inplace.admin import PlaceAdmin
from photos.models import Photo
from videos.models import Video
from .models import Activity, GrowingPlace


class ActivityAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'order',)


class PhotoInline(generic.GenericTabularInline):
    model = Photo


class VideoInline(generic.GenericTabularInline):
    model = Video


class GrowingPlaceAdmin(ModerationAdmin, PlaceAdmin):
    fieldsets = (
        (None, {
            'fields': (
                ('name',),
                ('mission',),
            ),
        }),
        ('Contact', {
            'fields': (
                ('url', 'contact',),
            ),
        }),
        ('Activities', {
            'fields': (
                ('activities',),
            ),
        }),
        PlaceAdmin.get_address_fieldset(),
        PlaceAdmin.get_geo_fieldset(),
    )
    inlines = (PhotoInline, VideoInline)
    search_fields = ('city', 'state_province', 'name',)

admin.site.register(Activity, ActivityAdmin)
admin.site.register(GrowingPlace, GrowingPlaceAdmin)

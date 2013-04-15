from django.contrib import admin
from django.contrib.contenttypes import generic

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


class GrowingPlaceAdmin(PlaceAdmin):
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

admin.site.register(Activity, ActivityAdmin)
admin.site.register(GrowingPlace, GrowingPlaceAdmin)

from django.contrib import admin
from django.contrib.contenttypes import generic

from inplace.admin import PlaceAdmin
from photos.models import Photo
from .models import GrowingPlace


class PhotoInline(generic.GenericTabularInline):
    model = Photo


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
        PlaceAdmin.get_address_fieldset(),
        PlaceAdmin.get_geo_fieldset(),
    )
    inlines = (PhotoInline,)

admin.site.register(GrowingPlace, GrowingPlaceAdmin)

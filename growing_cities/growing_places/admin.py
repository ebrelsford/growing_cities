from django.contrib import admin

from places.admin import PlaceAdmin
from .models import GrowingPlace


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
                ('url', 'phone',),
            ),
        }),
        PlaceAdmin.get_address_fieldset(),
        PlaceAdmin.get_geo_fieldset(),
    )
    #exclude = ('polygon',)

admin.site.register(GrowingPlace, GrowingPlaceAdmin)

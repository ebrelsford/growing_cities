from django.contrib import admin

from growing_cities.moderators import SiteModerationAdmin
from .models import Screening, Venue


class ScreeningAdmin(SiteModerationAdmin):
    list_display = ('time', 'price', 'venue', 'url',)


class VenueAdmin(admin.ModelAdmin):
    fields = ('name', 'address_line1', 'city', 'state_province',
              'postal_code',)
    list_display = ('name', 'city', 'state_province',)

admin.site.register(Screening, ScreeningAdmin)
admin.site.register(Venue, VenueAdmin)

from django.contrib import admin

from moderation.admin import ModerationAdmin

from .models import Screening, Venue


class ScreeningAdmin(ModerationAdmin):
    list_display = ('time', 'price', 'venue',)


class VenueAdmin(admin.ModelAdmin):
    fields = ('name', 'address_line1', 'city', 'state_province',
              'postal_code',)
    list_display = ('name', 'city', 'state_province',)

admin.site.register(Screening, ScreeningAdmin)
admin.site.register(Venue, VenueAdmin)

from django.contrib import admin

from .models import Screening, Venue


class ScreeningAdmin(admin.ModelAdmin):
    list_display = ('time', 'price', 'venue',)


class VenueAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state_province',)

admin.site.register(Screening, ScreeningAdmin)
admin.site.register(Venue, VenueAdmin)

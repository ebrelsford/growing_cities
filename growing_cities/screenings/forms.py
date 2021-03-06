from django import forms
from django.utils.translation import ugettext_lazy as _


class HostScreeningForm(forms.Form):

    date = forms.DateField(label=_('On what day will the screening be held?'))
    time = forms.TimeField(
        label=_('What time will the screening start?'),
        input_formats=('%H:%M %p',),
    )
    price = forms.DecimalField(
        label=_('How much will the screening cost? (Leave blank if it will be free)'),
        min_value=0,
        max_digits=5,
        decimal_places=2,
        required=False,
    )
    url = forms.URLField(label=_("The screening's url"),
        required=False,
    )
    venue_name = forms.CharField(
        label=_('Location name'),
        max_length=256,
    )
    venue_address_line1 = forms.CharField(
        label=_('Address'),
        max_length=150,
        required=False,
    )
    venue_city = forms.CharField(
        label=_('City'),
        max_length=50,
    )
    venue_state_province = forms.CharField(
        label=_('State'),
        max_length=40,
    )
    venue_postal_code = forms.CharField(
        label=_('Zip'),
        max_length=10,
        required=False,
    )

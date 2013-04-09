from django import forms
from django.utils.translation import ugettext_lazy as _

from contact_form.forms import BasicContactForm


class GrowingCitiesContactForm(BasicContactForm):
    name = forms.CharField(
        label=_(u'Your name'),
        max_length=100,
        widget=forms.TextInput(attrs={ 'placeholder': _(u'Your name'), }),
    )
    email = forms.EmailField(
        label=_(u'Your email address'),
        max_length=200,
        widget=forms.TextInput(
            attrs={ 'placeholder': _(u'Your email address'), }
        ),
    )
    body = forms.CharField(
        label=_(u'Your message'),
        widget=forms.Textarea(
            attrs={ 'placeholder': _(u'Your message'), }
        ),
    )

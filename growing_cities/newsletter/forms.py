from django import forms
from django.utils.translation import ugettext_lazy as _


class SignupForm(forms.Form):
    email = forms.CharField(
        label=_(u'Your email address'),
        max_length=200,
        widget=forms.TextInput(),
    )

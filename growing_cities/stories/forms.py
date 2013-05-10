from django import forms
from django.utils.translation import ugettext_lazy as _

from moderation.forms import BaseModeratedObjectForm

from .models import Story


class StoryForm(BaseModeratedObjectForm):

    text = forms.CharField(
        label=_(u'Description'),
        max_length=200,
        required=False,
        widget=forms.Textarea(),
    )

    class Meta:
        exclude = ('featured', 'order',)
        model = Story

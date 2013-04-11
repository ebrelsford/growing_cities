from django import forms
from django.utils.translation import ugettext_lazy as _

from moderation.forms import BaseModeratedObjectForm

from .models import Story


class StoryForm(BaseModeratedObjectForm):
    title = forms.CharField(
        label=_(u'Title'),
        max_length=200,
        widget=forms.TextInput(attrs={ 'placeholder': _(u'title'), }),
    )

    video_url = forms.CharField(
        label=_(u'Video URL'),
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={ 'placeholder': _(u'video URL'), }),
    )

    text = forms.CharField(
        label=_(u'Text'),
        max_length=200,
        required=False,
        widget=forms.Textarea(attrs={
            'placeholder': _(u'the text of your story'),
        }),
    )

    featured = forms.BooleanField(
        initial=False,
        required=False,
        widget=forms.HiddenInput
    )

    class Meta:
        model = Story

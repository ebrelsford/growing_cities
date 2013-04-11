from django import forms

from moderation.forms import BaseModeratedObjectForm

from .models import Story


class StoryForm(BaseModeratedObjectForm):
    featured = forms.BooleanField(
        initial=False,
        required=False,
        widget=forms.HiddenInput
    )

    class Meta:
        model = Story

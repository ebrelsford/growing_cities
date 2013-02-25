from moderation.forms import BaseModeratedObjectForm

from .models import Story


class StoryForm(BaseModeratedObjectForm):

    class Meta:
        model = Story
        exclude = ('featured',) # TODO this isn't always excluded...

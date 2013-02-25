from django.contrib.sites.models import Site
from django.db import models
from django.utils.translation import ugettext_lazy as _

from moderation import moderation
from moderation.moderator import GenericModerator


class Story(models.Model):
    """
    A (user-submitted) story.

    """
    title = models.CharField(_('title'),
        max_length=200,
    )
    image = models.ImageField(
        upload_to='stories',
        verbose_name=_('image'),
        null=True,
        blank=True,
    )
    video_url = models.URLField(_('video url'),
        null=True,
        blank=True,
    )
    text = models.TextField(_('text'),
        null=True,
        blank=True,
    )
    featured = models.BooleanField(_('featured'),
        default=False,
    )

    class Meta:
        verbose_name_plural = _('stories')

    @models.permalink
    def get_absolute_url(self):
        return ('stories:story_detail', (), { 'pk': self.pk })

    def __unicode__(self):
        return self.title


class StoryModerator(GenericModerator):
    auto_reject_for_anonymous = False
    notify_moderator = True

    def inform_moderator(self, content_object, extra_context=None):
        extra_context = {
            'site': Site.objects.get_current(),
        }
        super(StoryModerator, self).inform_moderator(content_object,
                                                      extra_context)

moderation.register(Story, StoryModerator)

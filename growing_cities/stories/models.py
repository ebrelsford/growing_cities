from django.db import models
from django.utils.translation import ugettext_lazy as _

from moderation import moderation

from growing_cities.moderators import SiteModerator


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
        default=True,
    )

    class Meta:
        verbose_name_plural = _('stories')

    @models.permalink
    def get_absolute_url(self):
        return ('stories:story_detail', (), { 'pk': self.pk })

    def __unicode__(self):
        return self.title

moderation.register(Story, SiteModerator)

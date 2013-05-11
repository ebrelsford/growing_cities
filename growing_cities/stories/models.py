from django.db import models
from django.utils.translation import ugettext_lazy as _

from imagekit.models import ImageSpecField
from imagekit.processors.resize import ResizeToFit
from moderation import moderation

from growing_cities.moderators import ModeratedMixin, SiteModerator


class Story(ModeratedMixin, models.Model):
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
    thumbnail = ImageSpecField(
        [ResizeToFit(300, 150)],
        source='image',
        format='JPEG',
        options={'quality': 90}
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
    order = models.PositiveIntegerField(_('order'), default=0)

    class Meta:
        ordering = ('order',)
        verbose_name_plural = _('stories')

    @models.permalink
    def get_absolute_url(self):
        return ('stories:story_detail', (), { 'pk': self.pk })

    def __unicode__(self):
        return self.title

moderation.register(Story, SiteModerator)

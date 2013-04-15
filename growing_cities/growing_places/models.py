from django.contrib.contenttypes import generic
from django.db import models
from django.utils.translation import ugettext_lazy as _

from inplace.models import Place
from photos.models import Photo
from videos.models import Video


class GrowingPlace(Place):
    contact = models.CharField(_('contact'),
        max_length=300,
        null=True,
        blank=True,
    )
    mission = models.TextField(_('mission'),
        null=True,
        blank=True,
    )
    url = models.URLField(_('url'),
        null=True,
        blank=True,
    )

    photos = generic.GenericRelation(Photo)
    videos = generic.GenericRelation(Video)

    activities = models.ManyToManyField('Activity',
        blank=True,
        null=True,
        verbose_name=_('activities')
    )

    def __unicode__(self):
        return self.name


class Activity(models.Model):
    name = models.CharField(_('name'),
        max_length = 100,
    )
    description = models.TextField(_('description'),
        null=True,
        blank=True,
    )
    order = models.PositiveIntegerField(_('order'), default=0)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('order',)
        verbose_name_plural = _('activities')

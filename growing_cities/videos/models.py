from django.contrib.contenttypes import generic
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.models import User
from django.db import models
from django.utils.translation import ugettext_lazy as _


class Video(models.Model):
    content_type = models.ForeignKey(ContentType)
    object_id = models.PositiveIntegerField()
    content_object = generic.GenericForeignKey('content_type', 'object_id')

    name = models.CharField(_('name'), max_length=256, null=True, blank=True)
    description = models.TextField(_('description'), null=True, blank=True)
    added = models.DateTimeField(auto_now_add=True)
    added_by = models.ForeignKey(User, null=True, blank=True)

    EXTERNAL_SITE_CHOICES = (
        ('vimeo', 'vimeo'),
        ('youtube', 'youtube'),
    )
    external_site = models.CharField(_('external site'), max_length=256,
                                     choices=EXTERNAL_SITE_CHOICES)
    external_id = models.CharField(_('external id'), max_length=100)

    def __unicode__(self):
        return self.name

from django.db import models
from django.utils.translation import ugettext_lazy as _

from imagekit.models import ImageSpecField
from imagekit.processors.resize import ResizeToFit


class HowTo(models.Model):
    name = models.CharField(_('name'),
        max_length=200,
    )
    image = models.ImageField(_('image'),
        upload_to='books',
        blank=True,
        null=True,
    )
    thumbnail = ImageSpecField(
        [ResizeToFit(100, 100)],
        source='image',
        format='JPEG',
        options={'quality': 90}
    )
    text = models.TextField(_('text'),
        blank=True,
        null=True,
    )
    link = models.URLField(_('link'))
    order = models.PositiveIntegerField(_('order'), default=0)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('order',)
        verbose_name = _('how-to')
        verbose_name_plural = _('how-tos')

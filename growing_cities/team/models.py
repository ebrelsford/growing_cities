from django.db import models
from django.utils.translation import ugettext_lazy as _

from imagekit.models import ImageSpecField
from imagekit.processors.resize import SmartResize


class TeamMember(models.Model):
    name = models.CharField(max_length=200)
    title = models.CharField(max_length=200)
    bio = models.TextField()
    order = models.IntegerField(default=0)

    original_image = models.ImageField(_('original image'),
                                       upload_to='team_photos')
    formatted_image = ImageSpecField(source='original_image',
                                     format='JPEG', options={'quality': 90})
    thumbnail = ImageSpecField([SmartResize(100, 100)],
                               source='original_image', format='JPEG',
                               options={'quality': 90})

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('order',)

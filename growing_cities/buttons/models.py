from django.db import models
from django.utils.translation import ugettext_lazy as _


class Button(models.Model):
    name = models.CharField(_('name'), max_length=50)
    text = models.CharField(_('text'), max_length=50)
    url = models.CharField(_('url'), max_length=200)

    def __unicode__(self):
        return self.name

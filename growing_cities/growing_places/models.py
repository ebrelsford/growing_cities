from django.db import models
from django.utils.translation import ugettext_lazy as _

from places.models import Place


class GrowingPlace(Place):
    phone = models.CharField(_('phone'),
        max_length=25,
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

    # TODO tags

    def __unicode__(self):
        return self.name

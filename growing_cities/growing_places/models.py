from django.db import models
from django.utils.translation import ugettext_lazy as _

from inplace.models import Place


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

    # TODO tags

    def __unicode__(self):
        return self.name

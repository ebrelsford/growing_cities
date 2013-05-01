from django.db import models
from django.utils.timezone import get_current_timezone
from django.utils.translation import ugettext_lazy as _

from inplace.models import Place
from moderation import moderation

from growing_cities.moderators import SiteModerator


class Screening(models.Model):
    """
    A screening.

    """
    time = models.DateTimeField(_('time'))
    price = models.DecimalField(_('price'),
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True,
    )
    venue = models.ForeignKey('Venue')

    def __unicode__(self):
        try:
            time = self.time.astimezone(get_current_timezone())
        except Exception:
            time = self.time
        return u'%s: %s' % (self.venue.name, time.strftime('%b %d, %Y at %I:%M %Z'))


class Venue(Place):
    def __unicode__(self):
        return self.name or u'%d' % self.pk

moderation.register(Screening, SiteModerator)

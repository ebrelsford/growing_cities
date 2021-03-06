from django.db import models
from django.utils.translation import ugettext_lazy as _


class Product(models.Model):
    name = models.CharField(_('name'),
        max_length=200,
    )
    image = models.ImageField(_('image'),
        upload_to='products',
        blank=True,
        null=True,
    )
    text = models.TextField(_('text'),
        blank=True,
        null=True,
    )
    paypal_button = models.TextField(_('paypal button'))
    order = models.PositiveIntegerField(_('order'), default=0)

    def __unicode__(self):
        return self.name

    class Meta:
        ordering = ('order',)

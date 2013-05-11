from django.contrib.auth.models import User
from django.contrib.sites.models import Site
from django.db import models

from moderation.admin import ModerationAdmin
from moderation.models import MODERATION_STATUS_APPROVED
from moderation.moderator import GenericModerator


class ModeratedMixin(models.Model):
    added_by = models.ForeignKey(User, blank=True, null=True, editable=False)

    class Meta:
        abstract = True


class SiteModerator(GenericModerator):
    """
    A moderator used site-wide for Growing Cities. All moderated objects using
    this moderator must include ModeratedMixin.

    """
    auto_approve_for_staff = True
    auto_reject_for_anonymous = False
    notify_moderator = True
    notify_user = False

    def inform_moderator(self, obj, extra_context={}):
        # Don't inform moderators if object has been approved
        if obj.moderated_object.moderation_status == MODERATION_STATUS_APPROVED:
            return

        # Don't inform moderators if object added by staff--will be approved
        # anyway.
        if obj.added_by and obj.added_by.is_staff:
            return

        # Add site to context to get full URL
        extra_context['site'] = Site.objects.get_current()
        super(SiteModerator, self).inform_moderator(obj, extra_context)


class SiteModerationAdmin(ModerationAdmin):

    def save_model(self, request, obj, form, change):
        obj.added_by = request.user
        super(SiteModerationAdmin, self).save_model(request, obj, form, change)

from django.contrib.sites.models import Site

from moderation.models import MODERATION_STATUS_APPROVED
from moderation.moderator import GenericModerator


class SiteModerator(GenericModerator):
    auto_approve_for_staff = True
    auto_reject_for_anonymous = False
    notify_moderator = True
    notify_user = False

    def inform_moderator(self, obj, extra_context={}):
        # Don't inform moderators if object has been approved
        if obj.moderated_object.moderation_status == MODERATION_STATUS_APPROVED:
            return
        extra_context['site'] = Site.objects.get_current()
        super(SiteModerator, self).inform_moderator(obj, extra_context)

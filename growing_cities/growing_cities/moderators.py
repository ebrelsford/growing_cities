from django.contrib.sites.models import Site

from moderation.moderator import GenericModerator


class SiteModerator(GenericModerator):
    auto_reject_for_anonymous = False
    notify_moderator = True
    notify_user = False

    def inform_moderator(self, content_object, extra_context=None):
        extra_context = {
            'site': Site.objects.get_current(),
        }
        super(SiteModerator, self).inform_moderator(content_object,
                                                      extra_context)

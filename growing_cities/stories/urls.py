from django.conf.urls.defaults import patterns, url
from django.views.generic import TemplateView

from honeypot.decorators import check_honeypot

from .views import CreateStoryView, DetailStoryView, ListStoryView


urlpatterns = patterns('',
    url('^story/add/$',
        check_honeypot(CreateStoryView.as_view()),
        name='story_create'
    ),
    url('^story/add/success/$',
        TemplateView.as_view(
            template_name='stories/story_create_success.html',
        ),
        name='story_create_success'
    ),

    url('^story/list/',
        ListStoryView.as_view(),
        name='story_list'
    ),

    url('^story/(?P<pk>\d+)/$',
        DetailStoryView.as_view(),
        name='story_detail'
    ),
)

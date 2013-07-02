from django.conf.urls.defaults import patterns, url

from .views import EntriesView


urlpatterns = patterns('',
    url('^entries/', EntriesView.as_view(), name='entries_list'),
)

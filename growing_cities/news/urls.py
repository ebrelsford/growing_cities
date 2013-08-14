from django.conf.urls.defaults import patterns, url

from .views import EntriesView, EntryView


urlpatterns = patterns('',

    url('^entry/(?P<pk>\d+)/$',
        EntryView.as_view(),
        name='entry_detail',
    ),

    url('^entries/',
        EntriesView.as_view(),
        name='entries_list'
    ),

)

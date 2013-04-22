from django.conf.urls.defaults import patterns, url

from .views import HostScreeningFormView, HostScreeningCompleted


urlpatterns = patterns('',
    url('^submit/$', HostScreeningFormView.as_view(),
        name='host_screening_form'),
    url('^success/$', HostScreeningCompleted.as_view(),
        name='host_screening_completed'),
)

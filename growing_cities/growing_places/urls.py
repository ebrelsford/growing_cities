from django.conf.urls.defaults import patterns, url

from .views import CityBBOXView


urlpatterns = patterns('',
    url('^citybbox/', CityBBOXView.as_view(), name='gcplace_citybbox'),
)

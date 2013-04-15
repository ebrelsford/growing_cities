from django.conf.urls.defaults import patterns, url

from .views import CityBBOXView, FindCityView, FindPlacesView


urlpatterns = patterns('',
    url('^citybbox/', CityBBOXView.as_view(), name='gcplace_citybbox'),
    url('^city/find/', FindCityView.as_view(), name='gcplace_city_find'),
    url('^places/find/', FindPlacesView.as_view(), name='gcplace_places_find'),
)

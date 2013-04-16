from django.conf.urls.defaults import patterns, url

from .views import (AddPlaceView, CityBBOXView, FindCityView, FindPlacesView,
                    GrowingPlacesGeoJSONListView)


urlpatterns = patterns('',
    url('^citybbox/', CityBBOXView.as_view(), name='gcplace_citybbox'),
    url('^city/find/', FindCityView.as_view(), name='gcplace_city_find'),
    url('^places/add/', AddPlaceView.as_view(), name='gcplace_place_add'),
    url('^places/find/', FindPlacesView.as_view(), name='gcplace_places_find'),
    url('^places/geojson/', GrowingPlacesGeoJSONListView.as_view(),
        name='gcplace_places_geojson'),
)

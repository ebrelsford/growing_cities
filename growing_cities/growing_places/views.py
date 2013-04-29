import json

from django.contrib.gis.geos import Point, Polygon
from django.contrib.gis.measure import D
from django.core.urlresolvers import reverse
from django.http import Http404, HttpResponse
from django.views.generic import CreateView, ListView, TemplateView, View

from fiber.views import FiberPageMixin
from inplace.views import PlacesGeoJSONListView

from .forms import GrowingPlaceForm
from .models import GrowingPlace


class GrowingPlacesGeoJSONListView(PlacesGeoJSONListView):

    def get_queryset(self):
        return GrowingPlace.objects.filter(centroid__isnull=False)


class GrowingPlacesMapView(FiberPageMixin, TemplateView):
    template_name = 'growing_places/map.html'

    def get_context_data(self, **kwargs):
        context = super(GrowingPlacesMapView, self).get_context_data(**kwargs)
        context.update({
            'ip': self._get_ip(),
            'places_url': reverse('gcplace_places_geojson'),
        })
        return context

    def get_fiber_page_url(self):
        return reverse('growing_places_map')

    def _get_ip(self):
        try:
            return self.request.META['HTTP_X_FORWARDED_FOR']
        except Exception:
            return self.request.META['REMOTE_ADDR']


class JSONResponseMixin(object):
    """A simple mixin that can be used to render a JSON response."""
    response_class = HttpResponse

    def render_to_response(self, context, **response_kwargs):
        """
        Returns a JSON response, transforming 'context' to make the payload.
        """
        response_kwargs['content_type'] = 'application/json'
        return self.response_class(
            self.convert_context_to_json(context),
            **response_kwargs
        )

    def convert_context_to_json(self, context):
        """
        Convert the context dictionary into a JSON object.

        Adapted from the Django docs:
            https://docs.djangoproject.com/en/dev/topics/class-based-views/mixins/#jsonresponsemixin-example

        Is very naive, but will suit our purposes.
        """
        return json.dumps(context)


class JSONView(JSONResponseMixin, View):

    def get(self, request, *args, **kwargs):
        return self.render_to_response(self.get_context_data(**kwargs))


class CityBBOXView(JSONResponseMixin, ListView):
    allowed_filters = ('city', 'state_province',)
    model = GrowingPlace

    def get_context_data(self, **kwargs):
        qs = self.get_queryset()
        return {
            'bbox': qs.extent(),
        }

    def get_queryset(self):
        qs = super(CityBBOXView, self).get_queryset()
        qs = qs.filter(**self._get_filters())
        return qs

    def _get_filters(self):
        filters = self.request.GET.dict()
        filters = filter(lambda (k, v): k in self.allowed_filters,
                         filters.items())
        return dict(filters)


class FindPlacesView(JSONResponseMixin, ListView):
    model = GrowingPlace

    def get_context_data(self, **kwargs):
        try:
            qs = self.get_queryset()
            return {
                'bbox': qs.extent(),
                'places': [self._to_dict(place) for place in qs],
            }
        except Exception:
            raise Http404

    def get_queryset(self):
        qs = super(FindPlacesView, self).get_queryset()

        # Find places in the bbox
        bbox = self._get_bbox()
        qs = qs.filter(centroid__within=bbox)

        activity_pks = self._get_activity_pks()
        if activity_pks:
            qs = qs.filter(activities__in=activity_pks)

        # Order by distance from the middle of bbox
        return qs.distance(bbox.centroid).order_by('distance')[:25]

    def _get_bbox(self):
        bbox_string = self.request.GET['bbox']
        return Polygon.from_bbox(bbox_string.split(','))

    def _get_activity_pks(self):
        try:
            activity_string = self.request.GET['activities']
            if activity_string == '': return []
            return activity_string.split(',')
        except Exception:
            return []

    def _to_dict(self, place):
        d = {
            'id': place.pk,
            'name': place.name,
            'city': place.city,
            'state_province': place.state_province,
        }
        try:
            d['thumbnail'] = place.photos.all()[0].results_thumbnail.url
        except Exception:
            pass
        return d


class FindCityView(JSONView):
    """
    Returns the closest city within a certain range of a point, if any.

    """

    def get_context_data(self, **kwargs):
        try:
            lon = float(self.request.GET.get('lon', 0))
            lat = float(self.request.GET.get('lat', 0))
        except Exception:
            lon = 0
            lat = 0
        miles = self.request.GET.get('miles', None)
        return {
            'city': self._find_city(lon, lat, miles=miles),
        }

    def _find_city(self, lon, lat, miles=None):
        if not miles: miles = 5
        p = Point(lon, lat, srid=4326)
        places = GrowingPlace.objects.filter(
            centroid__distance_lt=(p, D(mi=float(miles)))
        ).distance(p).order_by('distance')

        if not places: return None
        return '%s, %s' % (places[0].city, places[0].state_province)


class AddPlaceView(CreateView):
    form_class = GrowingPlaceForm
    model = GrowingPlace

    def get_success_url(self):
        return reverse('gcplace_place_add_success')


class AddPlaceSuccessView(TemplateView):
    template_name = 'growing_places/growingplace_add_success.html'
